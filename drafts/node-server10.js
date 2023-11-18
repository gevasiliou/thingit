// This is only a websocket server.
// source: https://www.piesocket.com/blog/nodejs-websocket
// To test the server see the file node-client10.html
// important: Open the html file by browser File - Open File method
// Importing the required modules
const WebSocketServer = require('ws');
 
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })
 
// Creating connection using websocket
wss.on("connection", ws => {
    console.log("[srv]: new client connected");
 
    // sending message to client
    ws.send('[srv]:Welcome, you are connected!');
 
    //on message from client
    ws.on("message", data => {
        console.log(`[srv]: Client has sent us: ${data}`)
    });
 
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        console.log("[srv]: the client has connected");
    });
    // handling client connection error
    ws.onerror = function () {
        console.log("[srv]: Some Error occurred")
    }
});
console.log("[srv]: The WebSocket server is running on port 8080");
