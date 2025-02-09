# Event Management Platform Documentation

This document provides a comprehensive guide to the Event Management Platform, detailing its architecture, features, data flow, and recommended folder structure for a Next.js project using the new App Router (without a src directory). This guide is intended to help developers understand and implement the project efficiently.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Application Flow](#application-flow)
   - [User Authentication Flow](#user-authentication-flow)
   - [Event Management Flow](#event-management-flow)
   - [Real-Time Updates Flow](#real-time-updates-flow)
4. [Tech Stack & Tools](#tech-stack--tools)
5. [Folder Structure](#folder-structure)
6. [API Endpoints](#api-endpoints)
7. [Environment Variables](#environment-variables)
8. [Deployment](#deployment)
9. [Testing & Evaluation](#testing--evaluation)
10. [Additional Notes](#additional-notes)

---

## Overview

The Event Management Platform is a full-stack web application that enables users to create, manage, and view events. Built with Next.js (using the App Router) for both frontend and backend functionalities, it leverages JWT for secure authentication, MongoDB Atlas for data storage, Cloudinary for image hosting, and Socket.IO for real-time communication. The UI is styled using Tailwind CSS integrated with Shadcn-UI components to ensure a modern, responsive design.

---

## Features

### 1. User Authentication
- **Registration & Login:**  
  Users can sign up and log in using their email and password. Authentication is handled via JSON Web Tokens (JWT) for secure session management. Ensure to validate user inputs to prevent security vulnerabilities such as SQL injection or XSS attacks.
  
- **Guest Login:**  
  Provides limited access to users who want to explore the platform without full registration. Consider implementing rate limiting to prevent abuse of guest access.

### 2. Event Dashboard
- **Event Listings:**  
  Displays both upcoming and past events. Use pagination or infinite scrolling to enhance performance and user experience.
  
- **Filters & Search:**  
  Allows users to filter events by categories, dates, or keywords. Implement debounce on search inputs to reduce unnecessary API calls.

### 3. Event Creation & Management
- **Event Form:**  
  A user-friendly form to create events with fields such as event name, description, date/time, and image upload. Use form validation libraries like Formik or React Hook Form for better user input handling.
  
- **CRUD Operations:**  
  Users can create, read, update, and delete events. Only the event creator can modify or delete their events. Implement optimistic UI updates to improve user experience during these operations.
  
- **Event Detail Page:**  
  Provides a detailed view of each event including a real-time attendee list. Use lazy loading for images and other heavy resources to improve page load times.

### 4. Real-Time Updates
- **Attendee Count:**  
  Real-time updates to the attendee list using Socket.IO. Ensure efficient handling of socket connections to prevent memory leaks.
  
- **Socket.IO Integration:**  
  Ensures that changes (like a new attendee registration) are broadcasted instantly to all connected clients. Consider using namespaces and rooms for better organization of socket events.

### 5. Responsive Design & UI/UX
- **Mobile-First Design:**  
  Ensures optimal performance and usability across all device types. Use media queries and responsive units (e.g., rem, em) for better adaptability.
  
- **Tailwind CSS & Shadcn-UI:**  
  Delivers a modern and consistent interface. Utilize Tailwind's utility-first approach to maintain a clean and maintainable stylesheet.

---

## Application Flow

### User Authentication Flow

1. **Registration:**
   - The user fills out the registration form.
   - The form data (email, password, username) is submitted to the authentication API (/api/auth/route.js).
   - The backend validates the input, hashes the password, saves the user in MongoDB, and returns a JWT.
   - The JWT is stored client-side (e.g., in cookies or local storage) to manage the session.
   - **Best Practice:** Use HTTPS to secure data transmission and consider using HttpOnly cookies for storing JWTs to prevent XSS attacks.

2. **Login:**
   - The user submits the login form with their credentials.
   - The credentials are verified via the authentication API.
   - Upon successful verification, a JWT is issued and stored on the client-side.
   - The user is redirected to the Event Dashboard.
   - **Best Practice:** Implement account lockout mechanisms after multiple failed login attempts to prevent brute force attacks.

3. **Guest Login:**
   - A temporary session is created with limited permissions.
   - Certain features (like event creation) may be restricted for guest users.
   - **Best Practice:** Clearly communicate the limitations of guest access to users.

### Event Management Flow

1. **Event Dashboard:**
   - After authentication, the user lands on the dashboard.
   - A GET request to /api/events/route.js fetches all relevant events.
   - Users can apply filters (by date, category, etc.) to customize the displayed events.
   - **Best Practice:** Cache frequently accessed data to reduce server load and improve response times.

2. **Creating an Event:**
   - The user navigates to the event creation page, which displays the EventForm component.
   - The form allows input for event details such as name, description, date/time, and image.
   - If an image is uploaded, it is sent to Cloudinary using their API.
   - A POST request is made to /api/events/route.js with the event details (including the Cloudinary image URL).
   - The backend saves the event in MongoDB and returns the new event data.
   - **Best Practice:** Validate and sanitize all inputs on both client and server sides to prevent injection attacks.

3. **Editing & Deleting Events:**
   - For events owned by the user, options to edit or delete are available.
   - Editing sends a PUT request to /api/events/[id]/route.js with updated event details.
   - Deleting sends a DELETE request to /api/events/[id]/route.js.
   - Ownership checks are enforced to ensure only the creator can make changes.
   - **Best Practice:** Use optimistic concurrency control to handle concurrent updates gracefully.

### Real-Time Updates Flow

1. **Socket.IO Server Setup:**
   - The Socket.IO server is initialized (typically in /lib/socket.js) and integrated with Next.js API routes.
   - When an event's attendee list is updated, the server emits an event to all connected clients.
   - **Best Practice:** Monitor and manage socket connections to prevent resource exhaustion.

2. **Client Integration:**
   - On event pages, the client establishes a Socket.IO connection.
   - The client listens for real-time updates (e.g., new attendees) and updates the UI accordingly.
   - **Best Practice:** Implement reconnection logic to handle network interruptions gracefully.

---

## Tech Stack & Tools

- **Frontend:**  
  Next.js (App Router), JavaScript, Tailwind CSS, Shadcn-UI
- **Backend:**  
  Next.js API routes
- **Authentication:**  
  Email and password authentication using JWT
- **Database:**  
  MongoDB Atlas (Cloud-hosted)
- **Image Storage:**  
  Cloudinary (Free Tier)
- **Real-Time Communication:**  
  Socket.IO
- **Hosting:**  
  Vercel for both frontend and backend

---

## Folder Structure

Below is the recommended folder structure for a Next.js project using the App Router (without a src directory):

/app
├── /api
│   ├── /auth
│   │   └── route.js          // Handles authentication (login, register, etc.)
│   └── /events
│       ├── /[id]
│       │   └── route.js      // GET, PUT, DELETE for a specific event
│       └── route.js          // GET (list events) and POST (create event)
├── /styles
│   └── globals.css           // Global CSS (includes Tailwind CSS imports)
├── layout.js                 // Root layout for the application (includes common UI like Header/Footer)
└── page.js                   // Landing page (could serve as a public homepage or login page)

/components
├── Header.js                 // Navigation and header component
├── Footer.js                 // Footer component
├── EventCard.js              // Component for displaying event summary
├── EventForm.js              // Form component for event creation/editing
├── AttendeeList.js           // Component to display real-time attendee list
└── /ui                       // Shadcn-UI components
    ├── Button.js
    ├── Input.js
    ├── Modal.js
    ├── Card.js
    └── OtherShadcnComponents.js
.env
/lib
├── db.js                     // MongoDB connection setup and helper functions
├── auth.js                   // Helper functions for JWT authentication and verification
└── socket.js                 // Socket.IO server initialization and configuration
|__ cloudinary.js             // Cloudinary configuration

/public
└── /images                   // Static images, if any

README.md                     // The documentation file

---

## API Endpoints

### Authentication Endpoints

- **POST /api/auth/route.js**
  - Handles user registration and login.
  - Validates input, hashes passwords, and issues JWTs.
  - **Example:**  
    ```json
    {
      "email": "user@example.com",
      "password": "securePassword123"
    }
    ```

### Event Endpoints

- **GET /api/events/route.js**
  - Retrieves a list of events (with optional query parameters for filtering).
  - **Example:**  
    ```json
    {
      "category": "music",
      "date": "2023-10-15"
    }
    ```
  
- **POST /api/events/route.js**
  - Creates a new event.
  - **Example:**  
    ```json
    {
      "name": "Tech Conference 2023",
      "description": "A conference about the latest in tech.",
      "date": "2023-11-20",
      "imageUrl": "https://cloudinary.com/image.jpg"
    }
    ```

- **GET /api/events/[id]/route.js**
  - Retrieves details of a specific event.
  
- **PUT /api/events/[id]/route.js**
  - Updates a specific event (ownership validation required).
  
- **DELETE /api/events/[id]/route.js**
  - Deletes a specific event (ownership validation required).

### Real-Time Communication

- **Socket.IO Integration:**
  - Socket events are managed in /lib/socket.js.
  - Clients connect via Socket.IO to listen for updates (e.g., attendee count changes).

---

## Environment Variables

Create a .env.local file in the project root with the following variables:

MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Optional: Additional variables for Socket.IO if needed

---

## Deployment

- **Hosting Platform:**  
  Vercel is used to deploy both the frontend and backend (via Next.js API routes).
- **Database:**  
  MongoDB Atlas is used as the cloud database.
- **Image Hosting:**  
  Cloudinary Free Tier for managing event images.
- **Real-Time Communication:**  
  Socket.IO is integrated within the Next.js API routes and works with Vercel's serverless environment.

---

## Testing & Evaluation

- **Test User Credentials:**  
  Provide sample credentials (e.g., in the README) for demo purposes.
- **Functionality Testing:**  
  Verify all flows including registration, login, event CRUD operations, and real-time updates.
- **UI/UX Testing:**  
  Ensure the platform is responsive across devices and that the UI components (using Tailwind CSS & Shadcn-UI) are intuitive.
- **Performance:**  
  Test for efficient handling of multiple simultaneous users, especially in real-time scenarios.

---

## Additional Notes

- **Code Quality:**  
  Aim for modular, clean, and well-documented code. Use inline comments to explain complex logic.
- **Trade-Offs:**  
  - The use of JWT and serverless functions (via Vercel) may introduce cold start delays; caching strategies or warm-up scripts can help mitigate this.
  - Real-time updates via Socket.IO in a serverless environment might require careful connection management.
- **README:**  
  Ensure the GitHub repository contains this documentation, setup instructions, and details on how to run the application locally.

