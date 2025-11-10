// Global State
const state = {
    images: [],
    selectedImages: new Set(),
    currentLocation: { lat: 40.7128, lng: -74.0060 },
    map: null,
    marker: null,
    templates: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMap();
    initUpload();
    initBatchControls();
    initLocationTemplates();
    initMetadataPanel();
    initAdvancedExif();
    loadTemplates();
});

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Map Initialization
function initMap() {
    state.map = L.map('map').setView([state.currentLocation.lat, state.currentLocation.lng], 13);
    
    const tileLayersstate = {
        streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }),
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
        }),
        terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenTopoMap'
        })
    };
    
    tileLayersstate.streets.addTo(state.map);
    
    // Map layer selector
    document.getElementById('map-layer-select').addEventListener('change', (e) => {
        const layer = e.target.value;
        state.map.eachLayer((l) => {
            if (l instanceof L.TileLayer) {
                state.map.removeLayer(l);
            }
        });
        tileLayersstate[layer].addTo(state.map);
    });
    
    // Add marker
    state.marker = L.marker([state.currentLocation.lat, state.currentLocation.lng], {
        draggable: true
    }).addTo(state.map);
    
    // Update location on marker drag
    state.marker.on('dragend', () => {
        const pos = state.marker.getLatLng();
        updateLocation(pos.lat, pos.lng);
    });
    
    // Update location on map click
    state.map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        state.marker.setLatLng([lat, lng]);
        updateLocation(lat, lng);
    });
    
    // Location search
    document.getElementById('search-btn').addEventListener('click', searchLocation);
    document.getElementById('location-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchLocation();
    });
}

function updateLocation(lat, lng) {
    state.currentLocation = { lat, lng };
    document.getElementById('latitude-input').value = lat.toFixed(6);
    document.getElementById('longitude-input').value = lng.toFixed(6);
}

async function searchLocation() {
    const query = document.getElementById('location-search').value;
    if (!query) return;
    
    try {
        // Using Nominatim for geocoding
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const results = await response.json();
        
        if (results.length > 0) {
            const { lat, lon } = results[0];
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lon);
            
            state.map.setView([latNum, lngNum], 13);
            state.marker.setLatLng([latNum, lngNum]);
            updateLocation(latNum, lngNum);
            showToast(`Location found: ${results[0].display_name}`);
        } else {
            showToast('Location not found', 'error');
        }
    } catch (error) {
        showToast('Error searching location', 'error');
    }
}

// File Upload
function initUpload() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(Array.from(e.target.files));
    });
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        handleFiles(Array.from(e.dataTransfer.files));
    });
}

function handleFiles(files) {
    const validFiles = files.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext);
    });
    
    if (validFiles.length === 0) {
        showToast('No valid image files selected', 'error');
        return;
    }
    
    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const image = {
                id: Date.now() + Math.random(),
                file: file,
                preview: e.target.result,
                hasGeotag: false
            };
            state.images.push(image);
            renderGallery();
        };
        reader.readAsDataURL(file);
    });
    
    showToast(`${validFiles.length} image(s) uploaded`);
}

function renderGallery() {
    const gallery = document.getElementById('image-gallery');
    const galleryGrid = document.getElementById('gallery-grid');
    const galleryCount = document.getElementById('gallery-count');
    const totalCount = document.getElementById('total-count');
    const batchControls = document.getElementById('batch-controls');
    
    if (state.images.length === 0) {
        gallery.classList.add('hidden');
        batchControls.classList.add('hidden');
        return;
    }
    
    gallery.classList.remove('hidden');
    batchControls.classList.remove('hidden');
    galleryCount.textContent = state.images.length;
    totalCount.textContent = state.images.length;
    
    galleryGrid.innerHTML = state.images.map(img => `
        <div class="gallery-item ${state.selectedImages.has(img.id) ? 'selected' : ''}" 
             data-id="${img.id}">
            <img src="${img.preview}" alt="Uploaded image">
            ${img.hasGeotag ? '<span class="badge">Tagged</span>' : ''}
            <button class="remove-btn" onclick="removeImage('${img.id}')">×</button>
        </div>
    `).join('');
    
    // Add click handlers to gallery items
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) return;
            const id = parseFloat(item.dataset.id);
            toggleImageSelection(id);
        });
    });
    
    updateSelectedCount();
}

function removeImage(id) {
    state.images = state.images.filter(img => img.id !== parseFloat(id));
    state.selectedImages.delete(parseFloat(id));
    renderGallery();
}

function toggleImageSelection(id) {
    if (state.selectedImages.has(id)) {
        state.selectedImages.delete(id);
    } else {
        state.selectedImages.add(id);
    }
    renderGallery();
}

function updateSelectedCount() {
    document.getElementById('selected-count').textContent = state.selectedImages.size;
}

// Batch Controls
function initBatchControls() {
    document.getElementById('select-all-btn').addEventListener('click', () => {
        state.images.forEach(img => state.selectedImages.add(img.id));
        renderGallery();
    });
    
    document.getElementById('deselect-all-btn').addEventListener('click', () => {
        state.selectedImages.clear();
        renderGallery();
    });
    
    document.getElementById('apply-batch-btn').addEventListener('click', applyBatchGeotag);
}

async function applyBatchGeotag() {
    if (state.selectedImages.size === 0) {
        showToast('No images selected', 'error');
        return;
    }
    
    showLoading();
    
    const metadata = getMetadata();
    let processed = 0;
    
    for (const imageId of state.selectedImages) {
        const image = state.images.find(img => img.id === imageId);
        if (image) {
            try {
                await processImage(image.file, metadata);
                image.hasGeotag = true;
                processed++;
            } catch (error) {
                console.error('Error processing image:', error);
            }
        }
    }
    
    hideLoading();
    renderGallery();
    showToast(`Processed ${processed} image(s)`);
}

// Location Templates
function initLocationTemplates() {
    document.getElementById('save-template-btn').addEventListener('click', saveTemplate);
}

async function loadTemplates() {
    try {
        const response = await fetch('/api/location-templates');
        state.templates = await response.json();
        renderTemplates();
    } catch (error) {
        console.error('Error loading templates:', error);
    }
}

function renderTemplates() {
    const templateList = document.getElementById('template-list');
    
    if (state.templates.length === 0) {
        templateList.innerHTML = '<p class="text-muted">No saved templates</p>';
        return;
    }
    
    templateList.innerHTML = state.templates.map(t => `
        <div class="template-item" onclick="applyTemplate(${t.id})">
            <div class="template-info">
                <h4>${t.name}</h4>
                <p>${t.latitude.toFixed(4)}, ${t.longitude.toFixed(4)}</p>
            </div>
            <button class="btn btn-secondary" onclick="event.stopPropagation(); deleteTemplate(${t.id})">Delete</button>
        </div>
    `).join('');
}

async function saveTemplate() {
    const name = prompt('Enter template name:');
    if (!name) return;
    
    try {
        const response = await fetch('/api/location-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                latitude: state.currentLocation.lat,
                longitude: state.currentLocation.lng
            })
        });
        
        if (response.ok) {
            await loadTemplates();
            showToast('Template saved');
        }
    } catch (error) {
        showToast('Error saving template', 'error');
    }
}

async function deleteTemplate(id) {
    try {
        const response = await fetch(`/api/location-templates/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadTemplates();
            showToast('Template deleted');
        }
    } catch (error) {
        showToast('Error deleting template', 'error');
    }
}

function applyTemplate(id) {
    const template = state.templates.find(t => t.id === id);
    if (template) {
        state.map.setView([template.latitude, template.longitude], 13);
        state.marker.setLatLng([template.latitude, template.longitude]);
        updateLocation(template.latitude, template.longitude);
        showToast(`Applied template: ${template.name}`);
    }
}

// Metadata Panel
function initMetadataPanel() {
    document.getElementById('latitude-input').addEventListener('change', (e) => {
        const lat = parseFloat(e.target.value);
        if (!isNaN(lat)) {
            state.marker.setLatLng([lat, state.currentLocation.lng]);
            state.map.setView([lat, state.currentLocation.lng]);
            state.currentLocation.lat = lat;
        }
    });
    
    document.getElementById('longitude-input').addEventListener('change', (e) => {
        const lng = parseFloat(e.target.value);
        if (!isNaN(lng)) {
            state.marker.setLatLng([state.currentLocation.lat, lng]);
            state.map.setView([state.currentLocation.lat, lng]);
            state.currentLocation.lng = lng;
        }
    });
    
    document.getElementById('process-btn').addEventListener('click', processSingleImage);
    document.getElementById('export-zip-btn').addEventListener('click', exportZip);
    document.getElementById('clear-btn').addEventListener('click', clearMetadata);
}

function getMetadata() {
    return {
        latitude: parseFloat(document.getElementById('latitude-input').value),
        longitude: parseFloat(document.getElementById('longitude-input').value),
        keywords: document.getElementById('keywords-input').value,
        description: document.getElementById('description-input').value,
        documentName: document.getElementById('document-name-input').value,
        copyright: document.getElementById('copyright-input').value,
        artist: document.getElementById('artist-input').value
    };
}

async function processSingleImage() {
    if (state.images.length === 0) {
        showToast('No images to process', 'error');
        return;
    }
    
    const selectedImage = state.images.find(img => state.selectedImages.has(img.id)) || state.images[0];
    const metadata = getMetadata();
    
    showLoading();
    try {
        await processImage(selectedImage.file, metadata, true);
        selectedImage.hasGeotag = true;
        renderGallery();
        showToast('Image processed and downloaded');
    } catch (error) {
        showToast('Error processing image', 'error');
    }
    hideLoading();
}

async function processImage(file, metadata, download = false) {
    const formData = new FormData();
    formData.append('image', file);
    Object.entries(metadata).forEach(([key, value]) => {
        formData.append(key, value);
    });
    
    const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) throw new Error('Processing failed');
    
    if (download) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `geotagged_${file.name}`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

async function exportZip() {
    if (state.images.length === 0) {
        showToast('No images to export', 'error');
        return;
    }
    
    showLoading();
    
    const formData = new FormData();
    state.images.forEach(img => {
        formData.append('images', img.file);
    });
    
    try {
        const response = await fetch('/api/export-zip', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `geotagged_images_${Date.now()}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);
            showToast('ZIP exported successfully');
        }
    } catch (error) {
        showToast('Error exporting ZIP', 'error');
    }
    
    hideLoading();
}

function clearMetadata() {
    document.getElementById('keywords-input').value = '';
    document.getElementById('description-input').value = '';
    document.getElementById('document-name-input').value = '';
    document.getElementById('copyright-input').value = '';
    document.getElementById('artist-input').value = '';
    showToast('Metadata cleared');
}

// Advanced EXIF
function initAdvancedExif() {
    const header = document.getElementById('advanced-exif-header');
    const body = document.getElementById('advanced-exif-body');
    const toggleIcon = header.querySelector('.toggle-icon');
    
    header.addEventListener('click', () => {
        body.classList.toggle('hidden');
        toggleIcon.classList.toggle('open');
    });
}

// Utility Functions
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}
