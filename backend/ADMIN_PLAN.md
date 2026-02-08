# Admin Panel Implementation Plan

## Overview
Create a role-based admin panel that is only accessible to users with the "admin" role. The panel will provide user management, attendance analytics, and system controls.

## Features to Implement

### 1. Authentication System
- Simple login page with email authentication
- Store user session in localStorage/context
- Role-based access control

### 2. Admin Dashboard
- **User Management Table**
  - View all registered users
  - Edit user roles
  - Delete users
  - Search/filter functionality
  
- **Attendance Analytics**
  - Total attendance records
  - Daily/weekly/monthly charts
  - Export attendance data (CSV)
  
- **System Statistics**
  - Total employees by role
  - Active sessions
  - Recent registrations

### 3. Backend API Endpoints
- `DELETE /users/{id}` - Delete a user
- `PUT /users/{id}` - Update user details
- `GET /stats` - Get system statistics

### 4. Route Protection
- Protect `/admin` route - only accessible to admin role
- Redirect non-admin users to dashboard
- Show admin link in navbar only for admins

## Technical Stack
- **Frontend**: React Context API for auth state
- **Backend**: FastAPI dependency injection for role checking
- **UI**: Premium design matching existing aesthetic
