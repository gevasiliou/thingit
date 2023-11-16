//const socket = new WebSocket('ws://your-websocket-server-url');
const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', (event) => {
  console.log('Connected to the WebSocket server');
});

socket.addEventListener('close', (event) => {
  console.log('Connection closed');
});

socket.addEventListener('message', (event) => {
	console.log(`Received message: ${event.data}`);
    // Parse the JSON string received from the server
    const data = JSON.parse(event.data);

    // Update the content on the webpage
    updateContent(data);
});

function updateContent(data) {
    // Update your HTML content here based on the received data
    const dataDisplay = document.getElementById('data-display');
    dataDisplay.innerHTML = `<p>${data.yourDataField}</p>`;
}
