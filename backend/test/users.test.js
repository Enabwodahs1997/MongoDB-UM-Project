const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../src/index');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  // clear db
  const collections = Object.keys(mongoose.connection.collections);
  for (const name of collections) {
    await mongoose.connection.collections[name].deleteMany({});
  }
});

test('create -> list -> delete user', async () => {
  const createRes = await request(app)
    .post('/api/users')
    .send({ name: 'Test User', email: 'testuser@example.com' })
    .expect(201);

  expect(createRes.body).toHaveProperty('_id');
  const id = createRes.body._id;

  const listRes = await request(app).get('/api/users').expect(200);
  expect(Array.isArray(listRes.body)).toBe(true);
  expect(listRes.body.length).toBe(1);

  await request(app).delete(`/api/users/${id}`).expect(200);

  const listAfter = await request(app).get('/api/users').expect(200);
  expect(listAfter.body.length).toBe(0);
});

test('reject duplicate email', async () => {
  await request(app).post('/api/users').send({ name: 'Alpha', email: 'dup@example.com' }).expect(201);
  const res = await request(app).post('/api/users').send({ name: 'Beta', email: 'dup@example.com' }).expect(409);
  expect(res.body).toHaveProperty('errors');
  expect(res.body.errors).toHaveProperty('email');
});

test('update user', async () => {
  const createRes = await request(app).post('/api/users').send({ name: 'Up', email: 'up@example.com' }).expect(201);
  const id = createRes.body._id;
  const updateRes = await request(app).put(`/api/users/${id}`).send({ name: 'Updated', email: 'updated@example.com' }).expect(200);
  expect(updateRes.body.name).toBe('Updated');
  expect(updateRes.body.email).toBe('updated@example.com');
});

test('validation errors', async () => {
  const res = await request(app).post('/api/users').send({ name: 'A', email: 'bad' }).expect(400);
  expect(res.body).toHaveProperty('errors');
  expect(res.body.errors).toHaveProperty('name');
  expect(res.body.errors).toHaveProperty('email');
});
