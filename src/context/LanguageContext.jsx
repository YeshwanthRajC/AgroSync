import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    analysis: 'Analysis',
    weather: 'Weather',
    map: 'Map',
    dashboard: 'Dashboard',
    signOut: 'Sign Out',
    
    // Image Analysis Page
    cropImageAnalysis: 'Crop Image Analysis',
    uploadFarmlandImages: 'Upload farmland images for AI-powered health assessment',
    clickToUpload: 'Click to upload crop image',
    jpegOrPng: 'JPEG or PNG format',
    clickToChange: 'Click to change image',
    analyzeImage: 'Analyze Image',
    analyzing: 'Analyzing...',
    
    // Analysis Results
    analysisResults: 'Analysis Results',
    detectedIssues: 'Detected Issues',
    cropHealthStatus: 'Crop Health Status',
    aiRecommendations: 'AI-Powered Recommendations',
    processingImage: 'Processing your image with advanced AI...',
    downloadPDF: 'Download PDF',
    cropIdentification: 'Crop Identification',
    diseaseDetection: 'Disease Detection',
    farmLocation: 'Farm Location',
    enterFarmLocation: 'Enter your farm location',
    locationHelp: 'Location helps provide crop recommendations based on local climate',
    suitableCrops: 'Suitable Crops for This Land',
    landType: 'Land Type',
    climateBasedRecommendations: 'Climate-Based Recommendations',
    
    // Home Page
    smartAgriculture: 'Smart Agriculture',
    aiDriven: 'AI-Driven',
    realTimeMonitoring: 'Real-Time Monitoring',
    aiPoweredAnalysis: 'AI-Powered Analysis',
    advancedImageRecognition: 'Advanced image recognition for crop health assessment',
    droneIntegration: 'Drone Integration',
    realTimeMonitoringDesc: 'Real-time monitoring and autonomous field operations',
    weatherInsights: 'Weather Insights',
    liveWeatherData: 'Live weather data and forecasts for optimal planning',
    fieldMapping: 'Field Mapping',
    interactiveMaps: 'Interactive satellite maps with operation tracking',
    smartAnalytics: 'Smart Analytics',
    comprehensiveDashboard: 'Comprehensive dashboard for data-driven decisions',
    replantingAssistant: 'Replanting Assistant',
    intelligentRecommendations: 'Intelligent recommendations for crop recovery',
    readyToTransform: 'Ready to Transform Your Farming?',
    startMonitoring: 'Start monitoring your crops with cutting-edge AI and drone technology',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    empoweringFarmers: 'Empowering Farmers with Technology.',
    agroSyncTagline: 'An AI-powered drone monitoring and replanting assistant designed to optimize crop productivity through intelligent field analysis, weather integration, and autonomous replanting insights.',
    
    // Weather Page
    weatherForecast: 'Weather Forecast',
    realTimeWeatherData: 'Real-time weather data for smart farming decisions',
    enterLocation: 'Enter location name',
    getWeather: 'Get Weather',
    fetchingWeather: 'Fetching weather data...',
    currentWeather: 'Current Weather',
    temperature: 'Temperature',
    feelsLike: 'Feels Like',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    pressure: 'Pressure',
    visibility: 'Visibility',
    cloudCover: 'Cloud Cover',
    uvIndex: 'UV Index',
    
    // Drone Map Page
    droneOperations: 'Drone Operations',
    interactiveDroneMapping: 'Interactive drone mapping and field monitoring',
    currentOperation: 'Current Operation',
    totalAreas: 'Total Areas',
    status: 'Status',
    active: 'Active',
    completed: 'Completed',
    editSession: 'Edit session name',
    saveSession: 'Save session name',
    viewHistory: 'View History',
    completeOperation: 'Complete Operation',
    clearAll: 'Clear All',
    operationHistory: 'Operation History',
    noOperations: 'No operations yet',
    areas: 'areas',
    
    // Dashboard
    droneDashboard: 'Drone Dashboard',
    comprehensiveOverview: 'Comprehensive overview of your drone operations',
    totalOperations: 'Total Operations',
    totalAreasMonitored: 'Total Areas Monitored',
    activeOperations: 'Active Operations',
    completedOperations: 'Completed Operations',
    recentOperations: 'Recent Operations',
    areasCovered: 'Areas Covered',
    noRecentOperations: 'No recent operations',
    
    // Common
    error: 'Error',
    success: 'Success',
    loading: 'Loading...',
    pleaseWait: 'Please wait...',
  },
  ta: {
    // Navigation
    home: 'முகப்பு',
    analysis: 'பகுப்பாய்வு',
    weather: 'வானிலை',
    map: 'வரைபடம்',
    dashboard: 'டாஷ்போர்டு',
    signOut: 'வெளியேறு',
    
    // Image Analysis Page
    cropImageAnalysis: 'பயிர் படம் பகுப்பாய்வு',
    uploadFarmlandImages: 'AI-இயக்கப்படும் ஆரோக்கிய மதிப்பீட்டிற்கு விவசாய நிலப் படங்களை பதிவேற்றவும்',
    clickToUpload: 'பயிர் படத்தை பதிவேற்ற கிளிக் செய்யவும்',
    jpegOrPng: 'JPEG அல்லது PNG வடிவம்',
    clickToChange: 'படத்தை மாற்ற கிளிக் செய்யவும்',
    analyzeImage: 'படத்தை பகுப்பாய்வு செய்',
    analyzing: 'பகுப்பாய்வு செய்கிறது...',
    
    // Analysis Results
    analysisResults: 'பகுப்பாய்வு முடிவுகள்',
    detectedIssues: 'கண்டறியப்பட்ட சிக்கல்கள்',
    cropHealthStatus: 'பயிர் ஆரோக்கிய நிலை',
    aiRecommendations: 'AI பரிந்துரைகள்',
    processingImage: 'உங்கள் படத்தை மேம்பட்ட AI மூலம் செயலாக்குகிறது...',
    downloadPDF: 'PDF பதிவிறக்கம்',
    cropIdentification: 'பயிர் அடையாளம்',
    diseaseDetection: 'நோய் கண்டறிதல்',
    farmLocation: 'பண்ணை இடம்',
    enterFarmLocation: 'உங்கள் பண்ணை இடத்தை உள்ளிடவும்',
    locationHelp: 'உள்ளூர் காலநிலையின் அடிப்படையில் பயிர் பரிந்துரைகளை வழங்க இடம் உதவுகிறது',
    suitableCrops: 'இந்த நிலத்திற்கு ஏற்ற பயிர்கள்',
    landType: 'நிலத்தின் வகை',
    climateBasedRecommendations: 'காலநிலை அடிப்படையிலான பரிந்துரைகள்',
    
    // Home Page
    smartAgriculture: 'புத்திசாலி விவசாயம்',
    aiDriven: 'AI-இயக்கப்படுகிறது',
    realTimeMonitoring: 'நேரடி கண்காணிப்பு',
    aiPoweredAnalysis: 'AI-இயக்கப்படும் பகுப்பாய்வு',
    advancedImageRecognition: 'பயிர் ஆரோக்கிய மதிப்பீட்டிற்கான மேம்பட்ட பட அங்கீகாரம்',
    droneIntegration: 'ட்ரோன் ஒருங்கிணைப்பு',
    realTimeMonitoringDesc: 'நேரடி கண்காணிப்பு மற்றும் தன்னாட்சி கள செயல்பாடுகள்',
    weatherInsights: 'வானிலை நுண்ணறிவு',
    liveWeatherData: 'உகந்த திட்டமிடலுக்கான நேரடி வானிலை தரவு மற்றும் முன்னறிவிப்புகள்',
    fieldMapping: 'கள வரைபடம்',
    interactiveMaps: 'செயல்பாடு கண்காணிப்புடன் ஊடாடும் செயற்கைக்கோள் வரைபடங்கள்',
    smartAnalytics: 'புத்திசாலி பகுப்பாய்வு',
    comprehensiveDashboard: 'தரவு சார்ந்த முடிவுகளுக்கான விரிவான டாஷ்போர்டு',
    replantingAssistant: 'மறுநடவு உதவியாளர்',
    intelligentRecommendations: 'பயிர் மீட்புக்கான புத்திசாலி பரிந்துரைகள்',
    readyToTransform: 'உங்கள் விவசாயத்தை மாற்ற தயாரா?',
    startMonitoring: 'அதிநவீன AI மற்றும் ட்ரோன் தொழில்நுட்பத்துடன் உங்கள் பயிர்களை கண்காணிக்கத் தொடங்குங்கள்',
    getStarted: 'தொடங்குங்கள்',
    learnMore: 'மேலும் அறிக',
    empoweringFarmers: 'தொழில்நுட்பத்துடன் விவசாயிகளை வலுப்படுத்துதல்.',
    agroSyncTagline: 'புத்திசாலி கள பகுப்பாய்வு, வானிலை ஒருங்கிணைப்பு மற்றும் தன்னாட்சி மறுநடவு நுண்ணறிவு மூலம் பயிர் உற்பத்தித்திறனை மேம்படுத்த வடிவமைக்கப்பட்ட AI-இயக்கப்படும் ட்ரோன் கண்காணிப்பு மற்றும் மறுநடவு உதவியாளர்.',
    
    // Weather Page
    weatherForecast: 'வானிலை முன்னறிவிப்பு',
    realTimeWeatherData: 'புத்திசாலி விவசாய முடிவுகளுக்கான நேரடி வானிலை தரவு',
    enterLocation: 'இடத்தின் பெயரை உள்ளிடவும்',
    getWeather: 'வானிலையைப் பெறுங்கள்',
    fetchingWeather: 'வானிலை தரவைப் பெறுகிறது...',
    currentWeather: 'தற்போதைய வானிலை',
    temperature: 'வெப்பநிலை',
    feelsLike: 'உணர்வு போல',
    humidity: 'ஈரப்பதம்',
    windSpeed: 'காற்றின் வேகம்',
    pressure: 'அழுத்தம்',
    visibility: 'தெரிவுநிலை',
    cloudCover: 'மேக மூடுதல்',
    uvIndex: 'UV குறியீடு',
    
    // Drone Map Page
    droneOperations: 'ட்ரோன் செயல்பாடுகள்',
    interactiveDroneMapping: 'ஊடாடும் ட்ரோன் வரைபடம் மற்றும் கள கண்காணிப்பு',
    currentOperation: 'தற்போதைய செயல்பாடு',
    totalAreas: 'மொத்த பகுதிகள்',
    status: 'நிலை',
    active: 'செயலில்',
    completed: 'முடிந்தது',
    editSession: 'அமர்வு பெயரை திருத்து',
    saveSession: 'அமர்வு பெயரை சேமி',
    viewHistory: 'வரலாற்றைக் காண்க',
    completeOperation: 'செயல்பாட்டை முடிக்கவும்',
    clearAll: 'அனைத்தையும் அழி',
    operationHistory: 'செயல்பாட்டு வரலாறு',
    noOperations: 'இன்னும் செயல்பாடுகள் இல்லை',
    areas: 'பகுதிகள்',
    
    // Dashboard
    droneDashboard: 'ட்ரோன் டாஷ்போர்டு',
    comprehensiveOverview: 'உங்கள் ட்ரோன் செயல்பாடுகளின் விரிவான கண்ணோட்டம்',
    totalOperations: 'மொத்த செயல்பாடுகள்',
    totalAreasMonitored: 'கண்காணிக்கப்பட்ட மொத்த பகுதிகள்',
    activeOperations: 'செயலில் உள்ள செயல்பாடுகள்',
    completedOperations: 'முடிந்த செயல்பாடுகள்',
    recentOperations: 'சமீபத்திய செயல்பாடுகள்',
    areasCovered: 'பகுதிகள் மூடப்பட்டன',
    noRecentOperations: 'சமீபத்திய செயல்பாடுகள் இல்லை',
    
    // Common
    error: 'பிழை',
    success: 'வெற்றி',
    loading: 'ஏற்றுகிறது...',
    pleaseWait: 'தயவுசெய்து காத்திருக்கவும்...',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ta' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
