import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { environmentConfig } from '../../config/environment.config';

@Controller()
export class EmailController {
  @MessagePattern(environmentConfig.rabbitMqQueue)
  handleMessage(message: any) {
    console.log('Mensagem recebida:', message);
  }
}