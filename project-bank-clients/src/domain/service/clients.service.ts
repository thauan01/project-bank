import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import { IUserRepository, UserData, OperationResult, UpdateResult } from '../interface';
import { User } from '../entity';
import { DI_USER_REPOSITORY } from "../../config/container-names.config";

@Injectable()
export class ClientsService {
  constructor(
    @Inject(DI_USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async createClient(createData: UserData): Promise<OperationResult> {
    // Validações de regras de negócio
    this.validateCreateData(createData);

    await this.validateDuplicateData(createData);

    // Define valores padrão para dados bancários se não fornecidos
    const userData: Partial<User> = {
      ...createData,
      balance: 0,
      isActive: true,
      agency: createData?.bankingDetails?.agency || '0001'
    };

    // Cria o cliente
    const newClient = await this.userRepository.create(userData);
    
    // Se não foi fornecido accountNumber, atualiza com um baseado no ID
    if (!createData?.bankingDetails?.accountNumber && newClient.id) {
      const generatedAccountNumber = newClient.id.slice(-8).padStart(8, '0');
      const updatedClient = await this.userRepository.update(newClient.id, { 
        accountNumber: generatedAccountNumber 
      });
      
      if (updatedClient) {
        newClient.accountNumber = generatedAccountNumber;
      }
    }

    return {
      success: true,
      message: 'Cliente criado com sucesso',
      user: newClient
    };
  }

  async getClients(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async getClientById(id: string): Promise<User> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID do cliente é obrigatório');
    }

    const client = await this.userRepository.findById(id);
    
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    return client;
  }

  async updateClient(id: string, updateData: UserData): Promise<UpdateResult> {
    // Validação do ID
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID do cliente é obrigatório');
    }

    // Validação se há dados para atualizar
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new BadRequestException('Dados para atualização são obrigatórios');
    }

    // Verifica se o cliente existe
    const existingClient = await this.userRepository.findById(id);
    if (!existingClient) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    // Validações de regras de negócio
    this.validateUpdateData(updateData);

    await this.validateDuplicateData(updateData);

    // Atualiza o cliente
    const updatedClient = await this.userRepository.update(id, updateData);
    if (!updatedClient) {
      throw new NotFoundException(`Erro ao atualizar cliente com ID ${id}`);
    }

    const updatedFields = Object.keys(updateData);

    return {
      success: true,
      message: 'Dados do cliente atualizados com sucesso',
      updatedFields,
      user: updatedClient
    };
  }

  async updateProfilePicture(id: string, profilePicture: string): Promise<UpdateResult> {
    // Validação do ID
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID do cliente é obrigatório');
    }

    // Validação da foto de perfil
    if (!profilePicture || profilePicture.trim() === '') {
      throw new BadRequestException('URL da foto de perfil é obrigatória');
    }

    // Verifica se o cliente existe
    const existingClient = await this.userRepository.findById(id);
    if (!existingClient) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    // Validações específicas para foto de perfil
    this.validateProfilePicture(profilePicture);

    // Atualiza a foto de perfil
    const updatedClient = await this.userRepository.update(id, { profilePicture } as any);
    if (!updatedClient) {
      throw new NotFoundException(`Erro ao atualizar foto de perfil do cliente com ID ${id}`);
    }

    return {
      success: true,
      message: 'Foto de perfil atualizada com sucesso',
      updatedFields: ['profilePicture'],
      user: updatedClient
    };
  }

  private validateUpdateData(updateData: UserData): void {
    // Validação do nome
    if (updateData.name !== undefined) {
      if (!updateData.name || updateData.name.trim().length < 2) {
        throw new BadRequestException('Nome deve ter pelo menos 2 caracteres');
      }
      if (updateData.name.length > 100) {
        throw new BadRequestException('Nome não pode ter mais de 100 caracteres');
      }
    }

    // Validação do email
    if (updateData.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!updateData.email || !emailRegex.test(updateData.email)) {
        throw new BadRequestException('Email deve ter um formato válido');
      }
      if (updateData.email.length > 100) {
        throw new BadRequestException('Email não pode ter mais de 100 caracteres');
      }
    }

    // Validação do documento
    if (updateData.document.length > 20) {
      throw new BadRequestException('Documento não pode ter mais de 20 caracteres');
    }

    // Validação do endereço
    if (updateData.address !== undefined) {
      if (updateData.address && updateData.address.length > 255) {
        throw new BadRequestException('Endereço não pode ter mais de 255 caracteres');
      }
    }

    // Validação da foto de perfil
    if (updateData.profilePicture !== undefined && updateData.profilePicture) {
      this.validateProfilePicture(updateData.profilePicture);
    }
  }

  private validateCreateData(createData: UserData): void {
    // Validação do nome
    if (!createData.name || createData.name.trim().length < 2) {
      throw new BadRequestException('Nome deve ter pelo menos 2 caracteres');
    }
    if (createData.name.length > 100) {
      throw new BadRequestException('Nome não pode ter mais de 100 caracteres');
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!createData.email || !emailRegex.test(createData.email)) {
      throw new BadRequestException('Email deve ter um formato válido');
    }
    if (createData.email.length > 100) {
      throw new BadRequestException('Email não pode ter mais de 100 caracteres');
    }

    // Validação do documento
    if (!createData.document || createData.document.trim().length < 11) {
      throw new BadRequestException('Documento deve ter pelo menos 11 caracteres');
    }
    if (createData.document.length > 20) {
      throw new BadRequestException('Documento não pode ter mais de 20 caracteres');
    }

    // Validação do endereço
    if (createData.address !== undefined && createData.address && createData.address.length > 255) {
      throw new BadRequestException('Endereço não pode ter mais de 255 caracteres');
    }

    // Validação da foto de perfil, se fornecida
    if (createData.profilePicture !== undefined && createData.profilePicture) {
      this.validateProfilePicture(createData.profilePicture);
    }
  }

  private validateProfilePicture(profilePicture: string): void {
    // Validação de URL
    try {
      new URL(profilePicture);
    } catch {
      throw new BadRequestException('URL da foto de perfil deve ser válida');
    }

    // Validação de protocolo (apenas HTTPS para segurança)
    if (!profilePicture.startsWith('https://')) {
      throw new BadRequestException('URL da foto de perfil deve usar protocolo HTTPS');
    }

    // Validação de tamanho da URL
    if (profilePicture.length > 500) {
      throw new BadRequestException('URL da foto de perfil não pode ter mais de 500 caracteres');
    }

    // Validação de extensões de arquivo permitidas
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasValidExtension = allowedExtensions.some(ext => 
      profilePicture.toLowerCase().includes(ext)
    );

    if (!hasValidExtension) {
      throw new BadRequestException(
        'Foto de perfil deve ser uma imagem válida (.jpg, .jpeg, .png, .webp, .gif)'
      );
    }

    // Validação de domínios permitidos (opcional - para maior segurança)
    const allowedDomains = [
      'amazonaws.com',
      'cloudinary.com',
      'imgur.com',
      'googleusercontent.com',
      'github.com',
      'gravatar.com'
    ];

    const url = new URL(profilePicture);
    const isAllowedDomain = allowedDomains.some(domain => 
      url.hostname.includes(domain)
    );

    if (!isAllowedDomain) {
      throw new BadRequestException(
        'Foto de perfil deve ser hospedada em um domínio confiável'
      );
    }
  }

  async deleteClient(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID do cliente é obrigatório');
    }

    const existingClient = await this.userRepository.findById(id);
    if (!existingClient) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    await this.userRepository.softDelete(id);
  }

  private async validateDuplicateData(createData: UserData): Promise<void> {
    // Verifica se email já existe
    const emailExists = await this.userRepository.findByEmail(createData.email);
    if (emailExists) {
      throw new BadRequestException('Este email já está sendo usado por outro cliente');
    }

    // Verifica se documento já existe
    const documentExists = await this.userRepository.findByDocument(createData.document);
    if (documentExists) {
      throw new BadRequestException('Este documento já está sendo usado por outro cliente');
    }
  }
}