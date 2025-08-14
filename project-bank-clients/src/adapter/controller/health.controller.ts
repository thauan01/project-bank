import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RabbitMQHealthService } from '../messaging/rabbitmq-health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly rabbitmqHealthService: RabbitMQHealthService,
  ) {}

  @Get('rabbitmq')
  @ApiOperation({ summary: 'Verifica o status da conexão RabbitMQ' })
  @ApiResponse({ 
    status: 200, 
    description: 'Status da conexão RabbitMQ',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'unhealthy'] },
        details: { type: 'string' },
        timestamp: { type: 'string' }
      }
    }
  })
  async checkRabbitMQ() {
    const health = await this.rabbitmqHealthService.checkHealth();
    return {
      ...health,
      timestamp: new Date().toISOString(),
    };
  }
}
