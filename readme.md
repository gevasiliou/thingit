# THINGIT #    

## Introduction ##
This is an open source attempt to create a platform similar to dweet.io    
Just for fun we can call this project as "thingit", by the word "thing" (IoT).    

"Thingit" will accept JSON data by Data senders / apis /sensors.   
Those data will be available to anyone, just by visiting a simple web page.   

## Primary Concepts
We need a web page that will be dynamically updated with the values of the "data-senders".  
As for know, and until to find a more efficient way to do it, this can be done with the following set up:  

1. Using node.js we have created a "server script" that actually includes a WebSocket Server and a TCP Server.  
2. We have built an html web page with javascript that is actually a Websocket client , connected to the Websocket server.  
3. Data senders send their data to the TCP Port of the same WebSocket server.  
4. Once Data Senders TCP data is received by node.js server, these data are sent (**broadcast**) to all WebSocket clients (= all connected web pages)

## Server Setup - File server.js
This is a node.js file that actually loads net and ws nodejs modules creating two separate servers:  
* WebSocket Server (nodejs ws module) for Connection of our html page.  
* TCP (nodejs net module) server for connection of the data senders.  

The main purpose is to receive data from TCP port and forward this data to WebSocket clients (one or more connected web pages).  

Run the server on linux command line with node.js like this:  
*node server.js*

## HTML Client - file client.html
This html client runs a java script and establishes a connection to our websocket server.  
        
    const socket = new WebSocket('ws://localhost:8080'); // Adjust URL if needed

If a message is received by the web socket server, this message is automatically displayed on our browser:   
    socket.onmessage = (event) => {
       const receivedData = JSON.parse(event.data);
       document.getElementById('data-display').innerText = JSON.stringify(receivedData);
    };

Run the client by your web broswer using **file open** of your browser and select the file client.html    

Tip: If you don't see the Toolbar Top Menu on your browser just hit "alt" inside browser since it is common this toolbar to be autohided.   

Make sure that browser console is open (i.e Developer Tools in FireFox) since console.log messages and errors appear in this console.    

## Data-Sender connection to server.js 
Assuming that wsserver.js is running on a CLI instance, open a new command line terminal and use telnet for server testing like this:    
    telnet localhost 3000  
    Connected to localhost.  
    Escape character is '^]'.  
    {"Temperature":"25"}  

If everything is set up correctly you should see this json string in your browswer, automatically injected in web page wsclient.html

Tip: If by Telnet you sent a non valid json string, your browser will not be able to display the text and browser console will complain
about improper json string received by javascript json parser.

## TODO
1. Connect a real "data-sender" and see if those data are correctly sent to wsclient.html  
Keep in mind that Teltonika data-senders are actually transmitting a complete web page , not just json.  
One way is to "push" the whole web page to Javascript.   
Another way is to "isolate" the incoming json from the Teltonika stream , and forward this json to your web page or store it in disk.  

2. Find a reliable way to "serve" the web page client.html with out the need to open this file by Browser "open file" menu.  
One idea would be to have a third http server in the same file server.js raising the number of "services" running to three:  
a. TCP Server that will be used for data-senders connection  
b. WebSocket Server will be used by Javascript inside client.html  
c. HTTP Server will be used to "serve" to web browsers the file client.html   

3. Create a Rest API Endpoint that will directly receive json data from data-senders like teltonika router.  
Data transmitted by Teltonika router have this format by default:  
POST / HTTP/1.1  
Host: 10.0.0.2:3000  
Accept: */*  
Content-Length: 26  
Content-Type: application/x-www-form-urlencoded  

{"VR":[20682,20477,20383]}  

In Teltonika routers , you are allowed to insert custom headers. 
You have to add customer header "Content-Type: application/json" for correct parsing of the json string by this api otherwise json parser fails.

## Sources - Docs  
https://www.piesocket.com/blog/nodejs-websocket    
https://reqbin.com/req/v0crmky0/rest-api-post-example    
https://reqbin.com/req/curl/y49bnbn3/test-json-response-online    

## Tools
In the "Tools" Folder in this repo we have a lot of simple tools that can be loaded with node command.    

**tcpserver.js**    
Usage *node tcpserver.js* - Super simple tcp listening server.  
You can connect to this tcpserver using as a client *telnet localhost 8080* .   
Every message typed in telnet window will be sent to tcpserver and the tcpserver will send the same message back to client.  
Actually even real data senders can get connected to this tcpserver.js and nodejs will just print out the messages received.  
It is equivalent to **ncat -l -k -p 8080**    
    
**wsserver.js**   
Usage *node wsserver.js* - Super Simple WebSocket Server  
Connet to it with **wsclient.html** (File -> Open -> Select local file by your browser window)   
Just make sure to have browser console open to see the corresponding server/client connect messages.  
     
**restapi.js**   
Usage *node restapi.js*   
A Generic restapi, working as a server.     
Receives either "post" or "get" requests by IoT devices and prints the json content on the screen (server window).   

*Testing API with POST*  
telnet localhost 3000 - paste bellow block in telnet window:   
POST / HTTP/1.1   
Host: localhost:3000   
Accept: *\/\*   
Content-Length: 60   
Content-Type: application/json   

{"DT":"18/11/2023 06:19:01","Volt1-2-3":[20839,20764,20712]}   

Another way to test this restapi is to use **curl** like bellow:   
curl --header "Content-Type:application/json" --header "Accept: application/json" --request POST --data '{"DT":"08/11/2023 16:35:48","VR":[20906,20761,20739]}' localhost:3001    
PS: Actually curl can be used to test any server in this repo.  

*Testing API with GET*    
curl 'localhost:3000/?volt1=400&Current1=110'   
$${\color{green}Green}$$    
