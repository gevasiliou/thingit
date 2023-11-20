# THINGIT #    

## Introduction to dweet.io ##
If you are not familiar with dweet.io this platform allows almost anything to send data to dweet.io either by post or by get methods.  
An API can send json data to dweet.io using post.   
A program / user / whatever can send data to dweet.io using the GET format like bellow:  
https://dweet.io/dweet/for/thing/a-thing-name/?key1=value1&key2=value2    
(tip: Combine aboce command with curl and see the results)    
dweet sends a success response json back   
You can see the data received for 'a-thing-name' by visiting https://dweet.io/follow/a-thing-name  
dweet.io for the time being is free - free version has limited history tracking and the "dweets" are public for every = no privacy    

## Introduction to Thingit ##
'Thingit' is an attempt to create a platform similar to dweet.io    
Just for fun we call this project as "thingit", by the word "thing" (IoT).    

"Thingit" will accept data (either json data or key=val pairs) received by POST or GET by Data senders (apis, sensors, routers, etc).   
Those data will be available to anyone, just by visiting a simple web page.   
This web page will be dynamically updated and display the keys-values as received by "data-senders".  

## Primary Concepts ##
For this purpose we have built a nodejs "REST API" server that listens for data.
See the server description bellow for more details.

## Server Setup ##
Usage: `node restapi-ws-http.js`  
The server file `restapi-ws-http.js` actually contains three different services:  
- API Server - port 3000, using node express module, to allow data-senders to get connected and stream data
- WebSocket Server - port 8080, using node ws module, to allow html pages to get connected 
- http Web Server - port 8888, using node http module, to serve the client (html) file to browsers.  

REST API Server listens for incoming data with POST or GET method by data-senders and extracts the json from the data stream   

WebSocket Server is used by web pages - html files that are connected to websocket server of restapi server.   
As soon as restapi receives data by data sender, those data are published to all connected clients (web pages)   

HTTP Web Server , serves the html file to your browser. Just open your browswer and visit localhost:8888/rawclient.html   
html client using javascript get connected to websocket (ws) server of restapi server. 
As soon as data are sent by the data-senders to API Server, those data are published by WebSocket Server to websocket clients (html pages) and those data will be displayed in your browser.  

## HTML Clients ##
html clients that using javascript establishe connection to our websocket server (ws)  inside resrapi-ws-http.js server.

Different implementations of client files:  
**raw-client.html** :   Is connected on WebSocket server and every time new data are received by ws those data are displayed on web page.   
                        Data are printed as raw json string and also as key-val pairs   
                        
**table-client.html** : Presentation of the json in table view. Works only for a specific json format   
                        {"DT":"18/11/2023 06:19:01","Volt1-2-3":[20839,20764,20712]}  
                        Also check **table-client2.html**  

**chart-client.html** : Chart presentation of the json values received in a specific json format   
                        {"DT":"18/11/2023 06:19:01","Volt1-2-3":[20839,20764,20712]}  
                        If more than one json strings are received with the same DT, they are groupped based on their DT value  

## Testing ## 
1. Start the server in command line : `node restapi-ws-http.js`   
2. With broswer open `localhost:8888/raw-client.html`   
3. Testing RESTAPI with POST via TELNET    
Open a new command line terminal and use telnet as data sender : telnet localhost 3000    
Inside telnet (once connected) paste bellow text:
```
POST / HTTP/1.1      
Host: localhost:3000       
Accept: */*      
Content-Length: 60     
Content-Type: application/json    

{"DT":"18/11/2023 06:19:01","Volt1-2-3":[20839,20764,20712]}   
```

If everything is set up correctly you should see this json string (decoded) in your browswer

Tip: If by Telnet you send a non valid json string, your browser will not be able to display the text and browser console will complain
about improper json string received by javascript json parser.

4. Testing RESTAPI with POST via CURL  
curl --header "Content-Type:application/json" --header "Accept: application/json" --request POST --data '{"DT":"08/11/2023 16:35:48","VR":[20906,20761,20739]}' localhost:3000    

5. Testing RESTAPI with GET via CURL    
curl 'localhost:3000/?volt1=400&Current1=110'   
ps: Make sure that you have enclosed uri with `'` chars  

6. Testing with a real data-sender by Teltonika Router RUT955.  
Tested with FW version: RUT9XX_R_00.06.08.6 and 06.08.5     

Teltonika Settings to retrieve modbus registers data by GE350 Device and send them to server.   

**Services -> Modebus -> Modbus TCP Master**     
Name: GE350    
Slave ID: 254    
IP: 192.168.1.168   
Port: 502   
Period: 58    
Timeout: 20    

*Requests Configuration*   
Name : Volt1-2-3    
Data Type: 16-bit unsigned integer    
Function: Read Input Registers (4)    
First Register: 358    
Register Count: 3    
Enabled: Checked   


**Services -> Modbus -> Modbus Data to Server**   
This has to be enabled with following parameters:    
Record Format: {"DT":"%d","%r":%a}   
Record Count: 1   
No Additional Formatting : selected   
URL: 10.0.0.2:3000   
Data Filtering: All Data    
Retry on fail : enabled   
Custom Header : Content-Type: application/json    

`tip`: 
Pay attention to the Record/JSON Format and the use of "correct" double quotes, especially when you try to post in dweet.io   
It has been proved that in some cases we had wrong type of double quotes.  
ps: I really don't know how someone can echo wrong double quotes....   
With wrong type of double quotes data-sender to dweet.io fails.  
Theoritically, if you copy-paste above record format you should be fine for dweet.io  

**Record Format Explanation by Teltonika**    
{"DT":"%d","%r":%a}    
Modbus slave ID - %i    
Binary Modbus slave ID (UINT8) - %I   
Modbus slave IP - %p   
Date (Linux timestamp) - %t   
Date (binary Linux timestamp, UINT32BE) - %T   
Date (Day/Month/Year Hour:Minute:Second) - %d   
Start register number - %s   
Binary start register address (UINT16BE) - %S   
Register data (JSON object) - %a   
Request name - %r   
Slave name - %n   

`tip`: If you need to include more modbus registers, do not create more modbus-senders to server.  
Just edit `Modbus TCP Master - Requests Configuration` and add more registers in this sections.  
It has been proved that all requests are logged inside teltonika as a separate line of the same file  
(same timestamp, different description, different values).  

`example`:   
```
[restapi] Remote IP  ::ffff:10.0.0.1  - Data Received with POST: { DT: '20/11/2023 16:03:45', 'Volt1-2-3': [ 21080, 21013, 20851 ] }
[restapi] Remote IP  ::ffff:10.0.0.1  - Data Received with POST: { DT: '20/11/2023 16:03:45', Power: [ 1115 ] }
[restapi] Remote IP  ::ffff:10.0.0.1  - Data Received with POST: { DT: '20/11/2023 16:03:45', 'Current1-2-3': [ 32, 31, 31 ] }
```
Those three messages are separate json, have the same DT and received by Teltonika Data Sender.

## Sources - Docs - Tips 
- https://www.piesocket.com/blog/nodejs-websocket    
- https://reqbin.com/req/v0crmky0/rest-api-post-example    
- https://reqbin.com/req/curl/y49bnbn3/test-json-response-online    
- Javascript Method (in html client) to update 'data-display':  
```
        socket.onmessage = (event) => {       
        const receivedData = JSON.parse(event.data);       
        document.getElementById('data-display').innerText = JSON.stringify(receivedData);     
        };     
```   

- Tip : In Teltonika routers , you are allowed to insert custom headers.    
You have to add customer header "Content-Type: application/json" for correct parsing of the json string by this api otherwise json parser fails.     

## Tools Folder ##
Various server and client files for troubleshooting and experiments.

**tcp-server.js**    
Usage *node tcp-server.js* - Simple tcp listening server.  
You can connect to this tcp-server using as a client *telnet localhost 8080* .   
Every message typed in telnet window will be sent to tcp-server and the tcp-server will send the same message back to client.  
Actually even real data senders can get connected to this tcp-server.js and nodejs will just print out the messages received.  
It is equivalent to **ncat -l -k -p 8080**    

**tcp-ws-server.js**    
This is a nodejs file that actually loads `net` and `ws` nodejs modules creating two separate servers:  
- WebSocket Server (nodejs ws module) for Connection of our html page at port 8080  
- TCP (nodejs net module) server for connection of the data senders at port 3000

TCP server receives data from TCP port and forward/sends/broadcast those data to WebSocket clients (one or more connected web pages).  
In this implementation, data received by TCP can be anything (texts, messages, invalid json) and will be forwarded to ws clients.
Run the server on linux command line with node.js like this: *node server.js*    

**jclient.html**  
This is an html web page (client) retrieving data using javascript by `tcp-ws-server.js`  
It gets connected to WebSocket (ws) server running inside `tcp-ws-server.js` and updates **dynamically** the contents of the web page when new data are sent by ws server.   
You have to manually open this file in your browser (i.e File - Open -> Select client.html)   
Tip: If you don't see the Toolbar Top Menu on your browser just hit "alt" inside browser since it is common this toolbar to be hidden.   
Make sure that browser developer console is open (i.e Developer Tools in FireFox) since console.log messages and errors appear in this console.    

jclient contains three sections:
- Raw Data    
- JSON.stringify(RawData)    
- JSON.parse(RawData)   

Quite usefull tool for server debugging and json format debugging.   
PS: File client.html is similar to jclient.html but only raw data are displayed - no json validation in this tool.
    
**ws-server.js** and **ws-client.html**       
Usage *node ws-server.js* - Just a WebSocket Server   
Connect to ws-server with ws-client.html (in browswer select File -> Open -> Select html file in your browser window)    
Just make sure to have browser console open to see the corresponding server/client connection messages.   
     
**restapi.js**   
Usage *node restapi.js*   
A Generic restapi, working as a server.     
Receives either "post" or "get" requests by IoT devices and prints raw and parsed json content on the screen (server window).   
This API will break if the data send by data-senders are not valid json.  
As a result this restapi.js can be actually used for "server-side json verification"  

