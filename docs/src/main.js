const imgPath = './imgs/';
const dmgLeft = 'dmg_left_';

let damage = [0, 0];

const webSocketWorker = new SharedWorker('./src/web-sockets-worker.js');

async function init() {
    const indexCanvas = document.getElementById('canvasContent');
    // web worker and websocket connection initialization goes here.

    const emptyImage = await loadImage(imgPath + dmgLeft + "canvas.png");
    const ctx = indexCanvas.getContext("2d");
    ctx.drawImage(emptyImage, 100, 100, emptyImage.width * 0.3, emptyImage.height * 0.3);

    
    // Event to listen for incoming data from the worker and update the DOM.
    webSocketWorker.port.addEventListener('message', ({ data }) => {
        /*
        requestAnimationFrame(() => {
        appendGatePublicTickersData(data);
        });
        */
       console.log(`Recieved message: ${JSON.stringify(data)}`);
    });
        
    // Initialize the port connection.
    webSocketWorker.port.start();
    
    // Remove the current worker port from the connected ports list.
    // This way your connectedPorts list stays true to the actual connected ports, 
    // as they array won't get automatically updated when a port is disconnected.
    window.addEventListener('beforeunload', () => {
        webSocketWorker.port.postMessage({ 
            action: 'unload', 
            value: null,
        });
        webSocketWorker.port.close();
    });
}

/**
 * Sends a message to the worker and passes that to the Web Socket.
 * @param {any} message 
 */
function sendMessageToSocket(message) {
    webSocketWorker.port.postMessage({ 
        action: 'send', 
        value: message,
    });
}


function loadImage(/** type {string} **/src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
//        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = img.onabort = () => reject(src);
        if ( img.complete || img.complete === undefined ) {
            img.src = src;
        }
        img.src = src;
    });
}

window.onload = init;