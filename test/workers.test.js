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
