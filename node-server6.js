const net = require('net');

const server = net.createServer(socket => {
    socket.write('HTTP/1.1 200 OK\n\nhallo world')
    socket.end((err)=>{console.log(err)})
});

server.listen(8090);

//this piece of shit just works when you open Chrome and visit http://localhost:8090
