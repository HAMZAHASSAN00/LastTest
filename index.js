const express = require("express");
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const CustomerEmailToSocketIdMap = {};
const TankerEmailToSocketIdMap = {};

function getEmailBySocketId(socketId) {
    for (const [email, id] of Object.entries(CustomerEmailToSocketIdMap)) {
      if (id === socketId) {
        return email;
      }
    }
    for (const [email, id] of Object.entries(TankerEmailToSocketIdMap)) {
        if (id === socketId) {
          return email;
        }
      }
}
function deleteEntryByEmail(email) {
    if (CustomerEmailToSocketIdMap.hasOwnProperty(email)) {
      delete emailToSocketIdMap[email];
      console.log(`Deleted entry for Customer email: ${email}`);
    } else if (TankerEmailToSocketIdMap.hasOwnProperty(email)){
      console.log(`Deleted entry for Tanker email: ${email}`);
    }
  }

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('saveSocketEmail', (data) => {
    console.log('Request Socket Email hs been recieved', data);
    const user_email = data.userEmail;
    console.log(user_email);
    const user_type = data.userType;
    console.log(user_type);
    if(user_type=="Tanker"){
        //save the socket.id of that TankerEmail
        TankerEmailToSocketIdMap[user_email] = socket.id;
        io.emit('displayTankers', TankerEmailToSocketIdMap);
        console.log('Tanker email socket.id: ',TankerEmailToSocketIdMap[user_email]);
    }
    else if(user_type=="Customer"){
        //save the socket.id of that CustomerEmail
        CustomerEmailToSocketIdMap[user_email] = socket.id;
        console.log('customer email socket.id: ',CustomerEmailToSocketIdMap[user_email]);
        }
  });

  socket.on('requestDisplayTankers', (data) => {
    console.log('DisplayingTankers:');
    // Forward the activeTanker to the customer
    io.to(`${socket.id}`).emit('displayTankers', TankerEmailToSocketIdMap);
    //io.emit('displayTankers', TankerEmailToSocketIdMap);
    
  });

  // Handle customer request
  socket.on('customerRequest', (data) => {
    console.log('Customer request received:', data);
    // Forward the request to the corresponding tanker
    const tanker_email = data.tankerEmail;
    console.log(tanker_email);
    
    io.to(`${TankerEmailToSocketIdMap[tanker_email]}`).emit('tankerRequest', data);
    
  });

  // Handle tanker response
  socket.on('tankerResponse', (data) => {
    console.log('Tanker response received:', data);

    // Forward the response to the corresponding customer
    const customer_email = data.customerEmail;
    console.log(customer_email);
    io.to(CustomerEmailToSocketIdMap[customer_email]).emit('customerResponse', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    const targetEmail = getEmailBySocketId(socket.id);
    deleteEntryByEmail(targetEmail);
    io.emit('displayTankers', TankerEmailToSocketIdMap);
  });
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, function(){
    console.log(`server started on port ${PORT}`);
    console.log("Ready to go and listne");
    });
