# replit.md

## Overview

Yaltaqi is a real-time video conferencing web application with Arabic-first design and full RTL (Right-to-Left) language support. The platform enables users to create and join video meetings with features like HD video streaming, screen sharing, live chat, and device management. Built as a full-stack application with React frontend and Express backend, it supports both instant meeting creation and joining via access codes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming and RTL support
- **State Management**: Zustand for global application state with persistence middleware
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack React Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Real-time Communication**: WebSocket server for signaling and chat
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Development**: Vite middleware integration for SSR development mode

### Database Schema
- **Users**: Authentication and profile management
- **Rooms**: Meeting room configuration with settings (max participants, waiting room, etc.)
- **Room Participants**: Active meeting participants with join/leave tracking
- **Chat Messages**: Real-time messaging within meetings
- **Schema Validation**: Zod schemas generated from Drizzle tables

### Real-time Features
- **WebRTC**: Peer-to-peer video/audio streaming with STUN server configuration
- **WebSocket Signaling**: Room management, participant coordination, and chat messaging
- **Media Management**: Camera, microphone, and screen sharing controls with device enumeration

### Internationalization
- **Multi-language Support**: English and Arabic with complete RTL layout support
- **Dynamic Text Direction**: Automatic layout switching based on language selection
- **Persistent Preferences**: Language and theme settings stored in localStorage

### UI/UX Architecture
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Theme System**: Light/dark mode with CSS custom properties
- **Component Structure**: Modular components with consistent design patterns
- **Accessibility**: ARIA labels and keyboard navigation support

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database (@neondatabase/serverless)
- **Connection Management**: Environment-based DATABASE_URL configuration

### UI and Styling
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server

### Media and WebRTC
- **Browser APIs**: MediaDevices API for camera/microphone access
- **WebRTC**: Built-in browser support for peer-to-peer connections
- **WebSocket**: Native WebSocket API for real-time communication

### State and Data Management
- **React Query**: Server state synchronization and caching
- **Zustand**: Lightweight state management with persistence
- **React Hook Form**: Form handling with validation

### Additional Libraries
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Type-safe CSS class composition
- **Wouter**: Minimalist routing library for React