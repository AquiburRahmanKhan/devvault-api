import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/setup-app';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register should register a user', async () => {
    const email = `e2e-${Date.now()}@test.com`;

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'E2E User',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('token');
    expect(typeof response.body.data.token).toBe('string');
  });

  it('POST /auth/login should login a user', async () => {
    const email = `e2e-login-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'Login User',
        password: 'password123',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('token');
    expect(typeof response.body.data.token).toBe('string');
  });

  it('GET /projects should require auth', async () => {
    await request(app.getHttpServer()).get('/projects').expect(401);
  });

  it('GET /projects should work with token', async () => {
    const email = `e2e-projects-${Date.now()}@test.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'Projects User',
        password: 'password123',
      })
      .expect(201);

    const token = registerResponse.body.data.token;

    const response = await request(app.getHttpServer())
      .get('/projects')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('meta');
    expect(Array.isArray(response.body.data.data)).toBe(true);
  });

  it('GET /users should return 403 for non-admin user', async () => {
    const email = `e2e-user-${Date.now()}@test.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: 'Normal User',
        password: 'password123',
      })
      .expect(201);

    const token = registerResponse.body.data.token;

    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
