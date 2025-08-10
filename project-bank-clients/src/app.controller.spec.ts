import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './adapter/controller/clients.controller';
import { ClientsService } from './domain/service/clients.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockClientsService = {
      getClientById: jest.fn(),
      updateClient: jest.fn(),
      updateProfilePicture: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('AppController', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
