import Server from './src/server.js';
var server = new Server();
const configPath = process.argv[2]; 

server.Start(configPath);
