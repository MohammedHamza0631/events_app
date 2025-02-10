# Real-time Event Management Platform

A modern, full-stack event management platform built with Next.js 14 and React 18, featuring real-time updates and interactive features.

## Demo Video

<!-- <video width="100%" controls>
  <source src="https://drive.google.com/file/d/1E-IVk_SmeOjyY5qPZtVJtoHwZo5h7l_T/view?usp=sharing" type="video/mp4">
  
</video> -->
<embed src="https://drive.google.com/file/d/1E-IVk_SmeOjyY5qPZtVJtoHwZo5h7l_T/view?usp=sharing" type="video/mp4" width="100%" height="100%">

## Key Features

- 🔐 **Advanced Authentication**
  - JWT-based authentication
  - Regular user registration/login
  - Guest user access with limited permissions
  - Protected routes and API endpoints

- 📅 **Event Management**
  - Create, edit, and delete events
  - Rich event details with image upload
  - Category-based organization
  - Attendee management with capacity limits
  - Real-time event updates

- ⚡ **Real-time Features**
  - Live updates for event changes
  - Real-time attendee list updates
  - Socket.IO integration
  - Instant notifications

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark/light mode support
  - Toast notifications
  - Loading states and animations
  - Form validation
  - Interactive date picker

## Tech Stack

- **Frontend:** 
  - Next.js 14
  - React 18
  - TailwindCSS
  - Shadcn UI
  - Socket.IO Client

- **Backend:**
  - Next.js API Routes
  - Socket.IO Server
  - MongoDB with Mongoose
  - JWT Authentication
  - Cloudinary Integration

## Prerequisites

- Node.js >= 18
- MongoDB Atlas Account
- Cloudinary Account

## Environment Variables

Create a \`.env.local\` file with:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_APP_URL=your_app_url
```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd event-management-platform
    ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## User Types

1. **Regular Users**
   - Full access to all features
   - Create and manage events
   - Register for events
   - Real-time updates

2. **Guest Users**
   - Limited access
   - Can view events
   - Can register for events
   - Cannot create/edit events

## API Routes

- **Authentication**
  - \`POST /api/auth/register\` - Register new user
  - \`POST /api/auth/login\` - User login
  - \`POST /api/auth/guest\` - Guest login

- **Events**
  - \`GET /api/events\` - List events with filters
  - \`POST /api/events\` - Create event
  - \`GET /api/events/[id]\` - Get event details
  - \`PUT /api/events/[id]\` - Update event
  - \`DELETE /api/events/[id]\` - Delete event
  - \`POST /api/events/[id]/attend\` - Register/unregister attendance
