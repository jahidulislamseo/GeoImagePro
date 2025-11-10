// AI-Powered Features (requires Google Gemini API or OpenAI API)

const AI_CONFIG = {
    provider: 'gemini', // or 'openai'
    apiKey: localStorage.getItem('ai_api_key') || '',
    model: 'gemini-1.5-flash' // or 'gpt-4-vision-preview'
};

// AI API Key Management
function showAISetup() {
    // Check if backend has API key configured
    fetch('/api/ai/check-key')
        .then(r => r.json())
        .then(data => {
            if (data.configured) {
                showToast('✅ AI features are already configured!');
                enableAIFeatures();
                return;
            }
            
            const currentKey = AI_CONFIG.apiKey ? '***' + AI_CONFIG.apiKey.slice(-4) : 'Not set';
            
            const message = `
AI Features Setup

Current API Key: ${currentKey}

To enable AI features, you need a Google Gemini API key.
Get your free API key from: https://makersuite.google.com/app/apikey

Enter your API key below:
            `.trim();
            
            const apiKey = prompt(message, '');
            
            if (apiKey) {
                AI_CONFIG.apiKey = apiKey;
                localStorage.setItem('ai_api_key', apiKey);
                showToast('AI API key saved successfully');
                enableAIFeatures();
            }
        })
        .catch(() => {
            // Fallback to manual setup
            const currentKey = AI_CONFIG.apiKey ? '***' + AI_CONFIG.apiKey.slice(-4) : 'Not set';
            const apiKey = prompt('Enter your Gemini API key:', '');
            if (apiKey) {
                AI_CONFIG.apiKey = apiKey;
                localStorage.setItem('ai_api_key', apiKey);
                showToast('AI API key saved successfully');
                enableAIFeatures();
            }
        });
}

function enableAIFeatures() {
    if (!AI_CONFIG.apiKey) {
        const setupBtn = document.createElement('button');
        setupBtn.className = 'btn btn-primary btn-block';
        setupBtn.innerHTML = '🤖 Setup AI Features';
        setupBtn.onclick = showAISetup;
        
        const metadataCard = document.querySelector('.card');
        if (metadataCard) {
            const aiCard = document.createElement('div');
            aiCard.className = 'card';
            aiCard.innerHTML = `
                <div class="card-header">
                    <h3>🤖 AI Assistant</h3>
                </div>
                <div class="card-body">
                    <p class="text-muted">Enable AI-powered features:</p>
                    <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                        <li>Auto-detect location from image</li>
                        <li>Generate smart keywords</li>
                        <li>Create descriptions automatically</li>
                    </ul>
                </div>
            `;
            aiCard.querySelector('.card-body').appendChild(setupBtn);
            metadataCard.before(aiCard);
        }
        return;
    }
    
    // Add AI buttons to UI
    addAIButtons();
}

function addAIButtons() {
    const metadataCard = document.querySelector('.card');
    if (!metadataCard) return;
    
    const aiCard = document.createElement('div');
    aiCard.className = 'card';
    aiCard.id = 'ai-features-card';
    aiCard.innerHTML = `
        <div class="card-header">
            <h3>🤖 AI Assistant</h3>
            <button class="btn btn-secondary" onclick="showAISetup()">⚙️</button>
        </div>
        <div class="card-body">
            <button class="btn btn-outline btn-block" id="ai-detect-location">
                🌍 Detect Location from Image
            </button>
            <button class="btn btn-outline btn-block" id="ai-generate-keywords">
                🏷️ Generate Smart Keywords
            </button>
            <button class="btn btn-outline btn-block" id="ai-generate-description">
                📝 Auto-Generate Description
            </button>
        </div>
    `;
    
    metadataCard.before(aiCard);
    
    // Add event listeners
    document.getElementById('ai-detect-location').addEventListener('click', aiDetectLocation);
    document.getElementById('ai-generate-keywords').addEventListener('click', aiGenerateKeywords);
    document.getElementById('ai-generate-description').addEventListener('click', aiGenerateDescription);
}

// AI Location Detection
async function aiDetectLocation() {
    const selectedImage = getSelectedImage();
    if (!selectedImage) {
        showToast('Please select an image first', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const base64Image = await fileToBase64(selectedImage.file);
        
        const prompt = `Analyze this image and determine the most likely geographic location where it was taken. 
Consider landmarks, architecture, vegetation, signs, and any other visual clues. 
Provide your best estimate of the latitude and longitude coordinates.
Respond ONLY with JSON in this exact format: {"latitude": 40.7128, "longitude": -74.0060, "confidence": 0.85, "location_name": "New York City"}`;
        
        const result = await callGeminiVision(base64Image, prompt);
        
        if (result.latitude && result.longitude) {
            state.map.setView([result.latitude, result.longitude], 13);
            state.marker.setLatLng([result.latitude, result.longitude]);
            updateLocation(result.latitude, result.longitude);
            
            showToast(`Location detected: ${result.location_name} (${Math.round(result.confidence * 100)}% confidence)`);
        } else {
            showToast('Could not detect location from image', 'error');
        }
    } catch (error) {
        console.error('AI Location Detection Error:', error);
        showToast('Error detecting location: ' + error.message, 'error');
    }
    
    hideLoading();
}

// AI Keyword Generation
async function aiGenerateKeywords() {
    const selectedImage = getSelectedImage();
    if (!selectedImage) {
        showToast('Please select an image first', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const base64Image = await fileToBase64(selectedImage.file);
        
        const prompt = `Analyze this image and generate relevant keywords for photo metadata. 
Include: subject, setting, mood, colors, composition style, and any notable features.
Provide 10-15 descriptive keywords separated by commas.
Respond ONLY with the keywords, no other text.`;
        
        const keywords = await callGeminiVision(base64Image, prompt);
        
        document.getElementById('keywords-input').value = keywords.trim();
        showToast('Keywords generated successfully');
    } catch (error) {
        console.error('AI Keywords Error:', error);
        showToast('Error generating keywords: ' + error.message, 'error');
    }
    
    hideLoading();
}

// AI Description Generation
async function aiGenerateDescription() {
    const selectedImage = getSelectedImage();
    if (!selectedImage) {
        showToast('Please select an image first', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const base64Image = await fileToBase64(selectedImage.file);
        
        const prompt = `Create a detailed, professional description of this photograph suitable for image metadata. 
Include: main subject, composition, lighting, mood, and any notable features.
Write in a clear, descriptive style. Keep it under 200 words.
Respond ONLY with the description, no other text.`;
        
        const description = await callGeminiVision(base64Image, prompt);
        
        document.getElementById('description-input').value = description.trim();
        showToast('Description generated successfully');
    } catch (error) {
        console.error('AI Description Error:', error);
        showToast('Error generating description: ' + error.message, 'error');
    }
    
    hideLoading();
}

// Helper: Get selected image
function getSelectedImage() {
    if (state.selectedImages.size > 0) {
        const firstSelectedId = Array.from(state.selectedImages)[0];
        return state.images.find(img => img.id === firstSelectedId);
    }
    return state.images[0] || null;
}

// Helper: Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// API Call: Google Gemini Vision (via backend proxy)
async function callGeminiVision(base64Image, prompt) {
    // Use backend proxy for security
    const selectedImage = getSelectedImage();
    if (!selectedImage) return null;
    
    const formData = new FormData();
    formData.append('image', selectedImage.file);
    
    // Determine prompt type
    let promptType = 'location';
    if (prompt.includes('keywords')) {
        promptType = 'keywords';
    } else if (prompt.includes('description')) {
        promptType = 'description';
    }
    
    formData.append('prompt_type', promptType);
    
    // Add API key if available
    if (AI_CONFIG.apiKey) {
        formData.append('api_key', AI_CONFIG.apiKey);
    }
    
    const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'AI request failed');
    }
    
    const data = await response.json();
    return data.result || data;
}

// Initialize AI features on page load
document.addEventListener('DOMContentLoaded', () => {
    enableAIFeatures();
});
