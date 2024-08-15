const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://omarvenom22:omarvenom22@cluster0.vcbxuhy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
const ordersRouter = require('./routes/orders');
app.use('/orders', ordersRouter);

const goalRouter = require('./routes/goal');
app.use('/goal', goalRouter);

const adminCodeRouter = require('./routes/adminCode');
app.use('/admin-code', adminCodeRouter);


const accountRouter = require('./routes/auth');
app.use('/auth', accountRouter);

const tokenRouter = require('./routes/token');
app.use('/token', tokenRouter);






// Create HTTP Server
const server = http.createServer(app);

// Setup WebSocket Server
const wss = new WebSocket.Server({ server });

// Store clients with their corresponding idOfAdmin
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Listen for the idOfAdmin from the client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.idOfAdmin) {
        // Store the idOfAdmin for this client
        clients.set(ws, data.idOfAdmin);
        console.log(`Client registered with idOfAdmin: ${data.idOfAdmin}`);
      }
    } catch (error) {
      console.error('Error parsing message from client:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws); // Remove the client from the map when it disconnects
  });
});

// Watch for changes in the orders collection
const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');

  const orderCollection = db.collection('orders');
  const changeStream = orderCollection.watch();

  changeStream.on('change', (change) => {
    console.log('A change occurred:', change);

    const idOfAdmin = change.fullDocument?.idOfAdmin || change.documentKey?.idOfAdmin;

    // Broadcast changes to relevant clients
    clients.forEach((clientIdOfAdmin, client) => {
      if (client.readyState === WebSocket.OPEN && clientIdOfAdmin === idOfAdmin) {
        client.send(JSON.stringify(change));
      }
    });
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
