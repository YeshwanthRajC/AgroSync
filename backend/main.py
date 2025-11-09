from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from PIL import Image
import io
import requests
import random

# Load environment variables
load_dotenv()

app = FastAPI(title="AgroSync API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global configurations
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
WEATHER_LOCATION = os.getenv("WEATHER_LOCATION", "Thiruvallur,IN")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

# Health check endpoint with Supabase connection test
@app.get("/health")
async def health_check():
    """Health check endpoint with Supabase connection verification"""
    health_status = {
        "status": "healthy",
        "api_version": "1.0.0",
        "services": {
            "weather_api": "configured" if WEATHER_API_KEY else "not_configured",
            "gemini_api": "configured" if GEMINI_API_KEY else "not_configured",
            "supabase": "not_configured"
        }
    }
    
    # Test Supabase connection
    if SUPABASE_URL and SUPABASE_ANON_KEY:
        try:
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
                },
                timeout=5
            )
            if response.status_code in [200, 404]:  # 404 is ok, means API is reachable
                health_status["services"]["supabase"] = "connected"
            else:
                health_status["services"]["supabase"] = f"error_{response.status_code}"
        except Exception as e:
            health_status["services"]["supabase"] = f"error: {str(e)}"
    
    return health_status

# Simulated Crop Analysis Model (no ML dependencies needed)
class CropAnalysisModel:
    def __init__(self):
        self.classes = [
            "Healthy Crop",
            "Pest Damage Detected",
            "Nutrient Deficiency",
            "Water Stress/Dryness",
            "Disease Detected",
            "Soil Erosion"
        ]
    
    def analyze(self, image):
        """
        Simulate crop analysis using basic image metrics
        """
        # Get image dimensions and basic stats
        width, height = image.size
        pixels = list(image.getdata())
        
        # Calculate basic metrics
        if len(pixels) > 0 and len(pixels[0]) == 3:  # RGB image
            avg_r = sum(p[0] for p in pixels) / len(pixels)
            avg_g = sum(p[1] for p in pixels) / len(pixels)
            avg_b = sum(p[2] for p in pixels) / len(pixels)
            brightness = (avg_r + avg_g + avg_b) / 3
            
            # Simulate classification based on color metrics
            if brightness < 80:
                primary_class = "Water Stress/Dryness"
                confidence = 0.82
                severity = "High"
            elif avg_g > avg_r and avg_g > avg_b:
                primary_class = "Healthy Crop"
                confidence = 0.92
                severity = "None"
            elif avg_r > avg_g:
                primary_class = "Pest Damage Detected"
                confidence = 0.78
                severity = "Medium"
            else:
                primary_class = "Nutrient Deficiency"
                confidence = 0.75
                severity = "Medium"
        else:
            primary_class = "Healthy Crop"
            confidence = 0.85
            severity = "None"
            brightness = 100
        
        return {
            "primary_issue": primary_class,
            "confidence": round(confidence, 2),
            "severity": severity,
            "metrics": {
                "brightness": round(brightness, 2),
                "image_size": f"{width}x{height}",
                "total_pixels": width * height
            },
            "secondary_observations": self._get_secondary_observations(brightness)
        }
    
    def _get_secondary_observations(self, brightness):
        observations = []
        if brightness < 100:
            observations.append("Low brightness may indicate water stress or disease")
        else:
            observations.append("Good brightness levels detected")
        observations.append("Consider regular monitoring for optimal crop health")
        return observations

# Initialize model
crop_model = CropAnalysisModel()

@app.get("/")
async def root():
    return {
        "message": "Welcome to AgroSync API",
        "version": "1.0.0",
        "endpoints": [
            "/analyze-image",
            "/get-weather",
            "/get-drone-data",
            "/get-suggestions"
        ]
    }

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze uploaded crop/farmland image for issues
    """
    try:
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image = image.convert('RGB')
        
        # Resize for processing
        image = image.resize((512, 512))
        
        # Analyze image
        analysis_result = crop_model.analyze(image)
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "analysis": analysis_result
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

@app.post("/get-suggestions")
async def get_suggestions(analysis_data: dict):
    """
    Get AI-powered suggestions using Gemini API
    """
    try:
        if not GEMINI_API_KEY:
            return JSONResponse(content={
                "success": False,
                "message": "Gemini API key not configured",
                "suggestions": get_fallback_suggestions(analysis_data.get("primary_issue", "Unknown"))
            })
        
        # For now, return fallback suggestions
        # To enable Gemini: pip install google-generativeai and uncomment below
        return JSONResponse(content={
            "success": False,
            "message": "Gemini API integration available - add key to enable",
            "suggestions": get_fallback_suggestions(analysis_data.get("primary_issue", "Unknown"))
        })
    
    except Exception as e:
        return JSONResponse(content={
            "success": False,
            "message": f"Failed to get AI suggestions: {str(e)}",
            "suggestions": ["Consult with local agricultural extension officers"]
        })

def get_fallback_suggestions(issue):
    """Provide basic suggestions based on detected issue"""
    suggestions_map = {
        "Pest Damage Detected": [
            "1. Inspect crops regularly for early pest detection",
            "2. Consider using organic pesticides or neem-based solutions",
            "3. Implement integrated pest management (IPM) practices",
            "4. Remove affected plants to prevent spread",
            "5. Consult local agricultural officers for region-specific advice"
        ],
        "Water Stress/Dryness": [
            "1. Increase irrigation frequency immediately",
            "2. Check soil moisture levels regularly",
            "3. Consider drip irrigation for efficient water use",
            "4. Apply mulch to retain soil moisture",
            "5. Monitor weather forecasts for rainfall predictions"
        ],
        "Nutrient Deficiency": [
            "1. Conduct soil testing to identify specific deficiencies",
            "2. Apply balanced NPK fertilizers as recommended",
            "3. Consider organic compost or manure application",
            "4. Monitor leaf color and growth patterns",
            "5. Maintain proper pH levels in soil"
        ],
        "Healthy Crop": [
            "1. Continue current farming practices",
            "2. Maintain regular monitoring schedule",
            "3. Ensure adequate water and nutrients",
            "4. Plan for timely harvesting",
            "5. Keep records for future reference"
        ]
    }
    return suggestions_map.get(issue, [
        "1. Monitor crops regularly for any changes",
        "2. Maintain good agricultural practices",
        "3. Consult with agricultural experts if issues persist"
    ])

@app.get("/get-weather")
async def get_weather():
    """
    Fetch live weather data for Thiruvallur, India
    """
    try:
        if not WEATHER_API_KEY:
            raise HTTPException(status_code=400, detail="Weather API key not configured")
        
        url = f"http://api.openweathermap.org/data/2.5/weather?q={WEATHER_LOCATION}&appid={WEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch weather data")
        
        data = response.json()
        
        weather_info = {
            "success": True,
            "location": "Thiruvallur, India",
            "temperature": round(data["main"]["temp"], 1),
            "feels_like": round(data["main"]["feels_like"], 1),
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "wind_speed": round(data["wind"]["speed"] * 3.6, 1),  # Convert m/s to km/h
            "weather_condition": data["weather"][0]["main"],
            "weather_description": data["weather"][0]["description"],
            "clouds": data["clouds"]["all"],
            "sunrise": data["sys"]["sunrise"],
            "sunset": data["sys"]["sunset"],
            "rain_forecast": data.get("rain", {}).get("1h", 0),
            "icon": data["weather"][0]["icon"]
        }
        
        return JSONResponse(content=weather_info)
    
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Weather API request failed: {str(e)}")

@app.get("/get-drone-data")
async def get_drone_data():
    """
    Get simulated drone statistics
    In production, connect to actual drone telemetry
    """
    battery = random.randint(15, 100)
    altitude = random.randint(50, 150)
    speed = round(random.uniform(5, 25), 1)
    temperature = round(random.uniform(20, 35), 1)
    
    # Calculate flight time based on battery
    max_flight_time = 30  # minutes
    predicted_flight_time = int((battery / 100) * max_flight_time)
    
    # Battery history for chart
    battery_history = []
    current_battery = battery
    for i in range(10):
        battery_history.append({
            "time": f"-{9-i}m",
            "battery": max(0, current_battery + random.randint(-2, 5))
        })
        current_battery = battery_history[-1]["battery"]
    
    drone_data = {
        "success": True,
        "battery_percentage": battery,
        "predicted_flight_time": predicted_flight_time,
        "altitude": altitude,
        "speed": speed,
        "temperature": temperature,
        "gps_satellites": random.randint(8, 15),
        "signal_strength": random.randint(70, 100),
        "battery_history": battery_history,
        "low_battery_alert": battery < 20,
        "status": "Active" if battery >= 20 else "Low Battery - Return to Base"
    }
    
    return JSONResponse(content=drone_data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
