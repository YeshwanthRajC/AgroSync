# AgroSync - Drone-Assisted Crop Replanting and Monitoring Platform

A real-time web application for intelligent farmland analysis, weather monitoring, and autonomous drone operations.

## 🌾 Features

- **AI-Powered Image Analysis**: Upload crop images for instant health assessment using TensorFlow and OpenCV
- **Live Weather Integration**: Real-time weather data for Thiruvallur, India
- **Interactive Drone Map**: Track and visualize drone operations with satellite imagery
- **Real-Time Dashboard**: Monitor drone telemetry including battery, altitude, speed, and temperature
- **Gemini AI Suggestions**: Get intelligent recommendations for crop recovery and replanting

## 🛠️ Tech Stack

### Frontend
- React.js
- Leaflet.js (Interactive maps)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- Recharts (Data visualization)

### Backend
- Python FastAPI
- TensorFlow (Image classification)
- OpenCV (Image processing)
- Google Gemini AI (Recommendations)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Python 3.9+
- pip

### Frontend Setup

```powershell
# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env and add your API keys
# VITE_API_URL=http://localhost:8000
# VITE_WEATHER_API_KEY=your_openweathermap_key
# VITE_GEMINI_API_KEY=your_gemini_key

# Start development server
npm run dev
```

### Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env

# Edit .env and add your API keys
# WEATHER_API_KEY=your_openweathermap_key
# GEMINI_API_KEY=your_gemini_key

# Start FastAPI server
python main.py
```

The backend will run on `http://localhost:8000`

## 🔑 API Keys Required

### OpenWeatherMap API (Required)
1. Sign up at https://openweathermap.org/api
2. Get your free API key
3. Add to both frontend and backend `.env` files

### Google Gemini API (Optional - for AI suggestions)
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to both `.env` files

## 🚀 Usage

1. **Home Page**: Overview of AgroSync features
2. **Image Analysis**: Upload crop images for AI-powered health assessment
3. **Weather**: View live weather data for Thiruvallur
4. **Drone Map**: Click on the satellite map to mark drone operation areas
5. **Dashboard**: Monitor real-time drone statistics and battery levels

## 📱 Pages

- `/` - Landing page with feature overview
- `/analysis` - Image upload and analysis with AI suggestions
- `/weather` - Live weather dashboard
- `/map` - Interactive drone operation map
- `/dashboard` - Drone telemetry and statistics

## 🌐 Deployment

### Frontend (Netlify/Vercel)

#### Netlify
```powershell
# Build the project
npm run build

# Deploy to Netlify (install Netlify CLI first)
npm install -g netlify-cli
netlify deploy --prod
```

#### Vercel
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Backend (Azure App Service)

1. Create Azure App Service for Python
2. Configure environment variables in Azure Portal
3. Deploy using Azure CLI, GitHub Actions, or VS Code

## 🔧 Configuration

Update CORS in `backend/main.py` for production.

## 📊 API Endpoints

- `GET /` - API information
- `POST /analyze-image` - Upload and analyze crop images
- `POST /get-suggestions` - Get Gemini AI recommendations
- `GET /get-weather` - Fetch live weather data
- `GET /get-drone-data` - Get drone telemetry

## 📄 License

MIT License

---

Built with ❤️ for modern agriculture technology

