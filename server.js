// ----- server.js -----
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Message storage
let messages = [];

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send existing messages to new client
  ws.send(JSON.stringify({ type: 'history', messages }));
  
  // Message from client
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    
    // Add timestamp to message
    message.timestamp = new Date().toISOString();
    
    // Store message
    messages.push(message);
    
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'message', message }));
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// HTTP Routes
// GET messages
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// POST a new message (alternative to WebSocket)
app.post('/api/messages', (req, res) => {
  const message = {
    username: req.body.username,
    text: req.body.text,
    timestamp: new Date().toISOString()
  };
  
  // Store message
  messages.push(message);
  
  // Broadcast to all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'message', message }));
    }
  });
  
  res.status(201).json(message);
});

// Get a specific message by index
app.get('/api/messages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < messages.length) {
    res.json(messages[id]);
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

// Delete a message
app.delete('/api/messages/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < messages.length) {
    const deletedMessage = messages.splice(id, 1)[0];
    res.json(deletedMessage);
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

// Serve the front-end
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
