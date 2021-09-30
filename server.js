const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');

const { Server } = require("socket.io");

app.use(cors());

const publicPath = path.join(__dirname, './public');
app.use(express.static(publicPath));


const io = new Server(server, {
  cors: {
    // origin: "http://127.0.0.1:5500",
    // origin: "https://younik-chat-app.herokuapp.com/",
    origin: "*",
    methods: ["GET", "POST"]
  }
});



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const users = {};

io.on('connection', (socket) => {
  // console.log('A user connected with id: ' , socket.id);

  socket.on('new-user', name => {
    users[socket.id] = name;
    socket.broadcast.emit('user-connected', name);
  })

  socket.on('send-message', message => {
    socket.broadcast.emit('chat-message', {message: message, name: users[socket.id]})
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id];
  })

});

server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:', (process.env.YOUR_PORT || process.env.PORT || 3000) );
});