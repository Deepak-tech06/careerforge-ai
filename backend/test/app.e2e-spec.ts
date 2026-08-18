import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('CareerForge API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean database before tests
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Auth Flow', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('/api/auth/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body.user).toHaveProperty('email', testUser.email);
        });
    });

    it('/api/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200) // Login typically returns 200 OK
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          jwtToken = res.body.token; // Save for subsequent tests
        });
    });

    it('/api/resume/my (GET) - Unauthorized without token', () => {
      return request(app.getHttpServer()).get('/api/resume/my').expect(401);
    });

    it('/api/resume/my (GET) - Authorized with token', () => {
      return request(app.getHttpServer())
        .get('/api/resume/my')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
        });
    });
  });
});
