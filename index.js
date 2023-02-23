const argv = require('minimist')(process.argv);
if(argv.h || argv.help || argv['?']) {
  console.log(`Converts a JMeter XML report into CSV.
Usage:

$ node index.js --in MyReport.xml --out MyConvertedReport.csv

--in    The input file path (required)
--out   The output file path (optional, uses original filename with csv extension by default)
`)
  process.exit();
}
if(!argv.in) throw 'Expected input file argument. Example: npm start --in MyJMeterReport.xml';

const path = require('path');
const inFile = path.join(argv.in);

const fs = require('fs');
const fileContents = fs.readFileSync(inFile).toString();

const { xml2js } = require('xml-js');
let logEntries;
try {
  logEntries = xml2js(fileContents).elements[0].elements;
} catch(e) {
  console.error(`Could not parse XML file "${ inFile }"`);
  process.exit();
}

// See JMeter XML report field names:
// https://jmeter.apache.org/usermanual/listeners.html#attributes
const entryAttributesMap = {
  lb: 'label',
  by: 'bytes',
  lt: 'timeToInitialMS',
  ct: 'timeToConnectMS',
  t: 'timeElapsedMS',
  rc: 'statusCode',
  ts: 'timestamp',
};

const responseHeadersMap = {
  'Cache-Control': 'cache',
  'CF-Cache-Status': 'cloudflare'
};

const tableHeaders = [
  entryAttributesMap,
  responseHeadersMap
].map(Object.values).flat();

const table = logEntries.map(entry => {
  const formatted = Object.fromEntries(
    Object.entries(entryAttributesMap)
      .map(([key, value]) => [value, entry.attributes[key]])
  );
  entry.elements.forEach(subElement => {
    if(subElement.name !== 'responseHeader') return;
    const headers = subElement.elements[0]?.text.split('\n');
    headers.forEach(headerRow => {
      const [field, value] = headerRow.split(': ');
      if(responseHeadersMap[field])
        formatted[responseHeadersMap[field]] = value;
    });
  });
  return formatted;
});

const csvData = [tableHeaders, ...table.map(row => Object.values(row))];
const csv = csvData.map(row => row.map(value => `${value}`).join(';')).join('\n');

let outFile = argv.out ? argv.out : inFile.split('.').shift();
if(!outFile.match(/\.csv^/)) {
  outFile += '.csv';
}

fs.writeFileSync(outFile, csv);
