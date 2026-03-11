import https from 'https';

const API_KEY = "AIzaSyCjsv09ekQvkmQnztSsrF-jrBIwL80URVk";

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log("\n=== Available Gemini Models ===\n");
        
        if (response.models) {
          response.models.forEach(model => {
            console.log(`Model: ${model.name}`);
            console.log(`  Display Name: ${model.displayName || 'N/A'}`);
            console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
            console.log('');
          });
        } else {
          console.log("Error:", response);
        }
      } catch (e) {
        console.error("Parse error:", e.message);
        console.log("Raw response:", data);
      }
    });
  }).on('error', (err) => {
    console.error("Request error:", err.message);
  });
}

listModels();
