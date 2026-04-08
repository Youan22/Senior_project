# ServiceMatch

A revolutionary video-first marketplace that connects homeowners with verified service professionals through an engaging, dating-app-style interface.

## Architecture

- **Frontend**: Next.js (Web) + React Native (Mobile)
- **Backend**: Node.js/Express
- **Database**: PostgreSQL
- **Storage**: AWS S3 (videos)
- **Payments**: Stripe
- **Real-time**: Socket.io

## Quick Start

1. Install dependencies:

```bash
npm run install:all
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development servers:

```bash
npm run dev
```

## Project Structure

```
servicematch/
├── client/          # Next.js web application
├── mobile/          # React Native mobile app
├── server/          # Node.js/Express backend
├── shared/          # Shared types and utilities
└── docs/            # Documentation
```

## Features

- 🎥 Video-first professional profiles
- 💝 Swipe-based matching system
- 💰 Match-based monetization
- 🔒 Trust & verification system
- 📱 Mobile-optimized experience
- 💬 Real-time messaging
- 💳 Secure payments

## Development Roadmap

- [x] Project setup
- [ ] Authentication system
- [ ] Video upload & storage
- [ ] Matching algorithm
- [ ] Payment integration
- [ ] Real-time messaging
- [ ] Mobile app
- [ ] AI video analysis
- [ ] Advanced booking system
