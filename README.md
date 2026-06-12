Intelligent Multi-Agent Campus GuideAn advanced, full-stack web application designed to assist students and visitors in navigating the college campus, discovering events, and getting instant support via an intelligent AI chatbot.🚀

 Features🗺️ Smart Navigation (Mapbox Integration)Interactive Campus Map: High-quality satellite imagery with custom markers for all campus buildings.Live Route Finding: "Get Directions" feature calculates the shortest walking path and estimated time between any two buildings.Turn-by-Turn Navigation: "Start Travel" mode locks onto the user's real-time GPS location, auto-zooms, and tracks movement along the path.

 🤖 Multi-Agent AI AssistantIntelligent Chatbot: A central "Support Agent" orchestrates specialized sub-agents to answer complex queries.
 
 Navigation Agent: Calculates distances and times (e.g., "How far is the Library from the Canteen?").
 Event Agent: searches the database for upcoming campus events.
 Knowledge Agent: Uses Wikipedia for general knowledge queries.
 Weather Agent: Fetches real-time weather data for the campus.
 Voice Support: Built-in Speech-to-Text and Text-to-Speech for hands-free interaction.

 
 📅 Event Management & Notifications
 Admin Dashboard: Secure panel for administrators to create, edit, and delete events.
 Smart Notifications:Email Alerts: Automatically emails all registered users when a new event is posted (via Brevo).
 In-App Banners: Persistent "New Event" banners appear on the dashboard until acknowledged.
 Event Registration: Students can register for events directly through the app.
 
 🔒 Secure Authentication
 Role-Based Access Control (RBAC): Distinct portals for Students (User), Administrators (Admin), and Visitors (Guest).
 Guest Mode: Allows visitors to use navigation features without creating an account.
 
 🛠️ Tech Stack
 Frontend: React.js, react-map-gl, maplibre-gl
 Backend: Python FastAPI, MYSQL, Pydantic
 Database: MySQLExternal 
 APIs:
 Mapbox: For maps and routing.
 Brevo (formerly Sendinblue): For transactional emails.
 Open-Meteo: For weather data.
 Wikipedia: For general knowledge.
 
 ⚙️ Installation & Setup
 1. PrerequisitesNode.js & npm installed.
 2. Python 3.10+ installed.MySQL Server running.API Keys for Mapbox and Brevo.
 3. Database SetupLog in to your MySQL shell.
 4. Create the database:
    CREATE DATABASE campus_guide_db;
    Run the schema and seed scripts located in the database/ folder:mysql -u root -p campus_guide_db < database/schema.sql
    mysql -u root -p campus_guide_db < database/seed.sql
5.Backend Setup (FastAPI)cd backend
# Create virtual environment
python -m venv venv
# Activate venv (Windows)
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
Create a .env file in the backend/ folder:DATABASE_URL=mysql+pymysql://root:YOUR_DB_PASSWORD@localhost/campus_guide_db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REACT_APP_MAPBOX_TOKEN=pk.YOUR_MAPBOX_TOKEN_HERE
BREVO_API_KEY=xkeysib-YOUR_BREVO_KEY_HERE
Run the server:uvicorn main:app --reload
(Backend runs on http://localhost:8000)4. Frontend Setup (React)cd frontend
npm install
Create a .env file in the frontend/ folder:REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_MAPBOX_TOKEN=pk.YOUR_MAPBOX_TOKEN_HERE
Run the app:npm start
