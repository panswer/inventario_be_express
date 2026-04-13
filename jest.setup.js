require('./src/config');

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Session = require('./src/models/Session');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

global.createTestSession = async (userId, sessionId) => {
  await Session.create({ userId, sessionId });
};
