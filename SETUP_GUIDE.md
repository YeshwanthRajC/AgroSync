# 🚀 Quick Setup Guide for AgroSync

## Step 1: Get Your API Keys

### Weather API Key (Required)
1. Go to https://openweathermap.org/api
2. Click "Sign Up" (Free tier is sufficient)
3. Verify your email
4. Go to "API Keys" section
5. Copy your API key

### Gemini API Key (Optional - Can add later)
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

## Step 2: Setup Backend

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env file and paste your API keys:
# WEATHER_API_KEY=your_actual_weather_api_key
# GEMINI_API_KEY=your_actual_gemini_api_key (optional)
# WEATHER_LOCATION=Thiruvallur,IN

# Start the backend server
python main.py
```

Backend will be running at: http://localhost:8000

## Step 3: Setup Frontend

Open a NEW PowerShell window:

```powershell
# Navigate to project root
cd c:\Users\yeshwanthRaj\Documents\guvi_actual\my-project

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file:
# VITE_API_URL=http://localhost:8000
# VITE_WEATHER_API_KEY=your_actual_weather_api_key
# VITE_GEMINI_API_KEY=your_actual_gemini_api_key (optional)

# Start the development server
npm run dev
```

Frontend will be running at: http://localhost:5173

## Step 4: Test the Application

1. Open browser to http://localhost:5173
2. Navigate through the menu to test all features:
   - Home page with feature overview
   - Image Analysis (upload any crop/farm image)
   - Weather page (live data for Thiruvallur)
   - Drone Map (click to add markers)
   - Dashboard (view drone stats)

## Troubleshooting

### Backend Issues
- **Port 8000 already in use**: Change port in `backend/main.py` (last line)
- **Module not found**: Make sure virtual environment is activated
- **Weather API error**: Double-check your API key in `backend/.env`

### Frontend Issues
- **npm install fails**: Try `npm install --legacy-peer-deps`
- **Port 5173 in use**: Vite will automatically try another port
- **API connection fails**: Make sure backend is running on port 8000

### API Key Issues
- Weather API takes 10-15 minutes to activate after signup
- Make sure there are no spaces in your API keys
- Keys should be pasted directly without quotes

## Next Steps

1. **Customize**: Modify colors, add your logo, adjust features
2. **Deploy**: Follow README.md for deployment instructions
3. **Enhance**: Add real drone telemetry, custom ML models, user auth

## Need Help?

- Check `README.md` for detailed documentation
- Review `backend/AZURE_DEPLOY.md` for deployment
- API documentation: http://localhost:8000/docs (when backend is running)

---

**Congratulations! 🎉 AgroSync is now running locally!**
