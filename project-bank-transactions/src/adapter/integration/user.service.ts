import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { 
  IUserIntegrationService, 
  UserApiResponse, 
  UserCreateUpdateData, 
  BankingData 
} from '../../domain/interface';

/**
 * Serviço de integração com a API de clientes
 * Conecta-se aos endpoints do clients.controller.ts para operações de usuário
 */
@Injectable()
export class UserService implements IUserIntegrationService {
  private readonly logger = new Logger(UserService.name);
  private readonly clientsApiUrl: string;

  constructor() {
    // URL base do serviço de clientes - pode ser configurada via variável de ambiente
    this.clientsApiUrl = process.env.CLIENTS_API_URL || 'http://localhost:3001';
    this.logger.log(`UserService inicializado com URL: ${this.clientsApiUrl}`);
  }

  /**
   * Busca informações completas de um usuário por ID
   * Conecta-se ao endpoint GET /api/users/:userId
   */
  async getUserById(userId: string): Promise<UserApiResponse> {
    try {
      const url = `${this.clientsApiUrl}/api/users/${userId}`;
      this.logger.debug(`Buscando usuário por ID: ${userId} na URL: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
        }
        throw new Error(`Erro na API de clientes: ${response.status} - ${response.statusText}`);
      }

      const userData = await response.json();
      this.logger.debug(`Usuário encontrado: ${userData.name} (${userData.email})`);
      
      return userData;
    } catch (error) {
      this.logger.error(`Erro ao buscar usuário ${userId}:`, error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Falha na comunicação com o serviço de clientes: ${error.message}`);
    }
  }

  /**
   * Cria um novo usuário
   * Conecta-se ao endpoint POST /api/users
   */
  async createUser(userData: UserCreateUpdateData): Promise<UserApiResponse> {
    try {
      const url = `${this.clientsApiUrl}/api/users`;
      this.logger.debug(`Criando usuário: ${userData.name} na URL: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new BadRequestException(errorData.message || 'Dados inválidos para criação do usuário');
        }
        throw new Error(`Erro na API de clientes: ${response.status} - ${response.statusText}`);
      }

      const createdUser = await response.json();
      this.logger.log(`Usuário criado com sucesso: ${createdUser.id} - ${createdUser.name}`);
      
      return createdUser;
    } catch (error) {
      this.logger.error(`Erro ao criar usuário:`, error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Falha na comunicação com o serviço de clientes: ${error.message}`);
    }
  }

  /**
   * Atualiza informações de um usuário existente
   * Conecta-se ao endpoint PATCH /api/users/:userId
   */
  async updateUser(userId: string, userData: UserCreateUpdateData): Promise<UserApiResponse> {
    try {
      const url = `${this.clientsApiUrl}/api/users/${userId}`;
      this.logger.debug(`Atualizando usuário ${userId} na URL: ${url}`);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new BadRequestException(errorData.message || 'Dados inválidos para atualização do usuário');
        }
        throw new Error(`Erro na API de clientes: ${response.status} - ${response.statusText}`);
      }

      const updatedUser = await response.json();
      this.logger.log(`Usuário atualizado com sucesso: ${updatedUser.id} - ${updatedUser.name}`);
      
      return updatedUser;
    } catch (error) {
      this.logger.error(`Erro ao atualizar usuário ${userId}:`, error.message);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Falha na comunicação com o serviço de clientes: ${error.message}`);
    }
  }

  /**
   * Atualiza a foto de perfil de um usuário
   * Conecta-se ao endpoint PATCH /api/users/:userId/profile-picture
   */
  async updateProfilePicture(userId: string, profilePicture: string): Promise<UserApiResponse> {
    try {
      const url = `${this.clientsApiUrl}/api/users/${userId}/profile-picture`;
      this.logger.debug(`Atualizando foto de perfil do usuário ${userId} na URL: ${url}`);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePicture }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundException(`Usuário com ID ${userId} não encontrado`);
        }
        throw new Error(`Erro na API de clientes: ${response.status} - ${response.statusText}`);
      }

      const updatedUser = await response.json();
      this.logger.log(`Foto de perfil atualizada para usuário: ${updatedUser.id}`);
      
      return updatedUser;
    } catch (error) {
      this.logger.error(`Erro ao atualizar foto de perfil do usuário ${userId}:`, error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Falha na comunicação com o serviço de clientes: ${error.message}`);
    }
  }

  /**
   * Verifica se um usuário existe
   * Método utilitário que usa getUserById internamente
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      await this.getUserById(userId);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      // Re-lança outros erros (falhas de comunicação, etc.)
      throw error;
    }
  }

  /**
   * Obtém apenas o saldo de um usuário
   * Método utilitário para operações que precisam apenas do saldo
   */
  async getUserBalance(userId: string): Promise<number> {
    try {
      const user = await this.getUserById(userId);
      return user.balance;
    } catch (error) {
      this.logger.error(`Erro ao obter saldo do usuário ${userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Obtém dados bancários de um usuário
   * Método utilitário para operações que precisam dos dados bancários
   */
  async getUserBankingData(userId: string): Promise<BankingData> {
    try {
      const user = await this.getUserById(userId);
      return user.bankingData;
    } catch (error) {
      this.logger.error(`Erro ao obter dados bancários do usuário ${userId}:`, error.message);
      throw error;
    }
  }
}