import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";

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
  user: any;
}

@Injectable()
export class ClientsService {
  private clients: any[] = [];

  addClient(client: any): void {
    this.clients.push(client);
  }

  getClients(): any[] {
    return this.clients;
  }

  getClientById(id: string): any {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID do cliente é obrigatório');
    }

    const client = this.clients.find(client => client.id === id);
    
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    return client;
  }

  updateClient(id: string, updateData: UpdateUserData): UpdateUserResult {
    // Validação do ID
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID do cliente é obrigatório');
    }

    // Validação se há dados para atualizar
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new BadRequestException('Dados para atualização são obrigatórios');
    }

    // Verifica se o cliente existe
    const clientIndex = this.clients.findIndex(client => client.id === id);
    if (clientIndex === -1) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    // Validações de regras de negócio
    this.validateUpdateData(updateData);

    // Verifica se email já existe em outro cliente
    if (updateData.email) {
      const emailExists = this.clients.find(
        client => client.id !== id && client.email === updateData.email
      );
      if (emailExists) {
        throw new BadRequestException('Este email já está sendo usado por outro cliente');
      }
    }

    // Atualiza o cliente
    const originalClient = { ...this.clients[clientIndex] };
    this.clients[clientIndex] = {
      ...this.clients[clientIndex],
      ...updateData,
      updatedAt: new Date()
    };

    const updatedFields = Object.keys(updateData);

    return {
      success: true,
      message: 'Dados do cliente atualizados com sucesso',
      updatedFields,
      user: this.clients[clientIndex]
    };
  }

  updateProfilePicture(id: string, profilePicture: string): UpdateUserResult {
    // Validação do ID
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID do cliente é obrigatório');
    }

    // Validação da foto de perfil
    if (!profilePicture || profilePicture.trim() === '') {
      throw new BadRequestException('URL da foto de perfil é obrigatória');
    }

    // Verifica se o cliente existe
    const clientIndex = this.clients.findIndex(client => client.id === id);
    if (clientIndex === -1) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    // Validações específicas para foto de perfil
    this.validateProfilePicture(profilePicture);

    // Atualiza a foto de perfil
    this.clients[clientIndex] = {
      ...this.clients[clientIndex],
      profilePicture,
      updatedAt: new Date()
    };

    return {
      success: true,
      message: 'Foto de perfil atualizada com sucesso',
      updatedFields: ['profilePicture'],
      user: this.clients[clientIndex]
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

  deleteClient(id: string): void {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID do cliente é obrigatório');
    }

    const initialLength = this.clients.length;
    this.clients = this.clients.filter(client => client.id !== id);
    
    if (this.clients.length === initialLength) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
  }
}