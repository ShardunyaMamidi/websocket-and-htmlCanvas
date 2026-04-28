// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room') || 'lobby';
const username = urlParams.get('user') || 'Guest' + Math.floor(Math.random() * 100);

// Use username for clientId instead of random string
const clientId = username;

let stompClient = null;
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const coordList = document.getElementById('coord-list');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

document.querySelector('#coord-section h3').innerText = `Live: Room ${roomId}`;
document.querySelector('#chat-section h3').innerText = `Chatting as: ${username}`;

// 1. WebSocket Connection
function connect() {
    const socket = new SockJS('http://localhost:8080/ws-game');
    stompClient = Stomp.over(socket);
    // Hide STOMP debug logs in console if it gets too noisy
    stompClient.debug = null;

    stompClient.connect({}, frame => {
        console.log('Connected as: ' + clientId);

        stompClient.subscribe(`/topic/${roomId}/location`, message => {
            const data = JSON.parse(message.body);

            // OPTIMISTIC UI: Only draw if the message is from SOMEONE ELSE
            if (data.senderId !== clientId) {
              draw(data.lastX, data.lastY, data.x, data.y, '#ff4757'); // Red for others
            }

            // Still update the coordinate list for everyone
            displayCoordinate(data.x, data.y, data.senderId);
        });

        stompClient.subscribe(`/topic/${roomId}/chat`, (message) => {
            const chatData = JSON.parse(message.body);
            renderMessage(chatData);
        })

        stompClient.send(`/app/${roomId}/chat.addUser`, {}, JSON.stringify({
            sender: username,  // This comes from your Lobby URL params
            type: 'JOIN',
            content: username + " joined the drawing board!"
        }));
    });
}

// 2. Throttling Helper Function
function throttle(callback, delay) {
    let previousCall = new Date().getTime();
    return function() {
        const time = new Date().getTime();
        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
}

// 3. The "Send" logic (Throttled to 60fps)
const sendCoordinates = throttle((x, y, lx, ly) => {
    if (stompClient && stompClient.connected) {
        stompClient.send(`/app/${roomId}/get-location`, {}, JSON.stringify({
            x: x,
            y: y,
            lastX: lx,
            lastY: ly,
            senderId: clientId
        }));
    }
}, 0); // 16ms delay

// 4. Drawing Logic
function draw(x1, y1, x2, y2, color = '#007bff') {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // A. Draw Locally (Immediate Feedback)
    draw(lastX, lastY, x, y, '#2ed573'); // Green for self

    // B. Send to others via Throttled function
    sendCoordinates(x, y, lastX, lastY);

    [lastX, lastY] = [x, y];
});

canvas.addEventListener('mouseup', () => isDrawing = false);

// 5. UI List Update
function displayCoordinate(x, y, sender) {
    const entry = document.createElement('div');
    entry.style.fontSize = '12px';
    entry.style.borderBottom = '1px solid #eee';
    entry.innerHTML = `<strong>${sender}:</strong> ${Math.round(x)}, ${Math.round(y)}`;

    coordList.prepend(entry);

    // Performance: Keep the list from growing infinitely
    if (coordList.childNodes.length > 50) {
        coordList.removeChild(coordList.lastChild);
    }
}

function sendChatMessage() {
    const messageContent = document.getElementById('chatInput').value;
    if (messageContent && stompClient) {
        const chatMessage = {
            sender: clientId, // Using the clientId we created earlier
            content: messageContent,
            type: 'CHAT'
        };
        stompClient.send(`/app/${roomId}/chat.sendMessage`, {}, JSON.stringify(chatMessage));
        document.getElementById('chatInput').value = '';
    }
}

function renderMessage(message) {
    const chatBox = document.getElementById('chat-messages');
    const msgElement = document.createElement('div');
    msgElement.innerHTML = `<b>${message.sender}:</b> ${message.content}`;
    chatBox.appendChild(msgElement);
}

connect();