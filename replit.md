# DevTrack - Developer Productivity Dashboard

## Overview

DevTrack is a modern developer productivity tracking application built as a full-stack web application. It allows developers to track coding sessions, log commits, manage tasks, set daily goals, and monitor their productivity metrics. The application features a clean, responsive interface with real-time data visualization and comprehensive tracking capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: FontAwesome and Lucide React icons

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **API Design**: RESTful API with JSON responses
- **Validation**: Zod schemas for runtime type checking

### Project Structure
- **Monorepo**: Single repository with shared schemas and types
- **Client**: React frontend in `/client` directory
- **Server**: Express backend in `/server` directory
- **Shared**: Common schemas and types in `/shared` directory

## Key Components

### Database Schema
The application uses ten comprehensive tables:
- **Sessions**: Enhanced tracking with LoC written/deleted, productivity scores, and detailed metadata
- **Commits**: Extended with lines added/deleted, files changed, commit hash, and branch tracking
- **Tasks**: Manage todo items with completion status and timestamps
- **Goals**: Set daily targets for coding time, commits, and tasks
- **Activities**: Record comprehensive activity feed for all user actions
- **Git Syncs**: Track repository synchronization operations with status and metadata
- **Breaks**: Record break sessions with type, duration, and timing
- **Issues**: Full bug/feature tracking with priorities, status, assignments, and time estimation
- **Metrics**: Daily code quality, performance, and productivity metrics aggregation
- **File Changes**: Detailed tracking of file modifications with LoC changes per file

### API Endpoints
- **Sessions**: Enhanced CRUD operations for coding sessions (`/api/sessions`)
- **Commits**: Extended commit data with LoC tracking (`/api/commits`)
- **Tasks**: Task management operations (`/api/tasks`)
- **Goals**: Daily goal setting and tracking (`/api/goals`)
- **Activities**: Comprehensive activity feed (`/api/activities`)
- **Dashboard**: Aggregated metrics endpoint (`/api/dashboard`)
- **Git Sync**: Repository synchronization (`/api/git/sync`, `/api/git/syncs`)
- **Breaks**: Break tracking and timer management (`/api/breaks/*`)
- **Issues**: Full issue/bug tracking system (`/api/issues/*`)
- **Enhanced Metrics**: Advanced analytics and productivity metrics (`/api/metrics/enhanced/*`)
- **File Changes**: Detailed file modification tracking (`/api/file-changes`)
- **Data Management**: Backup/restore and CSV export (`/api/backup`, `/api/restore/*`, `/api/export/csv`)

### Frontend Components
- **Timer Section**: Session tracking with start/stop functionality
- **Metrics Overview**: Daily statistics and productivity charts
- **Goal Tracker**: Progress visualization for daily targets
- **Recent Activity**: Timeline of user actions
- **Quick Actions**: Modal-driven task and commit logging

## Data Flow

1. **Session Management**: Users start/stop coding sessions, which are tracked in real-time
2. **Data Logging**: Commits and tasks are logged through modal interfaces
3. **Goal Setting**: Users set daily targets for productivity metrics
4. **Real-time Updates**: TanStack Query manages cache invalidation and updates
5. **Dashboard Aggregation**: Server computes daily metrics from stored data
6. **Activity Tracking**: All user actions are logged to the activity feed

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Charts**: Custom canvas-based productivity charts
- **Date Handling**: date-fns for date manipulation
- **Form Validation**: @hookform/resolvers with Zod integration

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-kit for migrations
- **Session Storage**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution and hot reloading

### Development Tools
- **TypeScript**: Strict type checking across the entire stack
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Special plugins for Replit development environment

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite middleware integrated with Express server
- **Type Checking**: Shared TypeScript configuration across client/server
- **Database**: Drizzle migrations with PostgreSQL dialect
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves built frontend in production
- **Database**: Drizzle migrations applied before deployment

### Architecture Decisions

1. **Monorepo Structure**: Chosen for shared type safety between frontend and backend
2. **Drizzle ORM**: Selected for excellent TypeScript integration and migration support
3. **TanStack Query**: Provides excellent caching and synchronization for real-time updates
4. **shadcn/ui**: Offers consistent, accessible components with Tailwind integration
5. **Memory Storage Fallback**: MemStorage class provides development flexibility without database dependency
6. **Canvas Charts**: Custom implementation for specific productivity visualization needs

## Recent Changes

### January 03, 2025 - Major UI and Professional Enhancement
- **Icons Migration**: Replaced FontAwesome with Lucide React icons for better performance and consistency
- **UI Modernization**: 
  - Added gradient backgrounds and glassmorphism effects
  - Improved header with better navigation and visual hierarchy
  - Enhanced timer section with color-coded metrics cards
  - Modernized quick actions with hover effects and descriptions
  - Professional tabbed interface (Overview, Analytics, Management)
- **Git Integration**: 
  - Added Git Sync modal for repository management
  - Support for pull, push, and sync operations
  - Commit message handling and status tracking
  - New API endpoints: `/api/git/sync`, `/api/git/syncs`
- **Break Tracking System**:
  - Break timer modal with short (5min), long (15min), and custom durations
  - Visual progress indicator with circular timer
  - Pause/resume/stop break functionality
  - Activity logging for break sessions
  - New API endpoints: `/api/breaks/*`
- **Issue/Bug Tracking System**:
  - Comprehensive issue tracker with full CRUD operations
  - Priority levels (critical, high, medium, low)
  - Status management (open, in-progress, resolved, closed)
  - Category classification (bug, feature, enhancement, task)
  - Lines affected and time estimation tracking
  - Advanced filtering and search capabilities
  - New API endpoints: `/api/issues/*`
- **Enhanced Metrics & Analytics**:
  - Lines of Code tracking (written, deleted, modified)
  - Code quality scores and performance metrics
  - Test coverage tracking and productivity analytics
  - Weekly aggregations and trend analysis
  - File changes tracking with detailed activity logs
  - Advanced productivity metrics dashboard
  - New API endpoints: `/api/metrics/enhanced/*`, `/api/file-changes/*`
- **File Persistence System**:
  - Comprehensive backup and restore functionality
  - CSV export for all data types
  - Daily snapshots and automated cleanup
  - Data import/export with version control
  - New API endpoints: `/api/backup`, `/api/restore/*`, `/api/export/csv`
- **Database Schema**: Added `git_syncs`, `breaks`, `issues`, `metrics`, and `file_changes` tables
- **Professional UX**: Enhanced with tabbed navigation, better organization, and management tools

## Changelog
- July 05, 2025. Initial setup
- January 03, 2025. Major feature and UI upgrade with git integration and break tracking

## User Preferences

Preferred communication style: Simple, everyday language.