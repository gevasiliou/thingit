const ModbusRTU = require('modbus-serial');
const yargs = require('yargs');
const WebSocket = require('ws');
const fs = require('fs');

// Parsing command line arguments using yargs
const argv = yargs
  .usage('Usage: node script.js [options]')
  .version('2.0') // Specify your script version here
  .option('ip', {
    description: 'Modbus slave IP or hostname',
    type: 'string',
    demandOption: true,
  })
  .option('port', {
    description: 'Modbus TCP port',
    type: 'number',
    alias: 'p',
    default: 502,
  })
  .option('serial', {
    description: 'Modbus serial address',
    type: 'number',
    alias: 's',
    default: 1,
  })
  .option('reg', {
    description: 'Start register address',
    type: 'number',
    alias: 'r',
    demandOption: true,
  })
  .option('count', {
    description: 'Number of registers to read',
    type: 'number',
    alias: 'c',
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
    alias: 'a',
    default: 5000,
  })
  .option('runonce', {
    description: 'Read the registers once and exit',
    type: 'boolean',
    default: true,
  })
  .option('csvfile', {
    description: 'Name of the CSV file to store register values',
    type: 'string',
  })
  .option('jsonfile', {
    description: 'Name of the JSON file to store register values',
    type: 'string',
  })
  .option('printjson', {
    description: 'Print on cli JSON format of register values/data',
    type: 'boolean',
    default: false, // Set the default value to false
  })
  .help()
  .alias('help', 'h')
  .wrap(null)
  .argv;

// Extract arguments
const { ip, port, serial, reg, count, regfunction, autoread, runonce, csvfile, jsonfile, version,printjson } = argv;

// Function to send data to WebSocket clients
const sendDataToClients = (data) => {
	if (wss) {
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(data));
			}
		});
	}
};

let wss;
// Check if autoread or runonce is set, then start WebSocket server
if (autoread) {
  wss = new WebSocket.Server({ port: 8080 });

  wss.on('connection', (ws) => {
    console.log('WS Client connected to WebSocket server');
    ws.on('close', () => {
      console.log('WS Client disconnected');
    });
  });
}

const saveToCSV = (data, filename) => {
  const csvContent = data.map(item => Object.values(item).join(',')).join('\n');
  fs.appendFile(`${filename}.csv`, csvContent + '\n', 'utf8', (err) => {  //fs.appendFile used for appending - writeFile overwrites
    if (err) {
      console.error(`Error appending to CSV file ${filename}.csv:`, err);
    } else {
      console.log(`Data appended to CSV file ${filename}.csv successfully!`);
    }
  });
};

const saveToJSON = (data, filename) => {
  fs.readFile(`${filename}.json`, 'utf8', (err, jsonString) => {
    let currentData = [];
    if (!err) {
      try {
        currentData = JSON.parse(jsonString);
      } catch (err) {
        console.error(`Error parsing JSON ${filename}.json :`, err);
      }
    }
    
    currentData.push(...data);

    fs.writeFile(`${filename}.json`, JSON.stringify(currentData), 'utf8', (err) => {
      if (err) {
        console.error(`Error writing to JSON file ${filename}.json:`, err);
      } else {
        console.log(`Data written to JSON file ${filename}.json successfully!`);
      }
    });
  });
};

/*
const saveToJSON = (data, filename) => {
  const jsonContent = JSON.stringify(data);

  fs.appendFile(`${filename}.json`, jsonContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to JSON file:', err);
    } else {
      console.log('Data written to JSON file successfully!');
    }
  });
};
*/

/*
// Function to save data to a JSON file
const saveToJSON = (data) => {
  const jsonContent = JSON.stringify(data, null, 2); // Convert data to JSON string with indentation

  fs.writeFile('register_values.json', jsonContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to JSON file:', err);
    } else {
      console.log('Data written to JSON file successfully!');
    }
  });
};
*/


// Create a Modbus client
const client = new ModbusRTU();
let dataToSave = [];
// Function to read registers with timestamp
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
        default:
          console.error('Invalid Modbus function specified.');
          client.close();
          return;
      }

      registerReadFunction.call(client, reg, count)
        .then(data => {
          for (let i = 0; i < count; i++) {
            const registerValue = data.data[i];
            console.log(`${ip},[${timestamp}],[${reg + i}],${registerValue}`);
            if (autoread) { sendDataToClients({ ip, timestamp, register: reg + i, value: registerValue });}
            if (printjson) { console.log(JSON.stringify({ ip: ip, timestamp: timestamp, register: reg + i, value: registerValue}, null, 0));}  //apply ,null, 2 to achieve json pretty printing
        	dataToSave.push({ ip: ip, timestamp: timestamp, register: reg + i, value: registerValue});
          }
          client.close();
          if (csvfile) {
				saveToCSV(dataToSave, csvfile);
				dataToSave = []; //gv - clear the array
				/* GV: Due to the appendFile operation, if data are not cleared after appending we have a bug.
				 * Having data (2 lines) one & two inserted in datatoSave array.
				 * Those data are saved (append) to file
				 * on the next autoread, we receive data three and four which are pushed in the same array which already contains one & two.
				 * As a result those data are saved on the second run:
				 * one
				 * two
				 * one
				 * two
				 * three
				 * four
				 * So either you have to clear the array after each "save" or alternativelly you replace appendFile with writeFile (overwrite)  
				 * The jsonfile save bellow is built with different approach:
				 * file specified is opened, existing data are read and pushed to a second array
				 * datatoSave are also pushed in this second array
				 * at the end , second array data are saved - overwrite the csv file.
				 */
					// You can implement the logic to write to a CSV file here
          }
          if (jsonfile) {
			  saveToJSON(dataToSave, jsonfile);
            /* In this implementation is not necessary to clear the array because
             * saveToJSON uses fs.writefile (overwrite) instead of fs.appendfile used in saveToCSV
             */
          }
          if (!autoread && !runonce) {
            console.log('Neither autoread nor runonce provided. Exiting.');
            process.exit();
          }
          if (autoread) {
            setTimeout(readRegisters, autoread);
          } else if (!autoread && runonce) {
            console.log('Running once and exiting.');
            process.exit();
          }
        })
        .catch(err => {
          console.error(`Error reading ${regfunction} Registers:`, err);
          client.close();
          if (autoread) {
            setTimeout(readRegisters, autoread);
          } else if (!autoread && runonce) {
            console.log('Running once and exiting.');
            process.exit();
          }
        });
    })
    .catch(err => {
      console.error('Connection failed:', err);
      if (autoread) {
        setTimeout(readRegisters, autoread);
      }
    });
};


// Start reading registers
readRegisters();
