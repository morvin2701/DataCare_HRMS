# DataCare HRMS Face Recognition System

A premium face recognition-based attendance system built with Python (FastAPI) and React (Vite).

## Features

- **User Registration**: Register users with their face data using a webcam.
- **Real-time Attendance**: Mark attendance (Punch In/Out) using face recognition.
- **Dashboard**: View live attendance statistics and logs.
- **Premium UI**: Modern, glassmorphism-inspired design with animations.

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Face Recognition (dlib), OpenCV.
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React.
- **Database**: SQLite (default).

## Setup

### Backend

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create virtual environment and activate:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install cmake
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open frontend at `http://localhost:5173`.
2. Go to **Register** page to add users.
3. Go to **Attendance** page to mark attendance.
4. View records on the **Dashboard**.
