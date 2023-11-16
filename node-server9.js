const net = require('net');
const http = require('http');
const { Server } = require('socket.io');

// Create an HTTP server for handling regular HTTP requests
const httpServer = http.createServer((req, res) => {
	    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*' // Allowing access from any origin (CORS)
    });
//  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('HTTP server\n');
});

// Start the HTTP server on port 8080
httpServer.listen(8080, () => {
  console.log('HTTP server listening on port 8080');
});

// Create a Socket.IO server
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('Socket.IO client connected');

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected');
  });
});

// Create a TCP server for the "data sender"
const tcpServer = net.createServer((socket) => {
  console.log('Data sender connected');

  socket.on('data', (data) => {
    const jsonData = data.toString(); // Assuming JSON data is received as a string
    console.log('Received data from data sender:', jsonData);

    // Emit the received data to all connected Socket.IO clients
    io.emit('data', jsonData);
  });

  socket.on('end', () => {
    console.log('Data sender disconnected');
  });
});

tcpServer.listen(3000, () => {
  console.log('TCP server listening on port 3000');
});
