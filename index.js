const { program } = require('commander');
const http = require('node:http');
const fs = require('fs');
const url = require('url');
const { XMLBuilder } = require('fast-xml-parser');
const builder = new XMLBuilder();
program
  .requiredOption('-i, --input <file>', 'Input file JSON')
  .requiredOption('-h,--host <string>', 'Input IP adress of server')
  .requiredOption('-p,--port <number>', 'Input Port')
  .configureOutput({
    writeErr: () => { }
  });
program.exitOverride();

try {
  program.parse(process.argv);
} catch (err) {
  // Якщо не вказано обов'язкову опцію
  if (err.code === 'commander.missingMandatoryOptionValue' ||
    err.code === 'commander.optionMissingArgument' ||
    err.message.includes('required option')) {
    console.error('Please, specify  file, host, port');
    process.exit(1);
  }
  throw err;
}


const options = program.opts();

// Читання та парсинг JSON
let houses;
// Перевірка існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}


const server = http.createServer((req, res) => {

  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;

  fs.readFile(options.input, 'utf8',(err,rawData) => {
if(err){
  res.writeHead(500);
    res.end('Error reading file');
    return;
} try{
const houses = JSON.parse(rawData);
let filteredHouses = houses;
  if (query.furnished === 'true') {
    filteredHouses = filteredHouses.filter(h => h.furnishingstatus === 'furnished');
  }
  if (query.max_price) {
    const maxPrice = Number(query.max_price);
    filteredHouses = filteredHouses.filter((h) => h.price < maxPrice);
  }
  const furnished = query.furnished;      // "true" (рядок!)
  const maxPrice = query.max_price;       // "5000000" (рядок!)

  filteredHouses.forEach(house => {
    console.log('Furnished:', furnished);
    console.log('Max Price:', maxPrice);
  });

  const xmlData = { houses: { house: filteredHouses } };
  const xmlOutput = builder.build(xmlData);
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(xmlOutput);
}catch(parseError) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error parsing JSON file');
}
});
});
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(options.port, options.host);
    }, 1000);
  } else {
    console.error('Server error:', e.message);
  }
});
server.listen(options.port, options.host, () => {
  console.log(`Server running on http://${options.host}:${options.port}`);
});
