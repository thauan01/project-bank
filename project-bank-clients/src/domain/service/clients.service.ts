import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import { IUserRepository } from '../interface';
import { User } from '../entity';

export interface UpdateUserData {
  name?: string;
  email?: string;
  address?: string;
  agency?: string;
  accountNumber?: string;
}

export interface UpdateUserResult {
  success: boolean;
  message: string;
  updatedFields: string[];
  user: User;
}

@Injectable()
export class ClientsService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: IUserRepository
  ) {}

  async addClient(clientData: Partial<User>): Promise<User> {
    return await this.userRepository.create(clientData);
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

  async updateClient(id: string, updateData: UpdateUserData): Promise<UpdateUserResult> {
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

    // Verifica se email já existe em outro cliente
    if (updateData.email) {
      const emailExists = await this.userRepository.findByEmail(updateData.email);
      if (emailExists && emailExists.id !== id) {
        throw new BadRequestException('Este email já está sendo usado por outro cliente');
      }
    }

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

  async updateProfilePicture(id: string, profilePicture: string): Promise<UpdateUserResult> {
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

  private validateUpdateData(updateData: UpdateUserData): void {
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

    // Validação do endereço
    if (updateData.address !== undefined) {
      if (updateData.address && updateData.address.length > 255) {
        throw new BadRequestException('Endereço não pode ter mais de 255 caracteres');
      }
    }

    // Validação da agência
    if (updateData.agency !== undefined) {
      if (updateData.agency && !/^\d{4}$/.test(updateData.agency)) {
        throw new BadRequestException('Agência deve conter exatamente 4 dígitos');
      }
    }

    // Validação do número da conta
    if (updateData.accountNumber !== undefined) {
      if (updateData.accountNumber && !/^\d{6,12}$/.test(updateData.accountNumber)) {
        throw new BadRequestException('Número da conta deve conter entre 6 e 12 dígitos');
      }
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
}