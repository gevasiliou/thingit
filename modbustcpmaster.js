/* 
const ModbusRTU = require('modbus-serial');

// Create a Modbus client
const client = new ModbusRTU();

// Set the Modbus slave device IP and port
const slaveIP = '149.210.4.224'; // Replace with your Modbus TCP slave IP
const slavePort = 502; // Modbus TCP port

// Connect to the Modbus TCP slave
client.connectTCP(slaveIP, { port: slavePort })
  .then(() => {
    // Read input registers 
    const startAddress = 358;
    const quantity = 3;

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
*/

const ModbusRTU = require('modbus-serial');
const yargs = require('yargs');

// Create a Modbus client
const client = new ModbusRTU();

// Parsing command line arguments using yargs
const argv = yargs
  .usage('Usage: node script.js [options]')
  .option('ip', {
    description: 'Modbus slave IP or hostname',
    type: 'string',
    demandOption: true,
  })
  .option('port', {
    description: 'Modbus TCP port',
    type: 'number',
    default: 502,
  })
  .option('serial', {
    description: 'Modbus serial address',
    type: 'number',
    default: 1,
  })
  .option('reg', {
    description: 'Start register address',
    type: 'number',
    demandOption: true,
  })
  .option('count', {
    description: 'Number of registers to read',
    type: 'number',
    default: 1,
  })
  .option('regfunction', {
    description: 'Modbus function (inputregister/holdingregister)',
    type: 'string',
    default: 'inputregister',
  })
  .option('autoread', {
    description: 'Interval in milliseconds for autoreading registers',
    type: 'number',
  })
  .help()
  .alias('help', 'h')
  .wrap(null)
  .argv;

// Extract arguments
const { ip, port, serial, reg, count, regfunction, autoread } = argv;

// Function to read registers with timestamp
const readRegisters = () => {
  client.setID(serial);
  client.connectTCP(ip, { port })
    .then(() => {
      if (regfunction === 'inputregister') {
        const timestamp = new Date().toISOString();
        client.readInputRegisters(reg, count)
          .then(data => {
            for (let i = 0; i < count; i++) {
              const registerValue = data.data[i];
              console.log(`[${timestamp}],[${reg + i}],${registerValue}`);
            }
            client.close();
            if (autoread) {
              setTimeout(readRegisters, autoread); // Schedule next read
            }
          })
          .catch(err => {
            console.error('Error reading:', err);
            client.close();
            if (autoread) {
              setTimeout(readRegisters, autoread); // Schedule next read
            }
          });
      } else if (regfunction === 'holdingregister') {
        // Handle holding register reading similarly if needed
      } else {
        console.error('Invalid Modbus function specified.');
        client.close();
      }
    })
    .catch(err => {
      console.error('Connection failed:', err);
      if (autoread) {
        setTimeout(readRegisters, autoread); // Schedule next read even if connection failed
      }
    });
};

// Start reading registers
readRegisters();
