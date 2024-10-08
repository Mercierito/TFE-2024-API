const request = require('supertest');
const express = require('express');
const { Worker } = require('../models/models');
const router=require('../routes/workers')

const app = express();

app.use(router)

jest.mock('../models/models');
const mockFindAll = jest.fn();
Worker.findAll = mockFindAll;


jest.mock('../middleware/auth', () => jest.fn((req, res, next) => next()));
jest.mock('../middleware/role', () => jest.fn(() => (req, res, next) => next()));

describe('GET /', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return all users with status 200', async () => {
    const mockUsers = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }];
    mockFindAll.mockResolvedValue(mockUsers);

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('name', 'John Doe');
  });

  test('should handle errors and return 500', async () => {
    mockFindAll.mockRejectedValue(new Error('Database Error'));

    const response = await request(app).get('/');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal server error');
  });
});


jest.mock('../middleware/auth', () => (req, res, next) => {
  req.decodedToken = { id: 1 }; // Mock a decoded token with an id
  next();
});

const mockFindByPk = jest.fn((id) => {
  // Check the parameter passed to the function and return accordingly
  if (id === 1) {
    return Promise.resolve({ id: 1, name: 'John Doe', role: 2, save: jest.fn().mockResolvedValue(true) });
  }
  // Return null or throw an error for other cases if needed
  return Promise.resolve(null);
});

Worker.findByPk = mockFindByPk;
describe('GET /me', () => {
  test('should return the worker details with status 200', async () => {
    const mockWorker = { id: 1, name: 'John Doe', role: 2 };
    mockFindByPk.mockResolvedValue(mockWorker);

    const response = await request(app).get('/me');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ name: 'John Doe', role: 2 });
  });

  test('should return 500 if an error occurs', async () => {
    mockFindByPk.mockRejectedValue(new Error('Database Error'));

    const response = await request(app).get('/me');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });
});