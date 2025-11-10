import os
import io
import json
import zipfile
from datetime import datetime
from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import piexif
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'heic'}

# Database connection
def get_db():
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    return conn

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize database tables
def init_db():
    conn = get_db()
    cur = conn.cursor()
    
    # Location Templates table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS location_templates (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Batch Jobs table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS batch_jobs (
            id SERIAL PRIMARY KEY,
            status VARCHAR(50) NOT NULL,
            total_images INTEGER NOT NULL,
            processed_images INTEGER DEFAULT 0,
            latitude DOUBLE PRECISION,
            longitude DOUBLE PRECISION,
            keywords TEXT,
            description TEXT,
            document_name VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP
        )
    ''')
    
    conn.commit()
    cur.close()
    conn.close()

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/location-templates', methods=['GET'])
def get_templates():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute('SELECT * FROM location_templates ORDER BY created_at DESC')
    templates = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(templates)

@app.route('/api/location-templates', methods=['POST'])
def create_template():
    data = request.get_json()
    name = data.get('name')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    if not all([name, latitude is not None, longitude is not None]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(
        'INSERT INTO location_templates (name, latitude, longitude) VALUES (%s, %s, %s) RETURNING *',
        (name, float(latitude), float(longitude))
    )
    template = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify(template), 201

@app.route('/api/location-templates/<int:template_id>', methods=['DELETE'])
def delete_template(template_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM location_templates WHERE id = %s', (template_id,))
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/process-image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400
    
    # Get metadata from form data
    latitude = float(request.form.get('latitude', 0))
    longitude = float(request.form.get('longitude', 0))
    keywords = request.form.get('keywords', '')
    description = request.form.get('description', '')
    copyright_text = request.form.get('copyright', '')
    artist = request.form.get('artist', '')
    
    # Read image
    img = Image.open(file.stream)
    
    # Prepare EXIF data
    exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}
    
    # Load existing EXIF if present
    try:
        exif_data = piexif.load(img.info.get('exif', b''))
        exif_dict.update(exif_data)
    except:
        pass
    
    # Add GPS coordinates
    lat_deg = lat_to_dms(abs(latitude))
    lng_deg = lng_to_dms(abs(longitude))
    
    exif_dict['GPS'] = {
        piexif.GPSIFD.GPSLatitudeRef: 'N' if latitude >= 0 else 'S',
        piexif.GPSIFD.GPSLatitude: lat_deg,
        piexif.GPSIFD.GPSLongitudeRef: 'E' if longitude >= 0 else 'W',
        piexif.GPSIFD.GPSLongitude: lng_deg,
    }
    
    # Add metadata
    if description:
        exif_dict['0th'][piexif.ImageIFD.ImageDescription] = description.encode('utf-8')
    if copyright_text:
        exif_dict['0th'][piexif.ImageIFD.Copyright] = copyright_text.encode('utf-8')
    if artist:
        exif_dict['0th'][piexif.ImageIFD.Artist] = artist.encode('utf-8')
    if keywords:
        exif_dict['0th'][piexif.ImageIFD.XPKeywords] = keywords.encode('utf-16le')
    
    # Encode EXIF
    exif_bytes = piexif.dump(exif_dict)
    
    # Save image with EXIF
    output = io.BytesIO()
    img.save(output, format=img.format or 'JPEG', exif=exif_bytes)
    output.seek(0)
    
    filename = file.filename or 'image.jpg'
    
    return send_file(
        output,
        mimetype='image/jpeg',
        as_attachment=True,
        download_name=f'geotagged_{secure_filename(filename)}'
    )

@app.route('/api/export-zip', methods=['POST'])
def export_zip():
    files = request.files.getlist('images')
    
    if not files:
        return jsonify({'error': 'No images provided'}), 400
    
    # Create ZIP file in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file in files:
            filename = file.filename or 'image.jpg'
            if allowed_file(filename):
                zip_file.writestr(secure_filename(filename), file.read())
    
    zip_buffer.seek(0)
    
    return send_file(
        zip_buffer,
        mimetype='application/zip',
        as_attachment=True,
        download_name=f'geotagged_images_{datetime.now().strftime("%Y%m%d_%H%M%S")}.zip'
    )

# Helper functions for GPS conversion
def lat_to_dms(lat):
    degrees = int(lat)
    minutes = int((lat - degrees) * 60)
    seconds = int((lat - degrees - minutes / 60) * 3600 * 100)
    return ((degrees, 1), (minutes, 1), (seconds, 100))

def lng_to_dms(lng):
    degrees = int(lng)
    minutes = int((lng - degrees) * 60)
    seconds = int((lng - degrees - minutes / 60) * 3600 * 100)
    return ((degrees, 1), (minutes, 1), (seconds, 100))

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
