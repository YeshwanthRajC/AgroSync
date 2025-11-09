import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, AlertCircle, Sparkles, Loader2, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { saveImageAnalysis } from '../services/database';
import jsPDF from 'jspdf';

const ImageAnalysisPage = () => {
  const { t, language } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('Thiruvallur, Tamil Nadu, India');
  const [weatherData, setWeatherData] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setAnalysisResult('');
      setError(null);
    } else {
      setError('Please select a valid JPEG or PNG image');
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/get-weather');
      const data = await response.json();
      if (data.success) {
        setWeatherData(data);
      }
    } catch (err) {
      console.error('Failed to fetch weather data:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);
    setAnalysisResult('');

    try {
      // Fetch weather data first
      await fetchWeatherData();
      
      // Convert image to base64
      const base64Image = await convertImageToBase64(selectedFile);

      // Build climate context
      const climateContext = weatherData ? 
        `\nLocation: ${location}\nCurrent Temperature: ${weatherData.temperature}°C\nHumidity: ${weatherData.humidity}%\nWeather: ${weatherData.weather_description}\n` :
        `\nLocation: ${location}\n`;

      // Prepare prompt based on language
      const prompt = language === 'ta' 
        ? `இந்த விவசாய நிலப் படத்தை பகுப்பாய்வு செய்து தெளிவான வடிவத்தில் பதிலளிக்கவும்:
${climateContext}
**நிலத்தின் வகை:**
[மண் வகை மற்றும் நிலத்தின் நிலை - களிமண், மணல், கலவை போன்றவை]

**பயிர் அடையாளம்:**
[தற்போது வளரும் பயிர் - இருந்தால்]

**இந்த நிலத்தில் வளரக்கூடிய பயிர்கள்:**
• [காலநிலை மற்றும் மண்ணின் அடிப்படையில் பரிந்துரைக்கப்பட்ட பயிர்கள்]
• [தற்போதைய பருவத்திற்கு ஏற்ற பயிர்கள்]
• [வெப்பநிலை ${weatherData?.temperature || '28'}°C மற்றும் ஈரப்பதம் ${weatherData?.humidity || '65'}% கருத்தில் கொள்ளப்பட்டுள்ளது]

**நோய் கண்டறிதல்:**
[கண்டறியப்பட்ட நோய்கள் அல்லது பூச்சிகள் - இருந்தால் மட்டும்]

**நிலத்தின் ஆரோக்கிய நிலை:**
(நல்லது/நடுத்தர/மோசம் - காரணங்களுடன்)

**கண்டறியப்பட்ட பிரச்சினைகள்:**
• [பட்டியலிடவும் - ஒவ்வொன்றும் ஒரு வரியில்]

**உடனடி நடவடிக்கைகள்:**
1. [முதல் செயல்]
2. [இரண்டாவது செயல்]
3. [மூன்றாவது செயல்]

**பரிந்துரைகள் (மருந்துகள் மற்றும் சிகிச்சை):**
• [குறிப்பிட்ட பூச்சிக்கொல்லிகள் அல்லது உரங்கள்]
• [பயன்படுத்தும் முறை மற்றும் அளவு]

**தடுப்பு நடவடிக்கைகள்:**
• [எதிர்காலத்தில் தவிர்க்க வேண்டிய நடவடிக்கைகள்]

**கூடுதல் குறிப்புகள்:**
[ஏதேனும் முக்கியமான தகவல்]

குறிப்பு: குறுகிய வாக்கியங்களைப் பயன்படுத்தவும். எளிமையாக இருங்கள்.`
        : `Analyze this farmland image and provide a COMPREHENSIVE LAND AND CROP ANALYSIS:
${climateContext}
**LAND TYPE:**
[Identify soil type and land condition - clay, sandy, loamy, etc.]

**CROP IDENTIFICATION:**
[Current crop growing - if any visible]

**SUITABLE CROPS FOR THIS LAND:**
• [Recommended crops based on soil type and climate]
• [Crops suitable for current season]
• [Consider temperature ${weatherData?.temperature || '28'}°C and humidity ${weatherData?.humidity || '65'}%]
• [High-yield crop options for this location: ${location}]

**DISEASE DETECTION:**
[Any diseases, pests, or infections detected - only if present]

**LAND/CROP HEALTH STATUS:**
(Good/Fair/Poor - with detailed reason)

**DETECTED ISSUES:**
• [List each issue with severity level - one line each]

**IMMEDIATE ACTIONS NEEDED:**
1. [First urgent action]
2. [Second action]
3. [Third action]

**TREATMENT RECOMMENDATIONS (Medicines & Solutions):**
• [Specific pesticides, fungicides, or fertilizers needed]
• [Application method and dosage instructions]
• [Timing and frequency of application]

**PREVENTIVE MEASURES:**
• [Steps to prevent future occurrences]
• [Crop rotation or soil management tips]

**CLIMATE-BASED RECOMMENDATIONS:**
• [Irrigation needs based on current weather]
• [Planting schedule for optimal results]

**ADDITIONAL NOTES:**
[Any important observations or warnings]

Note: Consider the location climate and weather conditions. Provide actionable recommendations.`;

      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: selectedFile.type,
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setAnalysisResult(aiResponse);

        // Save to database
        try {
          await saveImageAnalysis({
            imageUrl: preview,
            result: aiResponse,
            cropHealth: 'AI Analyzed',
            recommendations: aiResponse
          });
          console.log('✅ Analysis saved to database');
        } catch (dbError) {
          console.error('Failed to save analysis:', dbError);
        }
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadAsPDF = () => {
    if (!analysisResult) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    // Header
    pdf.setFillColor(34, 197, 94); // Green color
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo/Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('AgroSync', margin, 25);
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text('Crop Health Analysis Report', margin, 35);
    
    // Date
    pdf.setFontSize(10);
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Date: ${date}`, pageWidth - margin, 25, { align: 'right' });
    
    // Content
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    let yPosition = 55;
    
    // Split text into lines
    const lines = pdf.splitTextToSize(analysisResult, maxWidth);
    
    lines.forEach((line) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Check for bold headers (lines with **)
      if (line.includes('**')) {
        pdf.setFont(undefined, 'bold');
        pdf.setFontSize(12);
        const cleanLine = line.replace(/\*\*/g, '');
        pdf.text(cleanLine, margin, yPosition);
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(11);
      } else {
        pdf.text(line, margin, yPosition);
      }
      
      yPosition += 7;
    });
    
    // Footer
    pdf.setFontSize(9);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      '© 2025 AgroSync - AI-Powered Agriculture Solutions',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    // Save PDF
    pdf.save(`AgroSync_Crop_Analysis_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-24 px-6 pb-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {t('cropImageAnalysis')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('uploadFarmlandImages')}
          </p>
        </motion.div>

        {/* Location Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-8"
        >
          <label className="block text-lg font-semibold text-gray-800 mb-3">
            📍 {t('farmLocation')} ({language === 'en' ? 'for climate-based recommendations' : 'காலநிலை அடிப்படையிலான பரிந்துரைகளுக்கு'})
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('enterFarmLocation')}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 text-gray-700"
          />
          <p className="mt-2 text-sm text-gray-500">
            {t('locationHelp')}
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <div className="border-4 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-500 transition-all">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-96 mx-auto rounded-xl shadow-lg"
                  />
                  <p className="text-gray-600">{t('clickToChange')}</p>
                </div>
              ) : (
                <div>
                  <Upload size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-xl text-gray-700 mb-2">
                    {t('clickToUpload')}
                  </p>
                  <p className="text-gray-500">{t('jpegOrPng')}</p>
                </div>
              )}
            </label>
          </div>

          {selectedFile && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              disabled={analyzing}
              className="mt-6 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  {t('analyzing')}
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  {t('analyzeImage')}
                </>
              )}
            </motion.button>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
            >
              <AlertCircle className="text-red-500" />
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Analysis Results */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Sparkles className="text-green-600" />
                {t('aiRecommendations')}
              </h2>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadAsPDF}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <Download size={20} />
                {t('downloadPDF')}
              </motion.button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-inner">
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {analysisResult}
              </div>
            </div>
          </motion.div>
        )}

        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-xl text-blue-800 font-semibold">
              {t('processingImage')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalysisPage;
