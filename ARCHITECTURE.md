# AgroSync - System Architecture

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                                  │
│                     (React.js + Tailwind CSS)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         NAVIGATION LAYER                                 │
│                  (React Router + Floating Menu)                          │
├─────────────┬──────────────┬──────────────┬─────────────┬───────────────┤
│    HOME     │   ANALYSIS   │   WEATHER    │     MAP     │   DASHBOARD   │
│             │              │              │             │               │
│  Landing    │  Image       │  Live        │  Satellite  │  Drone Stats  │
│  Features   │  Upload      │  Weather     │  Tracking   │  Telemetry    │
└─────────────┴──────────────┴──────────────┴─────────────┴───────────────┘
                                    │
                              API Requests
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND                                  │
│                      (Python + Uvicorn)                                  │
└─────────────────────────────────────────────────────────────────────────┘
                    │              │              │              │
                    ▼              ▼              ▼              ▼
        ┌───────────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐
        │  TensorFlow   │  │  OpenCV   │  │  Weather  │  │  Gemini AI   │
        │     Model     │  │  Image    │  │    API    │  │  Suggestions │
        │ Classification│  │ Processing│  │           │  │              │
        └───────────────┘  └───────────┘  └───────────┘  └──────────────┘
```

## Page-by-Page Breakdown

### 1. Home Page (/)
- **Purpose**: Landing page with feature showcase
- **Components**: Hero section, feature cards, CTA buttons
- **Animations**: Framer Motion for smooth transitions
- **Tech**: React + Tailwind CSS

### 2. Image Analysis (/analysis)
```
User uploads image
        │
        ▼
    Frontend
        │
        ├─> Display preview
        │
        ▼
POST /analyze-image
        │
        ▼
    Backend
        │
        ├─> OpenCV processes image
        ├─> TensorFlow analyzes metrics
        ├─> Returns classification
        │
        ▼
    Frontend
        │
        ├─> Display results
        │
        ▼
POST /get-suggestions
        │
        ▼
    Backend
        │
        ├─> Send to Gemini API
        ├─> Get recommendations
        │
        ▼
    Frontend
        │
        └─> Display AI suggestions
```

### 3. Weather Page (/weather)
```
Page Load
    │
    ▼
GET /get-weather
    │
    ▼
Backend → OpenWeatherMap API
    │
    ├─> Fetch Thiruvallur data
    ├─> Parse JSON response
    │
    ▼
Frontend
    │
    ├─> Display temperature
    ├─> Show humidity
    ├─> Wind speed
    ├─> Sunrise/Sunset
    └─> Auto-refresh every 5 min
```

### 4. Drone Map (/map)
```
Initialize Leaflet Map
    │
    ├─> Load satellite tiles
    ├─> Set center: Thiruvallur
    ├─> Zoom level: 13
    │
    ▼
User clicks on map
    │
    ├─> Capture lat/lng
    ├─> Create new marker
    ├─> Add to state
    └─> Display on map

Features:
- Add markers by clicking
- Delete individual markers
- Clear all markers
- View operation history
```

### 5. Drone Dashboard (/dashboard)
```
Page Load
    │
    ▼
GET /get-drone-data
    │
    ▼
Backend generates:
    │
    ├─> Battery percentage
    ├─> Flight time prediction
    ├─> Altitude
    ├─> Speed
    ├─> Temperature
    ├─> GPS satellites
    └─> Battery history (chart data)
    │
    ▼
Frontend displays:
    │
    ├─> Stat cards
    ├─> Battery gauge
    ├─> Line chart (Recharts)
    └─> Low battery alert (if < 20%)
    │
    ▼
Auto-refresh every 10 seconds
```

## API Endpoints

### Backend Endpoints

| Endpoint | Method | Purpose | Input | Output |
|----------|--------|---------|-------|--------|
| `/` | GET | API info | None | Welcome message + endpoints |
| `/analyze-image` | POST | Image analysis | FormData (image file) | Analysis results (JSON) |
| `/get-suggestions` | POST | AI recommendations | Analysis data (JSON) | Gemini suggestions (JSON) |
| `/get-weather` | GET | Weather data | None | Current weather (JSON) |
| `/get-drone-data` | GET | Drone stats | None | Telemetry data (JSON) |

### External APIs Used

1. **OpenWeatherMap API**
   - Endpoint: `api.openweathermap.org/data/2.5/weather`
   - Purpose: Live weather data
   - Rate limit: 60 calls/minute (free tier)

2. **Google Gemini API**
   - Model: gemini-pro
   - Purpose: AI-powered crop recommendations
   - Input: Crop issue analysis
   - Output: Detailed suggestions

## Data Flow

### Image Analysis Flow
```
1. User selects image → Preview shown
2. Click "Analyze" → Loading spinner
3. Image sent to backend → FormData upload
4. OpenCV processes → Basic metrics
5. TensorFlow analyzes → Classification
6. Results returned → Display analysis
7. Analysis sent to Gemini → AI prompt
8. Gemini responds → Display suggestions
9. Both shown to user → Complete analysis
```

### Weather Data Flow
```
1. Component mounts → useEffect triggered
2. API call to backend → /get-weather
3. Backend calls OpenWeatherMap → with API key
4. Parse response → Extract relevant data
5. Return to frontend → JSON format
6. Display in cards → Temperature, humidity, etc.
7. Set interval → Auto-refresh every 5 min
```

### Drone Map Flow
```
1. Initialize map → Leaflet.js
2. Load satellite tiles → ArcGIS/Esri
3. Set initial marker → Thiruvallur center
4. User clicks map → Get coordinates
5. Create marker object → lat/lng + metadata
6. Add to state → React useState
7. Render on map → Green drone icon
8. Store locally → No database (for now)
```

## Component Structure

```
App.jsx (Router)
    │
    ├── Navigation.jsx (Floating Menu)
    │
    └── Routes
            │
            ├── HomePage
            │     ├── Hero Section
            │     ├── Feature Cards
            │     └── CTA Section
            │
            ├── ImageAnalysisPage
            │     ├── Upload Component
            │     ├── Analysis Results
            │     └── AI Suggestions
            │
            ├── WeatherPage
            │     ├── Main Weather Card
            │     ├── Detail Cards Grid
            │     └── Refresh Button
            │
            ├── DroneMapPage
            │     ├── Status Box
            │     ├── Leaflet Map
            │     └── Operations List
            │
            └── DroneDashboard
                  ├── Alert Banner
                  ├── Stats Grid
                  └── Battery Chart
```

## State Management

**Global State**: None (no Redux needed for this scale)

**Local State Examples**:
- `selectedFile` - Uploaded image
- `analysisResult` - Classification data
- `weather` - Current weather data
- `markers` - Map markers array
- `droneData` - Telemetry information

**Side Effects (useEffect)**:
- Weather auto-refresh
- Drone data polling
- Initial data fetching

## Styling Architecture

**Approach**: Utility-first with Tailwind CSS

**Color Scheme**:
- Primary: Green (#10b981)
- Secondary: Blue, Cyan
- Accent: Orange, Purple
- Background: White with green/blue gradients

**Responsive Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Animation Library**: Framer Motion
- Page transitions
- Card hover effects
- Loading states
- Element reveals

## Security Considerations

**Current Setup (Development)**:
- CORS: Allow all origins (*)
- API Keys: In .env files (gitignored)
- No authentication required

**Production Requirements**:
- Restrict CORS to specific domains
- Use environment variables on hosting
- Add user authentication (JWT/OAuth)
- Implement rate limiting
- Sanitize file uploads
- Validate all inputs

## Performance Optimization

1. **Frontend**:
   - Code splitting (React.lazy if needed)
   - Image optimization
   - Lazy loading for heavy components
   - Memoization where applicable

2. **Backend**:
   - Async endpoints
   - Efficient image processing
   - Caching weather data
   - Connection pooling

3. **API Calls**:
   - Debouncing user inputs
   - Request throttling
   - Loading states for UX
   - Error boundaries

## Deployment Architecture

```
┌────────────────────┐        ┌────────────────────┐
│   Netlify/Vercel   │        │  Azure App Service │
│                    │        │                    │
│   React Frontend   │◄──────►│  FastAPI Backend   │
│   Static Hosting   │  HTTPS │  Python Runtime    │
│                    │        │                    │
└────────────────────┘        └────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
  CDN Distribution              ┌──────────────┐
                                │  External    │
                                │  APIs        │
                                ├──────────────┤
                                │ • Weather    │
                                │ • Gemini AI  │
                                └──────────────┘
```

## Future Enhancements

1. **Database Integration**:
   - PostgreSQL for user data
   - Store analysis history
   - Save drone operations
   - User preferences

2. **Real Drone Integration**:
   - MQTT protocol
   - WebSocket for real-time data
   - Drone SDK integration
   - Live video feed

3. **Advanced Features**:
   - User authentication
   - Multi-field management
   - Historical analytics
   - Mobile app (React Native)
   - Offline mode
   - Export reports (PDF)

4. **ML Improvements**:
   - Train custom models
   - Larger dataset
   - Multi-class detection
   - Confidence tuning
   - Model versioning

---

This architecture is designed to be scalable, maintainable, and ready for production deployment with minimal modifications.
