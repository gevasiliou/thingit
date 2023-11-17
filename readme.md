## Introduction
This is an open source attempt to create a platform similar to dweet.io
Just for fun we can call this project as "thingit", by the word "thing" (IoT).

"Thingit" will accept JSON data by Data senders / apis /sensors and those data will be available to anyone, just by visiting
a simple web page.No registration - No fees required.

## Primary Concepts
We need a web page that will be dynamically updated with the values of the "data-senders".
As for know, and until to find a more efficient way to do it, this can be done with the following set up:

1. Using node.js we have created a "server script" that actually includes a WebSocket Server and a TCP Server.
2. We have built an html web page with javascript that is actually a Websocket client , connected to the Websocket server.
3. Data senders send their data to the TCP Port of the same WebSocket server.
4. Once Data Senders TCP data is received by node.js server, these data are sent (**broadcast**) to all WebSocket clients (= all connected web pages)

## Node.JS Server Setup
    const net = require('net');
    const WebSocket = require('ws');

    // Create a WebSocket server for web clients
    const wss = new WebSocket.Server({ port: 8080 }); // Adjust the port number

    // Array to store connected WebSocket clients
    const clients = [];

    wss.on('connection', (ws) => {
      clients.push(ws);  //ws is the WebSocket Client, push is the method to fill the clients array
      console.log('[websock-srv]: WebSocket connected');

      ws.on('close', () => {
        // Remove disconnected clients
        clients.splice(clients.indexOf(ws), 1);
      });

      ws.on('message', (message) => {
        console.log(`[websock-srv]: Received message from WebSocket client: ${message}`);
      });

    });

    // Create a TCP server for the "data sender"
    const tcpServer = net.createServer((socket) => {
      console.log('[tcp-srv]: Data sender connected');

      socket.on('data', (data) => {
        const jsonData = data.toString(); // Assuming JSON data is received as a string
        console.log('[tcp-srv]: Received data from data sender:', jsonData);

        // Broadcast the received data to all WebSocket clients
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(jsonData);
          }
        });
      });

      socket.on('end', () => {
        console.log('[tcp-srv]: Data sender disconnected');
      });
    });

    tcpServer.listen(3000, () => {
      console.log('TCP server listening on port 3000');
    });

Run the server on linux command line with node.js like this:
*node ws-server.js*

## HTML Client
create an html file (i.e wsclient.html) including this code:    

    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Data Receiver</title>
    </head>
    <body>
        Hello from HTML    
        <div id="data-display"></div>
        
        <script>
            const socket = new WebSocket('ws://localhost:8080'); // Adjust URL if needed

            socket.onopen = () => {
                console.log('[client]: WebSocket connected');
            };

            socket.onmessage = (event) => {
                const receivedData = JSON.parse(event.data);
                // Update your web page with the received data
                document.getElementById('data-display').innerText = JSON.stringify(receivedData);
            };

            socket.onclose = () => {
                console.log('WebSocket connection closed');
            };
        </script>
    </body>
    </html>

Run the client by your web broswer using **file open** of your browser - select the file wsclient.html
Make sure to have access to browser console (i.e Developer Tools in FireFox) since console.log messages and errors appear in this console.

## Data-Sender connection to ws-sender.js 
Assuming that ws-server.js is running on a CLI instance, open a new command line terminal and use telnet for node-server testing like this:
    telnet localhost 3000
    Connected to localhost.
    Escape character is '^]'.
    {"Temperature":"25"}

If everything is set up correctly you should see this json string in your browswer, automatically injected in web page wsclient.html

Tip: If by Telnet you sent a non valid json string, your browser will not be able to display the text and browser console will complain
about improper json string received by javascript json parser.

## TODO
1. Connect a real "data-sender" and see if those data are correctly sent to wsclient.html

## Sources - Docs 
