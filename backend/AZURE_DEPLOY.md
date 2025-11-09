# Deploying AgroSync Backend to Azure App Service

## Prerequisites

- Azure account with active subscription
- Azure CLI installed
- Backend code ready with all dependencies

## Method 1: Azure CLI Deployment

### Step 1: Login to Azure
```powershell
az login
```

### Step 2: Create Resource Group
```powershell
az group create --name agrosync-rg --location eastus
```

### Step 3: Create App Service Plan
```powershell
az appservice plan create --name agrosync-plan --resource-group agrosync-rg --sku B1 --is-linux
```

### Step 4: Create Web App
```powershell
az webapp create --resource-group agrosync-rg --plan agrosync-plan --name agrosync-backend --runtime "PYTHON:3.9"
```

### Step 5: Configure Environment Variables
```powershell
az webapp config appsettings set --resource-group agrosync-rg --name agrosync-backend --settings WEATHER_API_KEY="your_key" GEMINI_API_KEY="your_key" WEATHER_LOCATION="Thiruvallur,IN"
```

### Step 6: Deploy Code
```powershell
# Zip the backend folder
Compress-Archive -Path .\backend\* -DestinationPath backend.zip

# Deploy
az webapp deployment source config-zip --resource-group agrosync-rg --name agrosync-backend --src backend.zip
```

## Method 2: GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'agrosync-backend'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./backend
```

## Method 3: VS Code Extension

1. Install "Azure App Service" extension in VS Code
2. Right-click backend folder
3. Select "Deploy to Web App"
4. Follow prompts to create/select App Service

## Post-Deployment

### Enable CORS
```powershell
az webapp cors add --resource-group agrosync-rg --name agrosync-backend --allowed-origins https://your-frontend-url.netlify.app
```

### View Logs
```powershell
az webapp log tail --resource-group agrosync-rg --name agrosync-backend
```

### Get URL
Your backend will be available at:
`https://agrosync-backend.azurewebsites.net`

Update frontend `.env`:
```
VITE_API_URL=https://agrosync-backend.azurewebsites.net
```

## Troubleshooting

- Check logs in Azure Portal
- Verify environment variables are set
- Ensure startup command is correct: `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
- Check that requirements.txt includes all dependencies
