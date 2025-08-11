import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './adapter/controller/clients.controller';
import { ClientsService } from './domain/service/clients.service';

describe('AppController', () => {
  let appController: ClientsController;

  beforeEach(async () => {
    const mockClientsService = {
      getClientById: jest.fn(),
      updateClient: jest.fn(),
      updateProfilePicture: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
      ],
    }).compile();

    appController = app.get<ClientsController>(ClientsController);
  });

  describe('AppController', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
