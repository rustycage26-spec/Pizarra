const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const DATA_FILE = path.join(__dirname, 'history.json');
let history = [];

// Cargar historial guardado si existe
if (fs.existsSync(DATA_FILE)) {
  try {
    history = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    history = [];
  }
}

function saveHistory() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(history));
}

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.emit('load-history', history);

  socket.on('draw-line', (data) => {
    history.push({ type: 'line', ...data });
    saveHistory();
    socket.broadcast.emit('draw-line', data);
  });

  socket.on('add-text', (data) => {
    history.push({ type: 'text', ...data });
    saveHistory();
    socket.broadcast.emit('add-text', data);
  });

  socket.on('clear', () => {
    history = [];
    saveHistory();
    io.emit('clear');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
