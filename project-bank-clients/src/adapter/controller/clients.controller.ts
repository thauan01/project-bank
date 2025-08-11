import { Controller, Get, Post, Patch, Param, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientsService } from '../../domain/service/clients.service';
import { UserDto } from '../dto/user.dto';

@ApiTags('users')
@Controller('api/users')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Get user information by ID including banking details
   * GET /api/users/:userId
   */
  @Get(':userId')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User information retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
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

  /**
   * Create a new user with personal and banking information
   * POST /api/users
   */
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid user data.' })
  async createUser(@Body() userDto: UserDto) {
    // Valida campos obrigatórios para criação
    if (!userDto.name || !userDto.email || !userDto.document) {
      throw new BadRequestException('Nome, email e documento são obrigatórios para criar um usuário');
    }

    // Prepara os dados para criação
    const createData: any = {
      name: userDto.name,
      email: userDto.email,
      document: userDto.document
    };

    if( userDto.balance !== undefined) {
      createData.balance = userDto.balance;
    } else {
      createData.balance = 0;
    }

    if (userDto.address !== undefined) {
      createData.address = userDto.address;
    }

    if (userDto.profilePicture !== undefined) {
      createData.profilePicture = userDto.profilePicture;
    }

    if (userDto.bankingDetails !== undefined) {
      if (userDto.bankingDetails.agency !== undefined) {
        createData.agency = userDto.bankingDetails.agency;
      }
      if (userDto.bankingDetails.accountNumber !== undefined) {
        createData.accountNumber = userDto.bankingDetails.accountNumber;
      }
    }

    // Delega toda a lógica de validação e criação para o serviço de domínio
    const result = await this.clientsService.createClient(createData);

    // Retorna o resultado do serviço com timestamp de criação
    return {
      ...result,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update user information including personal and banking details
   * PATCH /api/users/:userId
   */
  @Patch(':userId')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUser(@Param('userId') userId: string, @Body() userDto: UserDto) {
    // Prepara os dados para atualização
    const updateData: any = {};
    
    if (userDto.name !== undefined) {
      updateData.name = userDto.name;
    }
    
    if (userDto.email !== undefined) {
      updateData.email = userDto.email;
    }

    if (userDto.document !== undefined) {
      updateData.document = userDto.document;
    }
    
    if (userDto.address !== undefined) {
      updateData.address = userDto.address;
    }

    if (userDto.profilePicture !== undefined) {
      updateData.profilePicture = userDto.profilePicture;
    }
    
    if (userDto.bankingDetails !== undefined) {
      if (userDto.bankingDetails.agency !== undefined) {
        updateData.agency = userDto.bankingDetails.agency;
      }
      if (userDto.bankingDetails.accountNumber !== undefined) {
        updateData.accountNumber = userDto.bankingDetails.accountNumber;
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

  /**
   * Update user profile picture
   * PATCH /api/users/:userId/profile-picture
   */
  @Patch(':userId/profile-picture')
  @ApiOperation({ summary: 'Update user profile picture' })
  @ApiResponse({ status: 200, description: 'Profile picture updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
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
