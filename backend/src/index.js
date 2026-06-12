const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const usersRouter = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 5000;

async function start() {
  let mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    console.log('Started in-memory MongoDB');
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    return server;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// If run directly, start the server. When required (tests), tests will manage connections.
if (require.main === module) {
  start();
}

module.exports = { app, start };
