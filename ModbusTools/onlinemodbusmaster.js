const express = require('express');
//const { TCP } = require('jsmodbus');
const net = require('net');
const path = require('path');
const app = express();
const cors = require('cors'); // Import the 'cors' module
const ModbusRTU = require('modbus-serial');
const client = new ModbusRTU();

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '/')));

// Endpoint to handle Modbus requests
app.post('/readModbus', async (req, res) => {
    const { clientIP, clientPort, modbusFunction, firstRegister, numRegisters, serialAddress } = req.body;
    console.log('req.body: ' , req.body);
    // Set the slave ID - Serial Address
     client.setID(serialAddress);
    try {
        
        if (clientIP && clientPort) {
            if (client.isOpen) {
                await client.close();
            }
            console.log('Attempting to connect to Modbus device...');
            await client.connectTCP(clientIP, { port: clientPort });
        } else {
            throw new Error('Invalid Modbus TCP Client IP or Port');
        }

		let response; // Ensure the response variable is defined

        if (modbusFunction === 'readHoldingRegisters') {
            console.log('Attempting to read holding registers...');
            response = await client.readHoldingRegisters(firstRegister, numRegisters);

        } else if (modbusFunction === 'readInputRegisters') {
            console.log('Attempting to read input registers...');
            response = await client.readInputRegisters(firstRegister, numRegisters);

        }
        // Add handling for other Modbus functions...
		console.log('Response:', response); // Log the response object
		
		if (response === undefined || response instanceof Error) {
            throw new Error('Failed to retrieve data from Modbus device');
        }

		
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (client.isOpen) {
            await client.close();
            console.log('client close');
        }
    }
});

const PORT = 3000; // Replace with your desired port number
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
