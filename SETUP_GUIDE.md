# 🚀 GeoTag Pro Setup Guide

## আপনার Python Flask Application চালু করুন

আপনার **GeoTag Pro** application সম্পূর্ণভাবে তৈরি হয়েছে সব advanced features সহ! এখন এটা চালু করতে নিচের steps follow করুন:

---

## ⚠️ গুরুত্বপূর্ণ: Workflow Configuration

বর্তমানে **Node.js server** চলছে port 5000 এ, কিন্তু আপনার **Python Flask app** দরকার। 

### Option 1: Replit Shell এ চালান (সবচেয়ে সহজ)

1. **Shell খুলুন** (Replit এর নিচে Shell tab)
2. নিচের command চালান:
```bash
python app.py
```

3. Browser এ visit করুন: **http://localhost:5000**

✅ এটাই সবচেয়ে সহজ এবং দ্রুত পদ্ধতি!

---

### Option 2: Workflow Update করুন (স্থায়ী সমাধান)

যদি আপনি চান application automatic start হোক:

1. Replit এ **"Start application"** workflow এ যান
2. Workflow command পরিবর্তন করুন:
   - **পুরানো:** `npm run dev`
   - **নতুন:** `python app.py`

অথবা `.replit` file edit করুন:
```toml
run = "python app.py"
```

তারপর workflow restart করুন।

---

## 📦 Dependencies চেক করুন

সব Python packages ইতিমধ্যে install করা আছে:

```txt
flask==3.1.2
flask-cors
pillow
piexif
psycopg2-binary
python-dotenv
werkzeug
```

যদি কোনো package missing থাকে:
```bash
pip install -r requirements.txt
```

---

## 🗄️ Database Setup

✅ **PostgreSQL database ইতিমধ্যে configured!**

Environment variables automatic set করা আছে:
- `DATABASE_URL` ✅
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` ✅

Database table automatic create হবে first run এ।

---

## 🤖 AI Features Setup (Optional)

AI features use করতে চাইলে:

### 1. Google Gemini API Key নিন:
- Visit: https://makersuite.google.com/app/apikey
- **Sign in** with Google account
- Click **"Create API Key"**
- Copy your API key

### 2. Application এ Setup করুন:
দুইটা উপায়:

#### উপায় A: UI থেকে (সহজ)
1. Application open করুন
2. **"🤖 Setup AI Features"** button click করুন
3. API key paste করুন

#### উপায় B: Environment Variable (secure)
```bash
export GEMINI_API_KEY="your-api-key-here"
```

তারপর `app.py` তে AI route update করুন API key environment variable থেকে নিতে।

---

## 🎯 সব Features Test করুন

Application চালু হলে এই features গুলো test করুন:

### ✅ Basic Features:
1. **Upload images** - Drag & drop করুন
2. **Click on map** - Location set করুন
3. **Add metadata** - Keywords, description লিখুন
4. **Process & Download** - একটা image process করুন
5. **Dark mode toggle** - Theme switch করুন

### ✅ Advanced Features:
6. **Image preview** - Gallery তে image click করুন
7. **Rotate image** - Preview modal এ rotation buttons
8. **Keyboard shortcuts** - `?` press করুন help দেখতে
9. **Language switch** - Header এ language button (EN ↔ বাং)
10. **Location history** - Location search করুন, history save হবে

### ✅ AI Features (API key লাগবে):
11. **AI location detection** - Select image → "🌍 Detect Location"
12. **Smart keywords** - "🏷️ Generate Smart Keywords"
13. **Auto description** - "📝 Auto-Generate Description"

### ✅ GPX Features:
14. **Import GPX** - "📂 Import GPX File" click করুন
15. **Match to track** - Images automatic match হবে

---

## 📂 সম্পূর্ণ File Structure

```
GeoTag Pro/
├── app.py                      ← Flask backend (MAIN)
├── templates/
│   └── index.html              ← HTML interface
├── static/
│   ├── css/
│   │   └── style.css           ← Styling + Dark mode
│   └── js/
│       ├── app.js              ← Core logic
│       ├── features.js         ← Preview, rotation, shortcuts
│       ├── i18n.js             ← Bengali/English support
│       ├── ai-features.js      ← AI integration
│       └── gpx-import.js       ← GPX track import
├── requirements.txt            ← Python packages
├── README_FEATURES.md          ← সব features এর list
└── SETUP_GUIDE.md              ← এই file
```

---

## 🔥 Quick Start (1 Minute)

```bash
# 1. Shell open করুন
# 2. এই command run করুন:
python app.py

# 3. Browser এ যান:
# http://localhost:5000

# 4. Enjoy! 🎉
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Port 5000 already in use"
**সমাধান:** Node.js server বন্ধ করুন
```bash
pkill -f "npm run dev"
pkill -f node
# তারপর আবার চালান:
python app.py
```

### Issue 2: "No module named 'flask'"
**সমাধান:** Dependencies install করুন
```bash
pip install -r requirements.txt
```

### Issue 3: AI features কাজ করছে না
**সমাধান:** 
- API key দিয়েছেন কি?
- Internet connection আছে?
- Browser console check করুন errors এর জন্য

### Issue 4: Database error
**সমাধান:** Database URL check করুন
```bash
echo $DATABASE_URL
```

---

## 🎨 Customization

### Colors পরিবর্তন করুন:
`static/css/style.css` এ `:root` section edit করুন:
```css
:root {
    --primary: #2563eb;    /* আপনার পছন্দের color */
    --success: #10b981;
    --danger: #ef4444;
}
```

### Language যোগ করুন:
`static/js/i18n.js` এ নতুন language object যোগ করুন:
```javascript
const translations = {
    en: { /* English */ },
    bn: { /* Bengali */ },
    hi: { /* Hindi - নতুন */ }
};
```

---

## 📊 Performance Tips

1. **Image size:** বড় images upload করার আগে resize করুন (recommended: < 10MB)
2. **Batch processing:** একবারে 50+ images process না করাই ভালো
3. **AI calls:** AI features expensive, শুধু প্রয়োজন হলে use করুন
4. **Browser cache:** Regular basis এ browser cache clear করুন

---

## 🚀 Production Deployment

যদি এটা production এ deploy করতে চান:

### Replit Deployment:
1. **"Deploy"** button click করুন Replit এ
2. Application automatic deploy হবে
3. Public URL পাবেন

### Custom Server:
```bash
# Gunicorn install করুন
pip install gunicorn

# Production mode এ চালান
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Environment Variables (Production):
```bash
DATABASE_URL=postgresql://...
GEMINI_API_KEY=your-key-here
FLASK_ENV=production
SECRET_KEY=your-secret-key
```

---

## 📞 Need Help?

যদি কোনো সমস্যা হয় অথবা আরো features চান, আমাকে জানান!

---

## ✨ আপনার কাছে এখন আছে:

- ✅ **23+ Advanced Features**
- ✅ **AI-Powered Geotagging**
- ✅ **GPX Track Support**
- ✅ **Bengali Language**
- ✅ **Dark Mode**
- ✅ **Keyboard Shortcuts**
- ✅ **And much more!**

---

## 🎉 Congratulations!

আপনার **GeoTag Pro** application সম্পূর্ণভাবে ready এবং https://tool.geoimgr.com/ থেকে **10+ extra features** সহ!

**এখন চালান:**
```bash
python app.py
```

**Enjoy your advanced photo geotagging application!** 🚀📸🌍

---

**© 2024 GeoTag Pro - Made with ❤️ in Python Flask**
