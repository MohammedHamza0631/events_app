# Event Management Platform

A full-stack event management platform built with Next.js, MongoDB, and Socket.IO. This platform allows users to create, manage, and view events with real-time updates for attendees.

## Features

- 👤 User Authentication (JWT)
- 📅 Event Creation and Management
- 🔄 Real-time Updates
- 📱 Responsive Design
- 🖼️ Image Upload (Cloudinary)
- 🎨 Modern UI with Tailwind CSS and Shadcn-UI

## Tech Stack

- **Frontend:** Next.js (App Router)
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas
- **Authentication:** JWT
- **Real-time:** Socket.IO
- **Image Storage:** Cloudinary
- **Styling:** Tailwind CSS with Shadcn-UI

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Cloudinary account

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd event-management-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your environment variables:
     - MongoDB Atlas connection string
     - JWT secret key
     - Cloudinary credentials

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Test Credentials

For testing purposes, you can use these credentials:

```
Email: test@example.com
Password: test123
```

Or use the "Guest Login" feature to explore with limited access.

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/guest` - Guest login

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event
- `POST /api/events/[id]/attend` - Register attendance

## Deployment

This application is deployed on Vercel. The database is hosted on MongoDB Atlas, and images are stored on Cloudinary.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
