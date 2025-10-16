const {program}=require('commander');
const http = require('node:http');
const fs=require('fs');
program 
.requiredOption('-i, --input <file>', 'Input file JSON')
.requiredOption('-h,--host <string>','Input IP adress of server')
.requiredOption('-p,--port <number>','Input Port')
.configureOutput({
    writeErr: () => {}  
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

// Перевірка існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Server is running11ddd!');
});
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error('Address in use, retrying...');
    setTimeout(() => {
      server.close();
  server.listen(options.port, options.host);
    }, 1000);
  }else {
    console.error('Server error:', e.message);
  }
}); 
server.listen(options.port, options.host, () => {
  console.log(`Server running on http://${options.host}:${options.port}`);
});
