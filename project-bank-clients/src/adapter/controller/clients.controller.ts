import { Controller, Get, Patch, Param, Body, NotFoundException } from '@nestjs/common';
import { ClientsService } from '../../domain/service/clients.service';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('api/users')
export class AppController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.clientsService.getClientById(userId);

    // Retorna informações do cliente incluindo dados bancários
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      document: user.document,
      balance: user.balance,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      bankingData: {
        agency: user.agency || '0001',
        accountNumber: user.accountNumber || user.id?.slice(-8) || '00000000'
      }
    };
  }

  @Patch(':userId')
  async updateUser(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto) {
    // Prepara os dados para atualização
    const updateData: any = {};
    
    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }
    
    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email;
    }
    
    if (updateUserDto.address !== undefined) {
      updateData.address = updateUserDto.address;
    }
    
    if (updateUserDto.bankingDetails !== undefined) {
      if (updateUserDto.bankingDetails.agency !== undefined) {
        updateData.agency = updateUserDto.bankingDetails.agency;
      }
      if (updateUserDto.bankingDetails.accountNumber !== undefined) {
        updateData.accountNumber = updateUserDto.bankingDetails.accountNumber;
      }
    }

    // Delega toda a lógica de validação e atualização para o serviço de domínio
    const result = await this.clientsService.updateClient(userId, updateData);

    // Retorna o resultado do serviço com timestamp atualizado
    return {
      ...result,
      timestamp: new Date().toISOString()
    };
  }

  @Patch(':userId/profile-picture')
  async updateProfilePicture(
    @Param('userId') userId: string, 
    @Body('profilePicture') profilePicture: string
  ) {
    // Delega a atualização da foto de perfil para o serviço de domínio
    const result = await this.clientsService.updateProfilePicture(userId, profilePicture);

    // Retorna o resultado do serviço com timestamp atualizado
    return {
      ...result,
      timestamp: new Date().toISOString()
    };
  }
}
