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
      // Configurações melhoradas de conexão
      socketOptions: {
        heartbeatIntervalInSeconds: 30, // Reduzido para detectar problemas mais rápido
        reconnectTimeInSeconds: 3,
        clientProperties: {
          connection_name: 'bank-clients-service',
        },
      },
      // Configurações de qualidade de serviço
      prefetchCount: 10, // Processa até 10 mensagens simultaneamente
      // Retry policy
      noAck: false, // Garante acknowledgment manual
    },
  };
};

export const RABBITMQ_SERVICE = 'RABBITMQ_SERVICE';
