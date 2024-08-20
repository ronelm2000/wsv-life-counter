/**
 * Set to store all the connected ports in.
 */
const connectedPorts = new Set();

// Create socket instance.
const socket = new WebSocket("ws://127.0.0.1:8089/");

// Send initial package on open.
socket.addEventListener('open', () => {
  console.log('Opening Server');
  const data = JSON.stringify({
    "request": "Subscribe",
    "id": "my-subscribe-id",
    "events": {
        "General": [
            "Custom"
        ]
    }
  });
  socket.send(data);
});

// Send data from socket to all open tabs.
socket.addEventListener('message', ({ data }) => {
  const payload = JSON.parse(data);
  connectedPorts.forEach(port => port.postMessage(payload));
});

/**
 * When a new thread is connected to the shared worker,
 * start listening for messages from the new thread.
 */
self.addEventListener('connect', ({ ports }) => {
  const port = ports[0];

  // Add this new port to the list of connected ports.
  connectedPorts.add(port);

  /**
   * Receive data from main thread and determine which
   * actions it should take based on the received data.
   */
  port.addEventListener('message', ({ data }) => {
    const { action, value } = data;

    // Send message to socket.
    if (action === 'send') {
      socket.send(JSON.stringify(value));

    // Remove port from connected ports list.
    } else if (action === 'unload') {
      connectedPorts.delete(port);
    }
  });

  // Start the port broadcasting.
  port.start();
});