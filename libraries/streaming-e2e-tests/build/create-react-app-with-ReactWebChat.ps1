param($RootReactPiecesDir)

# Create React App
npx create-react-app react-app

# Install WebChat into react-app
Set-Location -Path "$RootReactPiecesDir\react-app"
npm install botframework-webchat

# In react-app, delete files we will be replacing with our custom code that uses `ReactWebChat`
Remove-Item src/App.js, src/index.js, public/index.html

# Copy Custom files into react-app
copy ..\custom-app-code\App.js, ..\custom-app-code\index.js .\src\
copy ..\custom-app-code\index.html .\public
