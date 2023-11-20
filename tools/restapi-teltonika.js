const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to handle the incoming POST request
app.post('/', (req, res) => {
  console.log('Received RAW body:', req.body); // Log the raw request body
  // Extract the payload from the request body
  //const payloadString = req.body;

  try {
    // Parse the JSON string into an object
    // const payload = JSON.parse(payloadString);   //This is not necessary if the string is a valid json
    // const timestamp = payload.DT;
    // const voltageReadings = payload['Volt1-2-3'];

    // Access specific fields from the payload
    const timestamp = req.body.DT;                  //This works directly without json.parse for valid json strings posted.
    const voltageReadings = req.body['Volt1-2-3'];

    console.log('Timestamp:', timestamp);
    console.log('Voltage Readings:', voltageReadings);

    // Your processing logic here
    if (Array.isArray(voltageReadings)) {
        voltageReadings.forEach((element, index) => {
        console.log(`Volage ${index + 1}:`, element);
     });
}   else {
        console.log('Voltage Readings is not an array');
}


    res.status(200).send('Data received successfully');
  } catch (error) {
    console.error('Error parsing JSON:', error);
    res.status(400).send('Invalid JSON format');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// 
// Testing this API:
// Adjust the port if necessary to be 3001
// Use Telnet as client to connect to this API : telnet localhost 3001
// Paste inside telnet this simulation data:
// POST / HTTP/1.1
// Host: localhost:3001
// Accept: */*
// Content-Length: 60
// Content-Type: application/json
//
// {"DT":"18/11/2023 06:19:01","Volt1-2-3":[20839,20764,20712]}

/* Response by API and console - api server window:
Received RAW body: { DT: '18/11/2023 07:59:46', 'Volt1-2-3': [ 20754, 20632, 20589 ] }
Timestamp: 18/11/2023 07:59:46
Voltage Readings: [ 20754, 20632, 20589 ]
Volage 1: 20754
Volage 2: 20632
Volage 3: 20589
*/

/* Troubleshooting teltonika data sender
Get connected with vpn to teltonika .
Adjust Teltonika Data Sender to use this json:
{"DT":"%d","%r":%a}
Also adjust teltonika to include this customer header line:
Content-Type: application/json
(ps: default Content-Type posted by Teltonika is Content-Type: application/x-www-form-urlencoded and api fails with this type).

Create a second data-sender to laptop-vpn-ip:3000
On laptop make sure that you can ping Teltonika IP.
On laptop use ncat -l -k -p 3000 to create a tiny tcp server

Examine the messages received by Teltonika:
*/ 

// POST / HTTP/1.1
// Host: 10.0.0.2:3000
// Accept: */*
// Content-Type: application/json
// Content-Length: 60
//
// {"DT":"18/11/2023 06:19:06","Volt1-2-3":[20839,20791,20721]}

/* Copy paste the message in telnet and send it to this api (ps: change the Host: localhost:3001) 
 * this api either will complain about improper json received or it will respond with success messages.
 * On api server window , you should see the json strings correctly identified and parsed.
*/
