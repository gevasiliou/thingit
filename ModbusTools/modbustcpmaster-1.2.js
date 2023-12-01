const ModbusRTU = require('modbus-serial');
const yargs = require('yargs');
const WebSocket = require('ws');

// Create a Modbus client
const client = new ModbusRTU();

// Parsing command line arguments using yargs
const argv = yargs
  .usage('Usage: node script.js [options]')
  .version('1.2') // Specify your script version here
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

//const wss = new WebSocket.Server({ port: 8080 }); // Change the port as needed

// Function to send data to WebSocket clients
const sendDataToClients = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Function to close WebSocket server after a timeout
const closeServerIfNoConnection = () => {
  if (wss.clients.size === 0) {
    console.log('No WebSocket clients connected. Closing the server.');
    wss.close();
  }
};

/*
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
              sendDataToClients({timestamp,register: reg + i,value: registerValue});
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

*/

const readRegisters = () => {
  client.setID(serial);
  client.connectTCP(ip, { port })
    .then(() => {
      const timestamp = new Date().toISOString();
      let registerReadFunction;

      switch (regfunction) {
        case 'inputregister':
          registerReadFunction = client.readInputRegisters;
          console.log('Reading Input Registers');
          break;
        case 'holdingregister':
          registerReadFunction = client.readHoldingRegisters;
          console.log('Reading Holding Registers');
          break;
        // Add more cases for other Modbus functions as needed
        default:
          console.error('Invalid Modbus function specified.');
          client.close();
          return;
      }

      registerReadFunction.call(client, reg, count)
        .then(data => {
          for (let i = 0; i < count; i++) {
            const registerValue = data.data[i];
            console.log(`[${timestamp}],[${reg + i}],${registerValue}`);
            sendDataToClients({ timestamp, register: reg + i, value: registerValue });
          }
          client.close();
          if (autoread) {
            setTimeout(readRegisters, autoread); // Schedule next read
          }
        })
        .catch(err => {
          console.error(`Error reading ${regfunction} Registers:`, err);
          client.close();
          if (autoread) {
            setTimeout(readRegisters, autoread); // Schedule next read
          }
        });
    })
    .catch(err => {
      console.error('Connection failed:', err);
      if (autoread) {
        setTimeout(readRegisters, autoread); // Schedule next read even if connection failed
      }
    });
};


// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// WebSocket server handling
wss.on('connection', (ws) => {
  console.log('WS Client connected to WebSocket server');
  ws.on('close', () => {
    console.log('WS Client disconnected');
  });
});


// Set timeout to check for connected clients and close the server if none are present
// setTimeout(closeServerIfNoConnection, 30000); // Adjust timeout duration  
// Above code works ok and ws server is closed if no ws client is connected within 30 seconds.
// But closing the ws server will not allow your html page to run if you open it after ws server close!
// keeping the we server running on the background you can open your html file anytime, considering that server is started with --autoread
// Start reading registers
readRegisters();
