# ServiceMatch Setup Guide

# ServiceMatch Setup Guide

## 📋 Current Features

### ✅ Completed Features

- **User Authentication**: Login/Register for customers and professionals
- **Customer Dashboard**: Job posting and management
- **Professional Dashboard**: Match viewing and profile management
- **Real-time Messaging**: Socket.io-based chat system
- **Database Integration**: PostgreSQL with Knex.js migrations
- **API Endpoints**: RESTful APIs for all core functionality

### 🔄 In Progress

- Video upload system (next priority)
- Payment integration
- Enhanced matching algorithm

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or install individually
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your configuration
nano .env
```

### 3. Database Setup

```bash
# Make sure PostgreSQL is running
# Create database
createdb servicematch_dev

# Run migrations
cd server
npx knex migrate:latest
```

### 4. Start Development

```bash
# Start all services
npm run dev

# Or start individually
npm run server:dev    # Backend on :5000
npm run client:dev    # Frontend on :3000
```

## 🔧 VS Code Setup

### Required Extensions

Install these VS Code extensions for the best development experience:

1. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **TypeScript** (`ms-vscode.vscode-typescript-next`)

### VS Code Settings

The project includes `.vscode/settings.json` with:

- CSS validation disabled for Tailwind
- Tailwind IntelliSense configuration
- TypeScript support

## 🎨 CSS & Styling

### Tailwind CSS Configuration

- **Config**: `client/tailwind.config.js`
- **PostCSS**: `client/postcss.config.js`
- **Global Styles**: `client/styles/globals.css`

### CSS Linting

```bash
# Fix CSS linting issues
cd client
npm run lint:css
```

## 🗄️ Database

### Schema

- **Users**: Customer and professional accounts
- **Professionals**: Business profiles and service areas
- **Jobs**: Customer job postings
- **Matches**: Swipe-based connections
- **Messages**: Real-time chat
- **Payments**: Stripe payment records

### Migrations

```bash
cd server
npx knex migrate:latest    # Run migrations
npx knex migrate:rollback # Rollback last migration
npx knex seed:run        # Run seed data
```

## 🔐 Environment Variables

### Required Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=servicematch_dev
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# AWS S3 (for video uploads)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-west-2
AWS_S3_BUCKET=servicematch-videos

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

## 🚨 Troubleshooting

### CSS Linting Issues

If you see "Unknown at rule @tailwind" errors:

1. **Install Tailwind CSS IntelliSense extension**
2. **Restart VS Code**
3. **Run CSS linting fix**:
   ```bash
   cd client
   npm run lint:css
   ```

### Database Connection Issues

```bash
# Check PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Test connection
psql -h localhost -U postgres -d servicematch_dev
```

### Port Conflicts

```bash
# Check what's using port 3000 or 5000
lsof -i :3000
lsof -i :5000

# Kill processes if needed
kill -9 <PID>
```

## 📱 Development Workflow

### Backend Development

```bash
cd server
npm run dev  # Auto-restart on changes
```

### Frontend Development

```bash
cd client
npm run dev  # Hot reload enabled
```

### Full Stack Development

```bash
# From project root
npm run dev  # Runs both server and client
```

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## 📦 Production Build

### Build Frontend

```bash
cd client
npm run build
```

### Start Production Server

```bash
cd server
npm start
```

## 🔍 Debugging

### Backend Debugging

- Check server logs in terminal
- Use `console.log()` for debugging
- Check database connections

### Frontend Debugging

- Use browser dev tools
- Check Network tab for API calls
- Use React DevTools extension

### Database Debugging

```bash
# Connect to database
psql -h localhost -U postgres -d servicematch_dev

# Check tables
\dt

# Check specific table
SELECT * FROM users LIMIT 5;
```

## 🚀 Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up AWS S3 bucket
4. Configure Stripe keys
5. Set up domain and SSL

### Build for Production

```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

---

**Need help?** Check the project documentation or create an issue in the repository.
