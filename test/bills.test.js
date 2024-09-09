const request = require('supertest');
const express = require('express');
const { Bill } = require('../models/models');
const router = require('../routes/bills'); // Adjust to your bills route file

const app = express();

app.use(router);

jest.mock('../models/models');
const mockFindAll = jest.fn();
Bill.findAll = mockFindAll;

jest.mock('../middleware/auth', () => jest.fn((req, res, next) => next())); // Mock auth middleware
// Add any other necessary middleware mocks here if needed

describe('GET /bills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return all bills with status 200', async () => {
    const mockBills = [{ id: 1, amount: 100 }, { id: 2, amount: 200 }];
    mockFindAll.mockResolvedValue(mockBills);

    const response = await request(app).get('/bills')
      .set('Authorization', 'Bearer YOUR_TOKEN_HERE'); // Replace with a valid token if required

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('amount', 100);
  });

  test('should return 500 if an error occurs', async () => {
    mockFindAll.mockRejectedValue(new Error('Database Error'));

    const response = await request(app).get('/bills')
      .set('Authorization', 'Bearer YOUR_TOKEN_HERE'); // Replace with a valid token if required

    expect(response.status).toBe(500);
    expect(response.text).toBe('Internal Server Error');
  });
});

