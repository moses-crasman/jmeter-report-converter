# JMeter report converter

JMeter cannot include response headers when exporting reports directly to CSV.

This node.js script converts XML reports from JMeter into CSV format, including cache-related fields from each response's header.

## Installation

```sh
$ git clone git@github.com:moses-crasman/jmeter-report-converter.git
$ cd jmeter-report-converter
$ nvm use
$ npm i
```

## Usage

```sh
$ npm start --in MyExampleReport.xml
```

or

```sh
$ node index.js --in MyExampleReport.xml
```

## Options

The script supports the following command line options:

- `--in` – determines the input XML file path
- `--out` – determines the output CSV file path (defaults to input filename, with CSV extension)
- `--?` – Displays help message

