const ModbusRTU = require('modbus-serial');

// Create a Modbus client
const client = new ModbusRTU();

// Set the Modbus slave device IP and port
const slaveIP = '192.168.1.168'; // Replace with your Modbus TCP slave IP
const slavePort = 502; // Modbus TCP port

// Connect to the Modbus TCP slave
client.connectTCP(slaveIP, { port: slavePort })
  .then(() => {
    // Read input registers 
    const startAddress = 358;
    const quantity = 8;

    client.readInputRegisters(startAddress, quantity)
      .then(data => {
        // Output received data in specified format
        for (let i = 0; i < quantity; i++) {
          const registerValue = data.data[i];
          console.log(`[${startAddress + i}]: ${registerValue}`);
        }
        client.close(); // Close the connection after reading
      })
      .catch(err => {
        console.error('Error reading:', err);
        client.close(); // Close the connection if there's an error
      });
  })
  .catch(err => {
    console.error('Connection failed:', err);
  });
