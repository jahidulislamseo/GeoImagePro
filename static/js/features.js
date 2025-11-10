// Additional Features: Image Preview, Rotation, Keyboard Shortcuts, etc.

// Image Preview Modal
let currentPreviewImage = null;
let currentRotation = 0;

function initImagePreview() {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalClose = document.getElementById('modal-close');
    const rotateLeftBtn = document.getElementById('rotate-left-btn');
    const rotateRightBtn = document.getElementById('rotate-right-btn');
    const downloadPreviewBtn = document.getElementById('download-preview-btn');
    
    // Open modal when clicking gallery images
    document.addEventListener('click', (e) => {
        const galleryItem = e.target.closest('.gallery-item');
        if (galleryItem && !e.target.classList.contains('remove-btn')) {
            const img = galleryItem.querySelector('img');
            if (img) {
                openImagePreview(img.src);
            }
        }
    });
    
    // Close modal
    modalClose.addEventListener('click', closeImagePreview);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeImagePreview();
    });
    
    // Rotation
    rotateLeftBtn.addEventListener('click', () => rotateImage(-90));
    rotateRightBtn.addEventListener('click', () => rotateImage(90));
    
    // Download
    downloadPreviewBtn.addEventListener('click', downloadPreviewImage);
}

function openImagePreview(imageSrc) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    
    currentPreviewImage = imageSrc;
    currentRotation = 0;
    
    modalImage.src = imageSrc;
    modalImage.style.transform = 'rotate(0deg)';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeImagePreview() {
    const modal = document.getElementById('image-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    currentPreviewImage = null;
    currentRotation = 0;
}

function rotateImage(degrees) {
    const modalImage = document.getElementById('modal-image');
    currentRotation += degrees;
    modalImage.style.transform = `rotate(${currentRotation}deg)`;
}

function downloadPreviewImage() {
    if (!currentPreviewImage) return;
    
    const a = document.createElement('a');
    a.href = currentPreviewImage;
    a.download = `image_${Date.now()}.jpg`;
    a.click();
}

// Keyboard Shortcuts
function initKeyboardShortcuts() {
    const shortcutsPanel = document.getElementById('shortcuts-panel');
    
    document.addEventListener('keydown', (e) => {
        // Ctrl+U - Upload
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            document.getElementById('file-input').click();
        }
        
        // Ctrl+A - Select All (when images exist)
        if (e.ctrlKey && e.key === 'a' && state.images.length > 0) {
            e.preventDefault();
            document.getElementById('select-all-btn')?.click();
        }
        
        // Esc - Clear selection or close modal
        if (e.key === 'Escape') {
            if (!document.getElementById('image-modal').classList.contains('hidden')) {
                closeImagePreview();
            } else if (state.selectedImages.size > 0) {
                document.getElementById('deselect-all-btn')?.click();
            }
        }
        
        // Ctrl+Enter - Process images
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            if (state.selectedImages.size > 0) {
                applyBatchGeotag();
            } else {
                document.getElementById('process-btn')?.click();
            }
        }
        
        // ? - Toggle shortcuts help
        if (e.key === '?' && !e.ctrlKey && !e.shiftKey) {
            shortcutsPanel.classList.toggle('hidden');
        }
        
        // Delete - Remove selected images
        if (e.key === 'Delete' && state.selectedImages.size > 0) {
            const idsToRemove = Array.from(state.selectedImages);
            idsToRemove.forEach(id => removeImage(id));
        }
    });
}

// Progress Tracking
function showUploadProgress(loaded, total) {
    const uploadZone = document.getElementById('upload-zone');
    let progressBar = uploadZone.querySelector('.progress-bar');
    
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        uploadZone.appendChild(progressBar);
    }
    
    const progressFill = progressBar.querySelector('.progress-fill');
    const percentage = (loaded / total) * 100;
    progressFill.style.width = `${percentage}%`;
    
    if (percentage >= 100) {
        setTimeout(() => {
            progressBar.remove();
        }, 500);
    }
}

// Location History Management
function initLocationHistory() {
    loadLocationHistory();
}

function saveToLocationHistory(location, coordinates) {
    const history = getLocationHistory();
    const newEntry = {
        id: Date.now(),
        location,
        coordinates,
        timestamp: new Date().toISOString()
    };
    
    history.unshift(newEntry);
    
    // Keep only last 10
    const trimmed = history.slice(0, 10);
    localStorage.setItem('locationHistory', JSON.stringify(trimmed));
    
    renderLocationHistory();
}

function getLocationHistory() {
    const stored = localStorage.getItem('locationHistory');
    return stored ? JSON.parse(stored) : [];
}

function loadLocationHistory() {
    renderLocationHistory();
}

function renderLocationHistory() {
    const history = getLocationHistory();
    
    if (history.length === 0) return;
    
    // Add to search history section
    const searchHistoryDiv = document.createElement('div');
    searchHistoryDiv.className = 'card';
    searchHistoryDiv.innerHTML = `
        <div class="card-header">
            <h3>Recent Locations</h3>
        </div>
        <div class="card-body">
            ${history.map(item => `
                <div class="template-item" onclick="applyHistoryLocation(${item.coordinates.lat}, ${item.coordinates.lng})">
                    <div class="template-info">
                        <h4>${item.location}</h4>
                        <p>${item.coordinates.lat.toFixed(4)}, ${item.coordinates.lng.toFixed(4)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Insert after location templates
    const templateCard = document.querySelector('.card');
    if (templateCard && !document.getElementById('location-history-card')) {
        searchHistoryDiv.id = 'location-history-card';
        templateCard.after(searchHistoryDiv);
    }
}

function applyHistoryLocation(lat, lng) {
    state.map.setView([lat, lng], 13);
    state.marker.setLatLng([lat, lng]);
    updateLocation(lat, lng);
    showToast('Location applied from history');
}

// Bulk Metadata Editor
function showBulkMetadataEditor() {
    const selectedCount = state.selectedImages.size;
    if (selectedCount === 0) {
        showToast('Select images first', 'error');
        return;
    }
    
    const metadata = {
        keywords: document.getElementById('keywords-input').value,
        description: document.getElementById('description-input').value,
        copyright: document.getElementById('copyright-input').value,
        artist: document.getElementById('artist-input').value
    };
    
    const confirmed = confirm(
        `Apply this metadata to ${selectedCount} selected image(s)?` +
        `\n\nKeywords: ${metadata.keywords || '(none)'}` +
        `\nDescription: ${metadata.description || '(none)'}` +
        `\nCopyright: ${metadata.copyright || '(none)'}` +
        `\nArtist: ${metadata.artist || '(none)'}`
    );
    
    if (confirmed) {
        applyBatchGeotag();
    }
}

// Export Settings
function showExportSettings() {
    const quality = prompt('Enter JPEG quality (1-100):', '90');
    if (quality) {
        localStorage.setItem('exportQuality', quality);
        showToast(`Export quality set to ${quality}%`);
    }
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    initImagePreview();
    initKeyboardShortcuts();
    initLocationHistory();
    
    // Add export settings button
    const exportBtn = document.getElementById('export-zip-btn');
    if (exportBtn) {
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'btn btn-outline btn-block';
        settingsBtn.textContent = '⚙️ Export Settings';
        settingsBtn.onclick = showExportSettings;
        exportBtn.after(settingsBtn);
    }
    
    // Add bulk metadata button
    const applyBatchBtn = document.getElementById('apply-batch-btn');
    if (applyBatchBtn) {
        applyBatchBtn.onclick = showBulkMetadataEditor;
    }
});

// Enhanced search with history
const originalSearchLocation = window.searchLocation;
window.searchLocation = async function() {
    const query = document.getElementById('location-search').value;
    if (!query) return;
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const results = await response.json();
        
        if (results.length > 0) {
            const { lat, lon, display_name } = results[0];
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lon);
            
            state.map.setView([latNum, lngNum], 13);
            state.marker.setLatLng([latNum, lngNum]);
            updateLocation(latNum, lngNum);
            
            // Save to history
            saveToLocationHistory(display_name, { lat: latNum, lng: lngNum });
            
            showToast(`Location found: ${display_name}`);
        } else {
            showToast('Location not found', 'error');
        }
    } catch (error) {
        showToast('Error searching location', 'error');
    }
};
