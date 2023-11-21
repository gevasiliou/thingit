const ModbusRTU = require('modbus-serial');
const WebSocket = require('ws');

// Create a Modbus client
const client = new ModbusRTU();

// Set the Modbus slave device IP and port
const slaveIP = '192.168.1.168'; // Replace with your Modbus TCP slave IP
const slavePort = 502; // Modbus TCP port

// Connect to the Modbus TCP slave
client.connectTCP(slaveIP, { port: slavePort })
  .then(() => {
    // Create a WebSocket server
    const wss = new WebSocket.Server({ port: 8080 }); // Change the port as needed

    wss.on('connection', ws => {
      console.log('WebSocket client connected');

      // Read input registers 
      const startAddress = 358;
      const quantity = 8;

      client.readInputRegisters(startAddress, quantity)
        .then(data => {
          // Output received data in specified format
          for (let i = 0; i < quantity; i++) {
            const registerValue = data.data[i];
            const message = `[${startAddress + i}]: ${registerValue}`;
            ws.send(message); // Send register value to WebSocket client
          }
          client.close(); // Close the Modbus connection after reading
        })
        .catch(err => {
          console.error('Error reading:', err);
          client.close(); // Close the Modbus connection if there's an error
        });
    });
  })
  .catch(err => {
    console.error('Connection failed:', err);
  });
