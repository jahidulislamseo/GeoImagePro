// Internationalization (i18n) - Bengali and English Support

const translations = {
    en: {
        app_title: "GeoTag Pro",
        upload_title: "Drop images here or click to upload",
        upload_subtitle: "Supports JPG, PNG, WebP, HEIC (Max 50MB per file)",
        uploaded_images: "Uploaded Images",
        selected: "selected",
        of: "of",
        select_all: "Select All",
        deselect_all: "Deselect All",
        apply_to_selected: "Apply to Selected",
        set_location: "Set Location",
        search_location: "Search location...",
        search: "Search",
        location_templates: "Location Templates",
        save_current_location: "Save Current Location",
        no_saved_templates: "No saved templates",
        metadata_editor: "Metadata Editor",
        latitude: "Latitude",
        longitude: "Longitude",
        keywords: "Keywords",
        description: "Description",
        document_name: "Document Name",
        advanced_exif: "Advanced EXIF Fields",
        copyright: "Copyright",
        artist: "Artist/Creator",
        process_download: "Process & Download",
        export_zip: "Export All as ZIP",
        clear_metadata: "Clear Metadata",
        how_it_works: "How It Works",
        faq: "FAQ",
        upload_step: "Upload Images",
        upload_desc: "Drag and drop your photos or click to browse. Supports multiple formats.",
        location_step: "Set Location",
        location_desc: "Click on the map or search for a location to add GPS coordinates.",
        metadata_step: "Add Metadata",
        metadata_desc: "Fill in keywords, descriptions, and other EXIF information.",
        download_step: "Download",
        download_desc: "Process and download your geotagged images individually or as a ZIP.",
        rotate_left: "Rotate Left",
        rotate_right: "Rotate Right",
        download: "Download",
        processing: "Processing images...",
        footer_text: "© 2024 GeoTag Pro. All uploaded images are processed securely and not stored."
    },
    bn: {
        app_title: "জিওট্যাগ প্রো",
        upload_title: "ছবি এখানে ড্রপ করুন বা আপলোড করতে ক্লিক করুন",
        upload_subtitle: "JPG, PNG, WebP, HEIC সাপোর্ট করে (সর্বোচ্চ ৫০MB প্রতি ফাইল)",
        uploaded_images: "আপলোড করা ছবি",
        selected: "নির্বাচিত",
        of: "এর",
        select_all: "সব নির্বাচন করুন",
        deselect_all: "নির্বাচন বাতিল করুন",
        apply_to_selected: "নির্বাচিতগুলিতে প্রয়োগ করুন",
        set_location: "লোকেশন সেট করুন",
        search_location: "লোকেশন খুঁজুন...",
        search: "খুঁজুন",
        location_templates: "লোকেশন টেমপ্লেট",
        save_current_location: "বর্তমান লোকেশন সেভ করুন",
        no_saved_templates: "কোন সেভ করা টেমপ্লেট নেই",
        metadata_editor: "মেটাডেটা এডিটর",
        latitude: "অক্ষাংশ",
        longitude: "দ্রাঘিমাংশ",
        keywords: "কীওয়ার্ড",
        description: "বর্ণনা",
        document_name: "ডকুমেন্ট নাম",
        advanced_exif: "অ্যাডভান্সড EXIF ফিল্ড",
        copyright: "কপিরাইট",
        artist: "শিল্পী/সৃষ্টিকর্তা",
        process_download: "প্রসেস ও ডাউনলোড",
        export_zip: "সব ZIP হিসেবে এক্সপোর্ট",
        clear_metadata: "মেটাডেটা পরিষ্কার করুন",
        how_it_works: "কীভাবে কাজ করে",
        faq: "প্রশ্নোত্তর",
        upload_step: "ছবি আপলোড করুন",
        upload_desc: "আপনার ফটো ড্র্যাগ এবং ড্রপ করুন বা ব্রাউজ করতে ক্লিক করুন। একাধিক ফর্ম্যাট সাপোর্ট করে।",
        location_step: "লোকেশন সেট করুন",
        location_desc: "ম্যাপে ক্লিক করুন অথবা GPS কোঅর্ডিনেট যোগ করতে একটি লোকেশন অনুসন্ধান করুন।",
        metadata_step: "মেটাডেটা যোগ করুন",
        metadata_desc: "কীওয়ার্ড, বর্ণনা এবং অন্যান্য EXIF তথ্য পূরণ করুন।",
        download_step: "ডাউনলোড",
        download_desc: "আপনার জিওট্যাগ করা ছবি আলাদাভাবে বা ZIP হিসেবে প্রসেস এবং ডাউনলোড করুন।",
        rotate_left: "বামে ঘুরান",
        rotate_right: "ডানে ঘুরান",
        download: "ডাউনলোড",
        processing: "ছবি প্রসেস হচ্ছে...",
        footer_text: "© ২০২৪ জিওট্যাগ প্রো। সমস্ত আপলোড করা ছবি নিরাপদভাবে প্রসেস করা হয় এবং সংরক্ষণ করা হয় না।"
    }
};

let currentLanguage = localStorage.getItem('language') || 'en';

function t(key) {
    return translations[currentLanguage][key] || key;
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
}

function updatePageLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
        } else {
            el.textContent = translation;
        }
    });
    
    // Update specific elements
    document.title = `${t('app_title')} - Advanced Photo Geotagging`;
}

function initLanguageSelector() {
    const nav = document.querySelector('.nav');
    
    const langSelector = document.createElement('div');
    langSelector.className = 'language-selector';
    langSelector.innerHTML = `
        <button class="language-btn" id="lang-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span>${currentLanguage === 'en' ? 'EN' : 'বাং'}</span>
        </button>
        <div class="language-dropdown hidden" id="lang-dropdown">
            <div class="language-option ${currentLanguage === 'en' ? 'active' : ''}" data-lang="en">
                English
            </div>
            <div class="language-option ${currentLanguage === 'bn' ? 'active' : ''}" data-lang="bn">
                বাংলা (Bengali)
            </div>
        </div>
    `;
    
    nav.insertBefore(langSelector, nav.lastElementChild);
    
    // Toggle dropdown
    document.getElementById('lang-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('lang-dropdown').classList.toggle('hidden');
    });
    
    // Select language
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            setLanguage(lang);
            document.getElementById('lang-dropdown').classList.add('hidden');
            
            // Update button text
            document.querySelector('.language-btn span').textContent = lang === 'en' ? 'EN' : 'বাং';
            
            // Update active state
            document.querySelectorAll('.language-option').forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
            
            showToast(lang === 'en' ? 'Language changed to English' : 'ভাষা বাংলায় পরিবর্তিত হয়েছে');
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        document.getElementById('lang-dropdown').classList.add('hidden');
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initLanguageSelector();
    updatePageLanguage();
});
