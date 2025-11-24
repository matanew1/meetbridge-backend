# MeetBridge Backend

[![Docker Image CI](https://github.com/matanew1/meetbridge-backend/actions/workflows/docker-image.yml/badge.svg)](https://github.com/matanew1/meetbridge-backend/actions/workflows/docker-image.yml)

A modern, scalable dating app backend built with **NestJS**, **PostgreSQL + PostGIS**, **Redis**, and **Kafka**. Features real-time chat, geospatial matching, event-driven architecture, and comprehensive API documentation.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MeetBridge Backend                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   React Native  │    │   NestJS API    │    │   PostgreSQL    │  │
│  │   Frontend      │◄──►│  (Swagger UI)   │◄──►│  + PostGIS      │  │
│  │                 │    │                 │    │                 │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
│           │                       │                       │         │
│           ▼                       ▼                       ▼         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │     Redis       │    │     Kafka       │    │   Firebase      │  │
│  │    Cache        │    │   Events        │    │ Notifications   │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   GitHub Actions│    │   Docker        │    │   Kubernetes    │  │
│  │   CI/CD         │    │   Containers    │    │   Orchestration │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### **Core Framework**
- **NestJS** - Progressive Node.js framework for building efficient, scalable server-side applications
- **TypeScript** - Typed JavaScript for better development experience
- **Node.js 18+** - JavaScript runtime

### **Database & Storage**
- **PostgreSQL 15+** - Advanced open-source relational database
- **PostGIS** - Spatial database extension for geospatial data
- **TypeORM** - TypeScript ORM for database operations

### **Caching & Session Management**
- **Redis 7+** - In-memory data structure store for caching and sessions
- **Cache Manager** - NestJS caching abstraction

### **Message Broker & Events**
- **Apache Kafka** - Distributed event streaming platform
- **KafkaJS** - Kafka client for Node.js

### **Authentication & Security**
- **JWT (JSON Web Tokens)** - Stateless authentication
- **Passport.js** - Authentication middleware
- **bcrypt** - Password hashing
- **class-validator** - Input validation

### **Real-time Communication**
- **Socket.io** - Real-time bidirectional communication
- **WebSockets** - Full-duplex communication channels

### **API Documentation**
- **Swagger/OpenAPI** - Interactive API documentation
- **@nestjs/swagger** - Swagger integration for NestJS

### **File Upload & Processing**
- **Multer** - Middleware for handling file uploads
- **Sharp** - High-performance image processing

### **Push Notifications**
- **Firebase Admin SDK** - Server-side Firebase integration

### **Development & Testing**
- **Jest** - Testing framework
- **Supertest** - HTTP endpoint testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

### **Containerization & Deployment**
- **Docker** - Container platform
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipelines

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

### **Required Software**
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Download](https://www.docker.com/)
- **PostgreSQL 15+** (optional, can use Docker)
- **Redis 7+** (optional, can use Docker)
- **Git** - Version control system

### **System Requirements**
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB for dependencies and containers
- **OS**: Windows 10/11, macOS, or Linux

### **Optional Tools**
- **Postman** or **Insomnia** - API testing
- **DBeaver** or **pgAdmin** - Database management
- **Redis Desktop Manager** - Redis GUI
- **Kafka Tool** - Kafka management

## 🚀 Quick Start

### **1. Clone and Setup**

```bash
# Clone the repository
git clone <repository-url>
cd meetbridge-backend

# Install dependencies
npm install
```

### **2. Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# See Environment Variables section below
```

### **3. Start Infrastructure**

```bash
# Start all services (PostgreSQL, Redis, Kafka, Kafka UI)
docker-compose up -d

# Check if services are running
docker-compose ps
```

### **4. Database Setup**

```bash
# The database will be automatically initialized when containers start
# If you need to reset the database:
docker-compose exec postgres psql -U postgres -d meetbridge -f /docker-entrypoint-initdb.d/init.sql
```

### **5. Start Development Server**

```bash
# Start with hot reload
npm run start:dev

# Or start in production mode
npm run start:prod
```

### **6. Verify Installation**

- **API**: http://localhost:3001
- **Swagger UI**: http://localhost:3001/api
- **Kafka UI**: http://localhost:8080
- **Health Check**: http://localhost:3001/health

## 🔧 Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=meetbridge

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_SSL=false
KAFKA_USERNAME=
KAFKA_PASSWORD=
KAFKA_CLIENT_ID=meetbridge-backend

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Firebase Configuration (for push notifications)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DEST=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Geospatial Configuration
DEFAULT_SEARCH_RADIUS=50
MAX_SEARCH_RADIUS=100
EARTH_RADIUS_KM=6371

# Cache Configuration
CACHE_TTL=300
USER_PROFILE_CACHE_TTL=600
DISCOVERY_CACHE_TTL=180

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# Security
BCRYPT_ROUNDS=12
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

## 🗄️ Database Schema

### **Core Tables**

#### **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  bio TEXT,
  interests TEXT[],
  profile_picture_url VARCHAR(500),
  location GEOGRAPHY(POINT, 4326),
  geohash VARCHAR(12),
  is_active BOOLEAN DEFAULT true,
  is_profile_complete BOOLEAN DEFAULT false,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **matches**
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_mutual BOOLEAN DEFAULT false,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2)
);
```

#### **conversations**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participants UUID[] NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **messages**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Indexes**
```sql
-- Geospatial indexes
CREATE INDEX idx_users_location ON users USING GIST (location);
CREATE INDEX idx_users_geohash ON users (geohash);

-- Performance indexes
CREATE INDEX idx_matches_users ON matches (user_id_1, user_id_2);
CREATE INDEX idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_users_active ON users (is_active, is_profile_complete);
```

## 🏃 Running the Application

### **Development Mode**

```bash
# Start with hot reload
npm run start:dev

# Start with debug mode
npm run start:debug

# Start with file watching
npm run start:watch
```

### **Production Mode**

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### **Docker Development**

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Clean up volumes
docker-compose down -v
```

### **Individual Services**

```bash
# Start only database
docker-compose up postgres

# Start only Redis
docker-compose up redis

# Start only Kafka
docker-compose up kafka zookeeper
```

## 📚 API Documentation

### **Swagger UI**

Access interactive API documentation at: **http://localhost:3001/api**

Features:
- **Interactive Testing** - Test endpoints directly from the browser
- **JWT Authentication** - Built-in auth token management
- **Request/Response Examples** - Sample data for all endpoints
- **Schema Validation** - Automatic request validation

### **API Endpoints Overview**

#### **Authentication**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

#### **User Management**
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `POST /users/upload-avatar` - Upload profile picture
- `DELETE /users/account` - Delete user account

#### **Discovery & Matching**
- `GET /discovery/profiles` - Get discovery profiles
- `POST /discovery/like` - Like a profile
- `POST /discovery/pass` - Pass on a profile
- `GET /discovery/matches` - Get user matches

#### **Chat & Messaging**
- `GET /chat/conversations` - Get user conversations
- `GET /chat/conversations/:id` - Get conversation details
- `POST /chat/messages` - Send message
- `PUT /chat/messages/:id/read` - Mark message as read

#### **Notifications**
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

#### **Missed Connections**
- `GET /missed-connections` - Get missed connections
- `POST /missed-connections` - Create missed connection
- `DELETE /missed-connections/:id` - Delete missed connection

### **WebSocket Events**

Real-time events via Socket.io:

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});

// Listen for events
socket.on('message', (data) => {
  console.log('New message:', data);
});

socket.on('match', (data) => {
  console.log('New match:', data);
});

socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

## 🧪 Testing

### **Unit Tests**

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.service.spec.ts
```

### **End-to-End Tests**

```bash
# Run e2e tests
npm run test:e2e

# Run e2e tests with debug
npm run test:e2e:debug
```

### **Test Coverage**

Coverage reports are generated in the `coverage/` directory.

```bash
# View coverage report
open coverage/lcov-report/index.html
```

### **Manual Testing**

```bash
# Health check
curl http://localhost:3001/health

# API test with authentication
curl -X GET http://localhost:3001/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Deployment

### **Docker Production Build**

```bash
# Build production image
docker build -t meetbridge-backend:latest .

# Run production container
docker run -d \
  --name meetbridge-backend \
  -p 3001:3001 \
  --env-file .env \
  meetbridge-backend:latest
```

### **Docker Compose Production**

```bash
# Production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### **Kubernetes Deployment**

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods
kubectl get services
```

### **Environment-Specific Configurations**

```bash
# Staging
cp .env.example .env.staging

# Production
cp .env.example .env.production
```

## 🔍 Monitoring & Observability

### **Health Checks**

- **Application Health**: `GET /health`
- **Database Health**: `GET /health/database`
- **Redis Health**: `GET /health/redis`
- **Kafka Health**: `GET /health/kafka`

### **Metrics**

- **Prometheus Metrics**: `GET /metrics`
- **Application Metrics**: Response times, error rates
- **Database Metrics**: Connection pool, query performance
- **Cache Metrics**: Hit rates, memory usage

### **Logging**

Structured logging with configurable levels:

```json
{
  "timestamp": "2025-11-24T10:30:00.000Z",
  "level": "info",
  "message": "User logged in",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "ip": "192.168.1.1"
}
```

### **Kafka Monitoring**

- **Kafka UI**: http://localhost:8080
- **Topic Monitoring**: Message throughput, consumer lag
- **Event Tracking**: User events, system events

## 🔐 Security

### **Authentication**
- JWT tokens with refresh mechanism
- Password hashing with bcrypt
- Rate limiting on auth endpoints

### **Authorization**
- Role-based access control (RBAC)
- Route guards and decorators
- Permission-based API access

### **Data Protection**
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

### **Infrastructure Security**
- Environment variable secrets
- Docker security best practices
- Network segmentation
- SSL/TLS encryption

## 🛠️ Development Workflow

### **Code Quality**

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### **Git Workflow**

```bash
# Create feature branch
git checkout -b feature/user-authentication

# Make changes and commit
git add .
git commit -m "feat: implement user authentication"

# Push and create PR
git push origin feature/user-authentication
```

### **Pre-commit Hooks**

```bash
# Install husky for git hooks
npm run prepare

# Pre-commit checks (lint, test, format)
# Automatically run before each commit
```

## 🤝 Contributing

### **Development Setup**

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/meetbridge-backend.git`
3. Create feature branch: `git checkout -b feature/amazing-feature`
4. Install dependencies: `npm install`
5. Start development: `npm run start:dev`

### **Code Standards**

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with TypeScript support
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages

### **Testing Requirements**

- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: All API endpoints tested
- **E2E Tests**: Critical user flows covered

### **Pull Request Process**

1. Update documentation for API changes
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## 🔧 Troubleshooting

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Reset database
docker-compose exec postgres psql -U postgres -c "DROP DATABASE meetbridge;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE meetbridge;"
```

#### **Redis Connection Issues**
```bash
# Check Redis connectivity
docker-compose exec redis redis-cli ping

# View Redis logs
docker-compose logs redis

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

#### **Kafka Issues**
```bash
# Check Kafka broker
docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# View Kafka logs
docker-compose logs kafka

# Reset Kafka topics
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --delete --topic user.created
```

#### **Application Startup Issues**
```bash
# Check application logs
docker-compose logs backend

# Debug mode
npm run start:debug

# Check environment variables
node -e "console.log(require('dotenv').config())"
```

### **Performance Issues**

#### **Database Performance**
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Analyze table statistics
ANALYZE users;

-- Check index usage
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
```

#### **Cache Performance**
```bash
# Check Redis memory usage
docker-compose exec redis redis-cli info memory

# Monitor cache hit rates
# Implement application-level cache metrics
```

#### **Memory Leaks**
```bash
# Check Node.js memory usage
docker-compose exec backend node --inspect

# Profile application
npm run profile
```

### **Port Conflicts**
```bash
# Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

## 📊 Performance Optimization

### **Database Optimization**
- Connection pooling with TypeORM
- Query result caching
- Database indexes on frequently queried columns
- Partitioning for large tables

### **Caching Strategy**
- Multi-level caching (Redis + application)
- Cache invalidation patterns
- Cache warming for popular data

### **API Optimization**
- Response compression
- Pagination for large datasets
- Rate limiting
- Request/response caching

### **Real-time Optimization**
- WebSocket connection pooling
- Message batching
- Event debouncing

## 📈 Scaling

### **Horizontal Scaling**
- Stateless API design
- Redis for session storage
- Kafka for event distribution
- Load balancer configuration

### **Database Scaling**
- Read replicas for read-heavy operations
- Sharding strategy for large datasets
- Connection pooling
- Query optimization

### **Microservices Architecture**
- Service decomposition strategy
- API gateway pattern
- Inter-service communication
- Distributed tracing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**
- [API Documentation](http://localhost:3001/api)
- [Architecture Overview](./docs/architecture.md)
- [Deployment Guide](./docs/deployment.md)

### **Community**
- **Issues**: [GitHub Issues](https://github.com/matanew1/MeetBridge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/matanew1/MeetBridge/discussions)
- **Slack**: Join our [Slack Community](https://meetbridge.slack.com)

### **Contact**
- **Email**: support@meetbridge.com
- **Twitter**: [@meetbridgeapp](https://twitter.com/meetbridgeapp)
- **Website**: [https://meetbridge.com](https://meetbridge.com)

---


**Built with ❤️ for modern dating experiences**
