// GPX Track File Import Feature

function initGPXImport() {
    // Add GPX import button
    const mapCard = document.querySelector('.card');
    if (!mapCard) return;
    
    const gpxCard = document.createElement('div');
    gpxCard.className = 'card';
    gpxCard.innerHTML = `
        <div class="card-header">
            <h3>📍 GPX Track Import</h3>
        </div>
        <div class="card-body">
            <p class="text-muted" style="margin-bottom: 1rem;">Import GPS tracks from GPX files and apply locations to your images automatically.</p>
            <input type="file" id="gpx-file-input" accept=".gpx" style="display: none;">
            <button class="btn btn-outline btn-block" id="import-gpx-btn">
                📂 Import GPX File
            </button>
            <div id="gpx-track-info" class="hidden" style="margin-top: 1rem;">
                <p><strong>Track loaded:</strong> <span id="gpx-track-name"></span></p>
                <p><strong>Points:</strong> <span id="gpx-point-count"></span></p>
                <button class="btn btn-primary btn-block" id="match-images-btn">
                    🎯 Match Images to Track
                </button>
            </div>
        </div>
    `;
    
    mapCard.after(gpxCard);
    
    // Event listeners
    document.getElementById('import-gpx-btn').addEventListener('click', () => {
        document.getElementById('gpx-file-input').click();
    });
    
    document.getElementById('gpx-file-input').addEventListener('change', handleGPXFile);
    document.getElementById('match-images-btn')?.addEventListener('click', matchImagesToTrack);
}

let gpxTrackPoints = [];

async function handleGPXFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showLoading();
    
    try {
        const text = await file.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        // Parse GPX track points
        const trackPoints = xmlDoc.querySelectorAll('trkpt');
        gpxTrackPoints = Array.from(trackPoints).map(point => ({
            lat: parseFloat(point.getAttribute('lat')),
            lng: parseFloat(point.getAttribute('lon')),
            time: point.querySelector('time')?.textContent || null,
            elevation: point.querySelector('ele')?.textContent || null
        }));
        
        if (gpxTrackPoints.length === 0) {
            throw new Error('No track points found in GPX file');
        }
        
        // Display track on map
        displayGPXTrack();
        
        // Update UI
        document.getElementById('gpx-track-name').textContent = file.name;
        document.getElementById('gpx-point-count').textContent = gpxTrackPoints.length;
        document.getElementById('gpx-track-info').classList.remove('hidden');
        
        showToast(`GPX track loaded: ${gpxTrackPoints.length} points`);
    } catch (error) {
        console.error('GPX Parse Error:', error);
        showToast('Error parsing GPX file: ' + error.message, 'error');
    }
    
    hideLoading();
}

function displayGPXTrack() {
    // Create polyline on map
    const latLngs = gpxTrackPoints.map(point => [point.lat, point.lng]);
    
    if (window.gpxPolyline) {
        window.gpxPolyline.remove();
    }
    
    window.gpxPolyline = L.polyline(latLngs, {
        color: '#2563eb',
        weight: 3,
        opacity: 0.7
    }).addTo(state.map);
    
    // Fit map to track bounds
    state.map.fitBounds(window.gpxPolyline.getBounds(), { padding: [50, 50] });
    
    // Add start/end markers
    if (window.gpxStartMarker) window.gpxStartMarker.remove();
    if (window.gpxEndMarker) window.gpxEndMarker.remove();
    
    const startIcon = L.divIcon({
        html: '🚩',
        className: 'gpx-marker',
        iconSize: [30, 30]
    });
    
    const endIcon = L.divIcon({
        html: '🏁',
        className: 'gpx-marker',
        iconSize: [30, 30]
    });
    
    window.gpxStartMarker = L.marker([latLngs[0][0], latLngs[0][1]], { icon: startIcon })
        .addTo(state.map)
        .bindPopup('Track Start');
    
    window.gpxEndMarker = L.marker([latLngs[latLngs.length - 1][0], latLngs[latLngs.length - 1][1]], { icon: endIcon })
        .addTo(state.map)
        .bindPopup('Track End');
}

function matchImagesToTrack() {
    if (gpxTrackPoints.length === 0) {
        showToast('No GPX track loaded', 'error');
        return;
    }
    
    if (state.images.length === 0) {
        showToast('No images uploaded', 'error');
        return;
    }
    
    showLoading();
    
    let matchedCount = 0;
    
    // For each image, try to match to closest track point by time
    state.images.forEach(image => {
        // Try to extract timestamp from image (would need EXIF reading)
        // For now, distribute images evenly along track
        const index = Math.floor((state.images.indexOf(image) / state.images.length) * gpxTrackPoints.length);
        const point = gpxTrackPoints[Math.min(index, gpxTrackPoints.length - 1)];
        
        if (point) {
            // Store location with image
            image.gpxLocation = {
                lat: point.lat,
                lng: point.lng,
                elevation: point.elevation
            };
            matchedCount++;
        }
    });
    
    hideLoading();
    
    if (matchedCount > 0) {
        showToast(`Matched ${matchedCount} images to GPX track points`);
        
        // Apply first location to map
        const firstPoint = state.images[0].gpxLocation;
        if (firstPoint) {
            state.map.setView([firstPoint.lat, firstPoint.lng], 13);
            state.marker.setLatLng([firstPoint.lat, firstPoint.lng]);
            updateLocation(firstPoint.lat, firstPoint.lng);
        }
    } else {
        showToast('No images could be matched', 'error');
    }
}

// Enhanced batch processing with GPX locations
const originalApplyBatchGeotag = window.applyBatchGeotag;
window.applyBatchGeotag = async function() {
    // If GPX locations are available, use them
    const imagesToProcess = Array.from(state.selectedImages).map(id => 
        state.images.find(img => img.id === id)
    );
    
    const hasGPXLocations = imagesToProcess.some(img => img.gpxLocation);
    
    if (hasGPXLocations) {
        const confirmed = confirm(
            `Found GPX locations for selected images.\n\n` +
            `Use GPX track locations instead of manual coordinates?`
        );
        
        if (confirmed) {
            showLoading();
            
            for (const image of imagesToProcess) {
                if (image.gpxLocation) {
                    await processImageWithLocation(
                        image,
                        image.gpxLocation.lat,
                        image.gpxLocation.lng
                    );
                }
            }
            
            hideLoading();
            showToast('Images processed with GPX locations');
            return;
        }
    }
    
    // Otherwise use original batch processing
    if (originalApplyBatchGeotag) {
        originalApplyBatchGeotag();
    }
};

async function processImageWithLocation(image, lat, lng) {
    const formData = new FormData();
    formData.append('image', image.file);
    formData.append('latitude', lat);
    formData.append('longitude', lng);
    
    const keywords = document.getElementById('keywords-input').value;
    const description = document.getElementById('description-input').value;
    const copyright = document.getElementById('copyright-input').value;
    const artist = document.getElementById('artist-input').value;
    
    if (keywords) formData.append('keywords', keywords);
    if (description) formData.append('description', description);
    if (copyright) formData.append('copyright', copyright);
    if (artist) formData.append('artist', artist);
    
    const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData
    });
    
    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `geotagged_${image.file.name}`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initGPXImport();
});
