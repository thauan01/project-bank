import { RmqOptions, Transport } from '@nestjs/microservices';

export const getRabbitMQConfig = (): RmqOptions => {
  return {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: process.env.RABBITMQ_QUEUE || 'bank-transaction-to-client-queue',
      queueOptions: {
        durable: true,
      },
      // Configurações de reconexão automática
      socketOptions: {
        heartbeatIntervalInSeconds: 60,
        reconnectTimeInSeconds: 5,
      },
    },
  };
};

export const RABBITMQ_SERVICE = 'RABBITMQ_SERVICE';
