// const express = require("express");
// const http = require('http');
// const socketIO = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server);

// io.on('connection', (socket) => {
//   console.log('A user connected');
//   // Handle customer request
//   socket.on('customerRequest', (data) => {
//     console.log('Customer request received:', data);

//     // Forward the request to the corresponding tanker
//     const tankerId = data.tankerId;
//     console.log(tankerId);
//     io.to(`${socket.id}`).emit('tankerRequest', data);
    
//   });

//   // Handle tanker response
//   socket.on('tankerResponse', (data) => {
//     console.log('Tanker response received:', data);

//     // Forward the response to the corresponding customer
//     const customerId = data.customerId;
//     io.to(customerId).emit('customerResponse', data);
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });
// const PORT = process.env.PORT || 3000;

// server.listen(PORT, function(){
//     console.log(`server started on port ${PORT}`);
//     console.log("Ready to go and listne");
//     });

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const express = require("express");
  const http = require('http');
  const socketIO = require('socket.io');

  const app = express();
  const server = http.createServer(app);
  const io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('A user connected');
    // Handle customer request
    socket.on('customerRequest', (data) => {
      console.log('Customer request received:', data);

      // Forward the request to the corresponding tanker
      const tankerId = data.tankerId;
      console.log(tankerId);
      io.to(`${socket.id}`).emit('tankerRequest', data);
      
    });

    // Handle tanker response
    socket.on('tankerResponse', (data) => {
      console.log('Tanker response received:', data);

      // Forward the response to the corresponding customer
      const customerId = data.customerId;
      io.to(customerId).emit('customerResponse', data);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, function(){
      console.log(`worker ${process.pid} started on port ${PORT}`);
      console.log("Ready to go and listen");
  });
}
