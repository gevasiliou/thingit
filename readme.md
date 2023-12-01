# THINGIT #    

## Introduction to dweet.io ##
For those not familiar already with dweet.io, this platform allows almost anything to send data to dweet.io either by post or by get methods.  
A "sending" API can send json data to dweet.io using post.   
A program / user / whatever can send data to dweet.io using the GET format like bellow:  
*https://dweet.io/dweet/for/thing/a-thing-name/?key1=value1&key2=value2*    
(tip: Combine aboce command with curl and see the results)    

dweet sends a success response in json format back to the data-sender.   
You can see the data received for 'a-thing-name' by visiting https://dweet.io/follow/a-thing-name  
dweet.io for the time being is free - free version has limited history tracking and the "dweets" are public for every = no privacy    

## Introduction to Thingit ##
'Thingit' is an attempt to create a platform similar to dweet.io, but also providing more tools to the users.    
We call this project as "thingit", by the word "thing" (IoT) and "it" = any thing out there that can send us data.    

"Thingit" will accept data (either json data or key=val pairs) received by POST or GET by Data senders (apis, sensors, routers, etc).   
Those data will be available to anyone, just by visiting a simple web page.   
The html (client) page will be dynamically updated and display the keys-values pairs as received by "data-senders".  

## Primary Concepts ##   
Based on our research we have bellow basic APIs:     
- Typical API: An intermediate app, accepts requests by the users, collects the requested data by the API server and responds back to the requestor with json the required data.   
- API Server: A Server in listen mode , listen for requests and respond to those requests with json data, usually retrieved by a database.   

When dealing with IoT we have   
- REST APIS: Can be any app exchanging / serving json data in all directions:   
             - collecting data by data sender and print/store/these data   
             - sending data to user upon request (collected by somewhere like database or live)  

- Data-Sender: Continuously sending data in json format to any listening server.    


ThingIt is actually a REST API Server customized to accept json by data-senders, print this json and also forward this json received to html clients.  

You need to have node.js and npm (nodejs packet manager) installed in your machine to make ThingIt work.  
Also you need to install the followind nodejs modules:  
`npm install ws path http express body-parser`  


## Server Setup ##
`node restapi-ws-http.js`  
The server `restapi-ws-http.js` actually contains three different services:  
- REST API Listening Server - port 3000, using node express module, receives data by data-senders 
- WebSocket Server - port 8080, using node ws module, to allow html pages to get connected to nodejs server 
- http Web Server - port 8888, using node http module, to serve the client (html) file to browsers.  

REST API Server listens for incoming data received using POST or GET method by data-senders and extracts the json from the data stream   
json extracted can be printed or sent to html page. 

WebSocket Server is used by web pages - html files - Those html pages are connected to websocket server of restapi server.   
As soon as API Listening Server receives data by "data senders" these data are published to all connected clients (web pages)   

HTTP Web Server, serves the html pages to your browser. Just open your browswer and visit localhost:8888/rawclient.html   
html client using javascript gets connected to websocket (ws) server of restapi server. 
As soon as data are sent by the data-senders to API Server, these data are published by WebSocket Server to websocket clients (html pages) and those data will be displayed in your browser.  

## HTML Client ##
html page / client using javascript to establish connection to our websocket server (ws) in resrapi-ws-http.js server.

**raw-client.html**      : Is connected on WebSocket server and every time new data are received by ws those data are displayed on web page.   
                           Data are printed as raw json string and also as key-val pairs   

For different implementations of client files check the tools folder. 

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

Teltonika is equipped with two different services:  
* one service collects modbus data from slaves (data-collector)   
* a second service send those data to remote server (data-sender)    


**Services -> Modebus -> Modbus TCP Master** (data collector)    
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


**Services -> Modbus -> Modbus Data to Server** (data-sender)   
This has to be enabled with following parameters:    
Record Format: {"DT":"%d","%r":%a}   
Record Count: 1   
No Additional Formatting : selected   
URL: 10.0.0.2:3000   
Data Filtering: All Data    
Retry on fail : enabled   
Custom Header : Content-Type: application/json    

`tip 1`: 
Pay attention to the Record/JSON Format and the use of "correct" double quotes, especially when you try to post in dweet.io   
It has been proved that in some cases we had wrong type of double quotes.  
ps: I really don't know how someone can echo wrong double quotes....   
With wrong type of double quotes data-sender to dweet.io fails.  
Theoritically, if you copy-paste above record format you should be fine for dweet.io  

`tip 2`:
It has been proved that "data collector" stores the modbus data in a local file.  
If the data collector is requested to gather more registers those values are stored as separate json strings in this file.
I would expect Teltonika to combine the data received on the same timestamp and transmit one big json, but this is not how Teltonika works.   
"Data sender" sends one, two, or more separate json strings (depending on the data saved by the data-collector) and all those json string will have the same DT timestamp.  

`tip 3`:
If the data collector service collects data every 15 seconds from slave and write those data to local file, then if data sender is adjusted to "send" data  
every 60 seconds, the sender will send 4 strings - each string will have it's own DT stamp.  

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

tip: If you need to include more modbus registers, do not create more modbus-senders to server.  
Just edit `Modbus TCP Master - Requests Configuration` and add more registers in this sections.  
It has been proved that all requests are logged inside teltonika as a separate line of the same file  
(same timestamp, different description, different values) and data sender will send all the json lines at once (separate messages sent, same timestamp as retrieved by modbus read)  

`example`:   
```
[restapi] Remote IP  ::ffff:10.0.0.1  - Data Received with POST: { DT: '20/11/2023 16:03:45', 'Volt1-2-3': [ 21080, 21013, 20851 ] }
[restapi] Remote IP  ::ffff:10.0.0.1  - Data Received with POST: { DT: '20/11/2023 16:03:45', Power: [ 1115 ] }
[restapi] Remote IP  ::ffff:10.0.0.1  - Data Received with POST: { DT: '20/11/2023 16:03:45', 'Current1-2-3': [ 32, 31, 31 ] }
```

## Sources - Docs - Tips 
- https://www.piesocket.com/blog/nodejs-websocket  
- https://blog.postman.com/how-to-create-a-rest-api-with-node-js-and-express/  
- https://github.com/Freeboard/thingproxy/    
- https://reqbin.com/post-online  
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


**dt-group-client.html** : html client working with main ThingIt server `restapi-ws-http.js` - Works for a specific json format including date-time (DT) as the first field.    
                           This client groups one or more json received under the same "DT" value.  
                           JSON example with DT: {"DT":"18/11/2023 06:19:01","Volt1-2-3":[20839,20764,20712]}   

**table-client.html** : html client specific for json including DT (date-time) as the first field.   
                        Presentation of the json in table view. 
                        Even if more than one json are received with same DT, those jsons are "groupped" in the same table row.    
                        JSON example with DT: {"DT":"18/11/2023 06:19:01","Volt1-2-3":[20839,20764,20712]}   
                        Also check **table-client2.html**  

**chart-client.html** : Chart presentation of the json values received in a specific json format   
                        {"DT":"18/11/2023 06:19:01","Volt1-2-3":[20839,20764,20712]}   
                        If more than one json strings are received with the same DT, they are groupped based on their DT value  

**tcp-server.js**    
Usage *node tcp-server.js* - Simple tcp listening server.  
You can connect to this tcp-server using as a client *telnet localhost 8080* .   
Every message typed in telnet window will be sent to tcp-server and the tcp-server will send the same message back to client.  
Actually even real data senders like Teltonika can get connected to this tcp-server.js and nodejs will just print out the messages received.  
It is equivalent to **ncat -l -k -p 8080**    

**tcp-ws-server.js & jclient.html**    
`tcp-ws-server.js` is a nodejs server that actually uses `net` and `ws` nodejs modules creating two separate servers:  
- WebSocket Server (nodejs ws module) for Connection of our html page at port 8080  
- TCP (nodejs net module) server for connection of the data senders at port 3000

TCP server receives data from TCP port and forward/sends/broadcast those data to WebSocket clients (one or more connected web pages).  
In this implementation, data received by TCP can be anything (texts, messages, invalid json) and will be forwarded to ws clients.
Run the server on linux command line with node.js like this: *node server.js*    

`jclient.html` is an html web page (client) retrieving data by `tcp-ws-server.js` using javascript.  
jclient.html gets connected to WebSocket (ws) server running inside `tcp-ws-server.js` and updates **dynamically** the contents of the web page when new data are sent by ws server.   
You have to manually open this file in your browser (i.e File - Open -> Select client.html)   
Tip: If you don't see the Toolbar Top Menu on your browser just hit "alt" inside browser since it is common this toolbar to be hidden.   
Make sure that browser developer console is open (i.e Developer Tools in FireFox) since console.log messages and errors appear in this console.    

jclient contains three sections:
- Raw Data    
- JSON.stringify(RawData)    
- JSON.parse(RawData)   

Quite usefull tool for server debugging and json format debugging.   
PS: File client.html is similar to jclient.html but only raw data are displayed - no json validation in this tool.
    
**ws-server.js & ws-client.html**       
`ws-server.js` It is just a WebSocket Server   
`ws-client.html` is the corresponding html client - open it in browswer (File -> Open -> Select html file in your browser window)    
Just make sure to have browser console open to see the corresponding server/client connection messages.   
     
**restapi.js**   
`node restapi.js`   
A Generic listening -server- api.     
Receives json strings by "post" or "get" requests send by data-senders, users, etc.   
json strings received are printed on cli screen both in raw and parsed json format.   
This API will break if the data send by data-senders are not valid json.   
As a result this restapi.js can be actually used for "server-side json verification"   

**jsonfetcher.html**  
A simple html page that can fetch (request) json from listening apis.  
For testing you can use the https://dummyjson.com/ which provides dummy json for testing.  
dummyjson has a lot of categories to fetch jsons :  
```
fetch('https://dummyjson.com/products/1')
.then(res => res.json())
.then(json => console.log(json))
```

## ModbusTools Folder ##
In this folder we hold various tools for modbus testing.

**onlinemodbusmaster.html & onlinemodbusmaster.js**  
This html page provides an interface for the user to apply IP/Hostname for the Modbus Slave and as well as other modbus related parameters.  
The data provided in this html page are transferred (with POST) to the relevant backend server onlinemodbusmaster.js.   
This backend nodejs server use `modbus-serial` module to retrieve registers values from the required modbus tcp slave; those values are returning  
(as a response to previous POST) back to the html page.   
First start the server by commandline using `node onlinemodbusmaster.js`   
You should see a message server is up and running on port 3000  
Then open the onlinemodbusmaster.html page , provide the required parameters and press the "Retrieve Data" Button.  
In a few seconds, you should see in html page the values of the requested registers.   
Source of `modbus-serial` module: `https://github.com/yaacov/node-modbus-serial`   

**modbustcpmaster-2.0.js**  
This is a nodejs server file, can run as standalone and can accept various options by command line.  
```
Usage: node script.js [options]

Options:
      --version      Show version number  [boolean]
      --ip           Modbus slave IP or hostname  [string] [required]
      --port         Modbus TCP port  [number] [default: 502]
      --serial       Modbus serial address  [number] [default: 1]
      --reg          Start register address  [number] [required]
      --count        Number of registers to read  [number] [default: 1]
      --regfunction  Modbus function (inputregister/holdingregister)  [string] [default: "inputregister"]
      --autoread     Interval in milliseconds for autoreading registers  [number]
      --runonce      Read the registers once and exit  [boolean] [default: true]
      --csvfile      Name of the CSV file to store register values  [string]
      --jsonfile     Name of the JSON file to store register values  [string]
  -h, --help         Show help  [boolean]

```

Typical usage for "one-shot" register reading:  
`node modbustcpmaster-2.0.js --ip xx.ddns.net --reg 358`  

Combine with --autoread XXX and the server will keep reading registers every XXX mseconds.  
In case --autoread is not provided (server runs in runonce mode) the scripts reads the modbus registers just once and exits.  

Inside script file there is a websocket server running ready to dynamically server html pages.
This websocket server is started only when --autoread is provided, otherwise (runonce mode) websocket server is not enabled.  
To see the register values in your browser, open fie modbustcpmaster.html (only working in --autoread mode)

File **modbustcpmaster-1.1.js** and **modbustcpmaster-1.2.js** in this folder are early version of this script, missing some features like runonce logic, save to csv/json file,etc  

#TODO#
We can expand this server nodejs script and html page by adding some more features like bellow:
- allow backend servers to retrieve modbus data from more than one slaves 
- in html client open and display contents of saved csv/json  
- send the collected modbus register data to another server / client / api (software modbus data sender)  
- make script to work as an answering REST api by providing json responses to the requestor.  
- expand the script to be capable to read settings saved to a setting file i.e using an argument like --settings <settings-file>  
- expand the script to be capable to retrieve modbus registers by more than one host. Could be something like --ip (array of hostnames)  
