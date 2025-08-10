import { Test, TestingModule } from '@nestjs/testing';
import { BankTransactionsController } from '../../../src/adapter/controller/bank-transactions.controller';
import { AppService } from '../../../src/app.service';
import { TransactionRequest } from '../../../src/adapter/dto/transaction-request.dto';

describe('BankTransactionsController', () => {
  let controller: BankTransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankTransactionsController],
      providers: [AppService],
    }).compile();

    controller = module.get<BankTransactionsController>(BankTransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', () => {
      const transactionData: TransactionRequest = {
        senderUserId: 'user123',
        receiverUserId: 'user456',
        amount: 100.50,
        description: 'Payment for services'
      };

      const result = controller.createTransaction(transactionData);
      
      expect(result.status).toBe('success');
      expect(result.transactionId).toBeDefined();
      expect(result.message).toBe('Transação processada com sucesso');
    });

    it('should return error for missing parameters', () => {
      const transactionData: TransactionRequest = {
        senderUserId: '',
        receiverUserId: 'user456',
        amount: 100.50,
        description: 'Payment for services'
      };

      const result = controller.createTransaction(transactionData);
      
      expect(result.status).toBe('error');
      expect(result.message).toContain('Todos os parâmetros são obrigatórios');
    });

    it('should return error for invalid amount', () => {
      const transactionData: TransactionRequest = {
        senderUserId: 'user123',
        receiverUserId: 'user456',
        amount: -50,
        description: 'Payment for services'
      };

      const result = controller.createTransaction(transactionData);
      
      expect(result.status).toBe('error');
      expect(result.message).toBe('O valor da transação deve ser maior que zero');
    });

    it('should return error when sender and receiver are the same', () => {
      const transactionData: TransactionRequest = {
        senderUserId: 'user123',
        receiverUserId: 'user123',
        amount: 100.50,
        description: 'Payment for services'
      };

      const result = controller.createTransaction(transactionData);
      
      expect(result.status).toBe('error');
      expect(result.message).toBe('O usuário remetente não pode ser o mesmo que o destinatário');
    });
  });

  describe('getTransactionDetails', () => {
    it('should return transaction details successfully', () => {
      const transactionId = 'TXN_12345678-1234-1234-1234-123456789012';
      
      const result = controller.getTransactionDetails(transactionId);
      
      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
      expect(result.data?.transactionId).toBe(transactionId);
      expect(result.message).toBe('Detalhes da transação recuperados com sucesso');
    });

    it('should return error for empty transaction ID', () => {
      const result = controller.getTransactionDetails('');
      
      expect(result.status).toBe('error');
      expect(result.message).toBe('ID da transação é obrigatório');
    });

    it('should return error for invalid transaction ID format', () => {
      const result = controller.getTransactionDetails('invalid-id');
      
      expect(result.status).toBe('error');
      expect(result.message).toBe('Transação não encontrada');
    });
  });

  describe('getUserTransactions', () => {
    it('should return user transactions successfully', () => {
      const userId = 'user123';
      
      const result = controller.getUserTransactions(userId);
      
      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
      expect(result.totalCount).toBeDefined();
      expect(result.message).toBe('Lista de transações do usuário recuperada com sucesso');
    });

    it('should return error for empty user ID', () => {
      const result = controller.getUserTransactions('');
      
      expect(result.status).toBe('error');
      expect(result.message).toBe('ID do usuário é obrigatório');
    });

    it('should include both sent and received transactions', () => {
      const userId = 'user123';
      
      const result = controller.getUserTransactions(userId);
      
      expect(result.status).toBe('success');
      expect(result.data).toBeDefined();
      
      // Verificar se há transações onde o usuário é remetente ou destinatário
      const hasSentTransaction = result.data?.some(transaction => transaction.senderUserId === userId);
      const hasReceivedTransaction = result.data?.some(transaction => transaction.receiverUserId === userId);
      
      expect(hasSentTransaction || hasReceivedTransaction).toBe(true);
    });
  });
});
