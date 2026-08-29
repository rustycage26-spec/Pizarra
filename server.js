const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let history = [];

io.on('connection', (socket) => {
  socket.emit('load-history', history);

  socket.on('draw-line', (data) => {
    history.push({ type: 'line', ...data });
    socket.broadcast.emit('draw-line', data);
  });

  socket.on('add-text', (data) => {
    history.push({ type: 'text', ...data });
    socket.broadcast.emit('add-text', data);
  });

  socket.on('clear', () => {
    history = [];
    io.emit('clear');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
