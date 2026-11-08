import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: Partial<AppService>;

  beforeEach(async () => {
    appService = {
      getTheme: jest.fn().mockResolvedValue({ theme: 'HOSTIM' }),
      setTheme: jest.fn().mockImplementation((theme: string) =>
        Promise.resolve({ theme }),
      ),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('theme', () => {
    it('should return theme from service', async () => {
      const result = await appController.getTheme();
      expect(result).toEqual({ theme: 'HOSTIM' });
    });
  });
});
