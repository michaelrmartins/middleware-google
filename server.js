// Server configuration file

const dotenv = require('dotenv');
dotenv.config();

server = require('./app');

console.log("Server is starting...");

const server_ipaddress = process.env.SERVER_IP_ADDRESS;
const server_port = process.env.SERVER_PORT;

server.listen(server_port, () => { console.log(`Server running at http://${server_ipaddress}:${server_port}/`); });
