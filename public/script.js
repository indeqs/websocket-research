document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const userSetup = document.getElementById('userSetup');
  const chatBox = document.getElementById('chatBox');
  const usernameInput = document.getElementById('usernameInput');
  const setUsernameBtn = document.getElementById('setUsernameBtn');
  const messagesContainer = document.getElementById('messages');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const getMessagesBtn = document.getElementById('getMessagesBtn');
  const postMessageBtn = document.getElementById('postMessageBtn');
  const getSingleMessageBtn = document.getElementById('getSingleMessageBtn');
  const deleteMessageBtn = document.getElementById('deleteMessageBtn');
  const messageIdInput = document.getElementById('messageIdInput');
  const apiResponse = document.getElementById('apiResponse');

  // State
  let username = '';
  let ws;

  // Initialize WebSocket connection
  function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    ws = new WebSocket(`${protocol}//${host}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'history') {
        // Load message history
        data.messages.forEach(message => {
          appendMessage(message);
        });
      } else if (data.type === 'message') {
        // New message received
        appendMessage(data.message);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Try to reconnect after a delay
      setTimeout(connectWebSocket, 3000);
    };
  }

  // Add a message to the chat
  function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(message.username === username ? 'sent' : 'received');

    const metaElement = document.createElement('div');
    metaElement.classList.add('meta');

    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    metaElement.textContent = `${message.username} - ${timestamp}`;

    const textElement = document.createElement('div');
    textElement.textContent = message.text;

    messageElement.appendChild(metaElement);
    messageElement.appendChild(textElement);

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Send a message via WebSocket
  function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const message = {
      username,
      text
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      messageInput.value = '';
    } else {
      console.error('WebSocket not connected');
    }
  }

  // Event Listeners
  setUsernameBtn.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
      userSetup.style.display = 'none';
      chatBox.style.display = 'flex';
      connectWebSocket();
    }
  });

  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      setUsernameBtn.click();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // API Controls
  getMessagesBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      apiResponse.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      apiResponse.textContent = `Error: ${error.message}`;
    }
  });

  postMessageBtn.addEventListener('click', async () => {
    const text = messageInput.value.trim();
    if (!text) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          text
        })
      });

      const data = await response.json();
      apiResponse.textContent = JSON.stringify(data, null, 2);
      messageInput.value = '';
    } catch (error) {
      apiResponse.textContent = `Error: ${error.message}`;
    }
  });

  getSingleMessageBtn.addEventListener('click', async () => {
    const id = messageIdInput.value.trim();
    if (!id) return;

    try {
      const response = await fetch(`/api/messages/${id}`);
      const data = await response.json();
      apiResponse.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      apiResponse.textContent = `Error: ${error.message}`;
    }
  });

  deleteMessageBtn.addEventListener('click', async () => {
    const id = messageIdInput.value.trim();
    if (!id) return;

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      apiResponse.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      apiResponse.textContent = `Error: ${error.message}`;
    }
  });
});
