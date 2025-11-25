import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { KafkaService } from "./kafka.service";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "KAFKA_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_BROKERS || "localhost:9092"],
            logLevel: 2, // WARN level to reduce INFO logs, but keep ERROR and WARN
          },
          consumer: {
            groupId: "meetbridge-backend",
            sessionTimeout: 30000,
            rebalanceTimeout: 60000,
          },
        },
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService, ClientsModule],
})
export class KafkaModule {}
