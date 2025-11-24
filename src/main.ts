import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for React Native app
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("MeetBridge API")
    .setDescription(
      "Dating app backend API with real-time features - Complete with request/response examples for manual testing"
    )
    .setVersion("1.0")
    .setContact(
      "MeetBridge Team",
      "https://github.com/matanew1/meetbridge-backend",
      "support@meetbridge.com"
    )
    .setLicense("MIT", "https://opensource.org/licenses/MIT")
    .addServer("http://localhost:3001", "Development server")
    .addServer("https://api.meetbridge.com", "Production server")
    .addTag(
      "auth",
      "Authentication endpoints - Register, login, refresh tokens"
    )
    .addTag("users", "User management - Profile CRUD operations")
    .addTag("discovery", "Profile discovery and matching - Like/pass profiles")
    .addTag("chat", "Real-time messaging - Conversations and messages")
    .addTag(
      "notifications",
      "Push notifications - User notifications management"
    )
    .addTag(
      "missed-connections",
      "Missed connections feature - Location-based connections"
    )
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description:
          "Enter JWT token from login/register response (tokens are stored in Redis)",
        in: "header",
      },
      "JWT-auth"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
      docExpansion: "none",
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        // Add any custom request interceptors if needed
        return req;
      },
      responseInterceptor: (res) => {
        // Add any custom response interceptors if needed
        return res;
      },
    },
    customSiteTitle: "MeetBridge API Documentation",
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #ff6b6b }
      .swagger-ui .scheme-container { background: #f8f9fa }
    `,
    customfavIcon: "/favicon.ico",
  });

  // Start the server
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 MeetBridge Backend running on: http://localhost:${port}`);
  console.log(`📚 Swagger UI available at: http://localhost:${port}/api`);
}

bootstrap();
