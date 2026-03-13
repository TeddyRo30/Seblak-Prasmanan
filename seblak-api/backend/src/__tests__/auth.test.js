// src/__tests__/auth.test.js
import request from 'supertest';
import app from '../app.js';

describe('Authentication API', () => {
  let accessToken;
  let refreshToken;

  describe('POST /api/v1/auth/register', () => {
    it('should register new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          fullName: 'Test User',
          phone: '+6281234567890'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBeDefined();
      expect(res.body.tokens.accessToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const email = `test${Date.now()}@example.com`;
      
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          fullName: 'Test User'
        });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email,
          password: 'password123',
          fullName: 'Test User 2'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com'
          // missing password & fullName
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let testEmail;
    let testPassword = 'password123';

    beforeAll(async () => {
      testEmail = `test${Date.now()}@example.com`;
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          fullName: 'Test User'
        });
    });

    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.tokens.accessToken).toBeDefined();
      expect(res.body.tokens.refreshToken).toBeDefined();

      accessToken = res.body.tokens.accessToken;
      refreshToken = res.body.tokens.refreshToken;
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should get current user with token', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          fullName: 'Test User'
        });

      const token = registerRes.body.tokens.accessToken;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBeDefined();
    });

    it('should reject without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token', async () => {
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          fullName: 'Test User'
        });

      const oldRefreshToken = registerRes.body.tokens.refreshToken;

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: oldRefreshToken
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.tokens.accessToken).toBeDefined();
    });
  });
});