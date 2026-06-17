# 📰 Netlify Functions - Fetch Good News

A serverless Netlify Function that fetches positive news stories from the Good News Network RSS feed, enriches them with geographical data, and provides caching for optimal performance.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup & Configuration](#setup--configuration)
- [Running the Project](#running-the-project)
- [How It Works](#how-it-works)
- [API Response Format](#api-response-format)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

---

## 🎯 Overview

This project is a **Netlify serverless function** that:
- Fetches the latest positive news stories from [Good News Network](https://www.goodnewsnetwork.org/)
- Parses RSS feed data in real-time
- Enriches each article with **geographical location data** using OpenStreetMap's Nominatim API
- Implements intelligent **10-minute caching** to reduce API calls
- Returns a clean JSON payload ready for frontend consumption

Perfect for projects like **Voice of Peace** that want to display inspiring, location-tagged good news to users.

---

## ✨ Features

✅ **Real-time RSS Parsing** - Fetches the latest stories from Good News Network  
✅ **Geolocation Enrichment** - Automatically detects and geocodes story locations  
✅ **Smart Caching** - 10-minute in-memory cache reduces external API calls  
✅ **Location Detection** - Uses heuristics + Nominatim for accurate geocoding  
✅ **Serverless Ready** - Deploy directly to Netlify without managing infrastructure  
✅ **Error Handling** - Comprehensive try-catch with meaningful error responses  
✅ **CORS Compatible** - Returns proper JSON headers for frontend integration  
✅ **Optimized Performance** - Returns only the 12 most recent stories  

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- **Netlify CLI** for local testing (optional but recommended)
- A **Netlify account** for deployment ([Free tier available](https://netlify.com))
- An internet connection (to access RSS and Nominatim APIs)

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Chatbotcreator-cmyk/netlify-functions-fetchGoodNews.js.git
cd netlify-functions-fetchGoodNews.js
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

This will install:
- **rss-parser** (^3.12.0) - Parses RSS feeds
- **node-fetch** (^2.6.7) - Makes HTTP requests to APIs

---

## ⚙️ Setup & Configuration

### Project Structure

```
netlify-functions-fetchGoodNews.js/
├── fetchGoodNews.js          # Main Netlify function
├── package.json              # Dependencies and metadata
└── README.md                 # This file
```

### Configuration Options

Inside `fetchGoodNews.js`, you can customize:

**Cache TTL (Time To Live):**
```javascript
const CACHE_TTL = 60 * 10 * 1000; // 10 minutes (in milliseconds)
```
Change this value to adjust how long results are cached.

**Number of Stories:**
```javascript
const items = (feed.items || []).slice(0, 12); // Change 12 to desired count
```

**RSS Feed URL:**
```javascript
const feedUrl = 'https://www.goodnewsnetwork.org/feed/';
```
Modify this to fetch from a different RSS source.

**User Agent (for Nominatim API):**
```javascript
'User-Agent': 'VoiceOfPeaceDemo/1.0 (+your-email@example.com)'
```
Update this with your project name and email.

---

## 🎬 Running the Project

### Option 1: Local Testing with Netlify CLI (Recommended)

1. **Install Netlify CLI** (if not already installed):
```bash
npm install -g netlify-cli
```

2. **Navigate to project directory**:
```bash
cd netlify-functions-fetchGoodNews.js
```

3. **Start the local Netlify dev server**:
```bash
netlify dev
```

4. **Access the function**:
Open your browser and visit:
```
http://localhost:8888/.netlify/functions/fetchGoodNews
```

You should see a JSON response with news articles and their locations!

### Option 2: Direct Node.js Execution (Testing)

Create a test file `test.js`:
```javascript
const handler = require('./fetchGoodNews.js').handler;

handler({}, {}).then(response => {
  console.log('Status:', response.statusCode);
  console.log('Body:', JSON.parse(response.body));
}).catch(err => {
  console.error('Error:', err);
});
```

Run it:
```bash
node test.js
```

### Option 3: Using Postman/cURL

Once deployed, test with:
```bash
curl https://your-netlify-site.netlify.app/.netlify/functions/fetchGoodNews
```

---

## 🔍 How It Works

### Workflow Diagram

```
1. Request arrives at function
         ↓
2. Check cache (10-minute TTL)
         ↓
   Cache valid? → Return cached data
         ↓
   Cache expired/empty? → Fetch fresh data
         ↓
3. Fetch RSS feed from Good News Network
         ↓
4. Parse feed items (limit to 12)
         ↓
5. For each article:
   - Extract title, summary, link, date
   - Detect country from title/summary (heuristic)
   - Geocode location using Nominatim API
   - Compile location data (lat, lng, place_name)
         ↓
6. Store result in cache
         ↓
7. Return JSON response
```

### Key Functions

**`geocode(q)`**
- Takes a location query string
- Calls OpenStreetMap's Nominatim API
- Returns latitude, longitude, and display name
- Handles errors gracefully

**`handler(event, context)`**
- Main Netlify function entry point
- Manages caching logic
- Parses RSS feed
- Enriches data with geocoding
- Returns proper HTTP response

---

## 📤 API Response Format

### Success Response (200 OK)

```json
{
  "items": [
    {
      "title": "Community Plants 1000 Trees in Urban Park",
      "summary": "A local initiative successfully planted 1,000 trees...",
      "link": "https://www.goodnewsnetwork.org/article-link",
      "date": "2025-08-10T12:30:00.000Z",
      "source": "Good News Network",
      "country": "United States",
      "lat": 40.7128,
      "lng": -74.0060,
      "place_name": "New York, NY, United States"
    },
    {
      "title": "Kenya's Wildlife Population Recovers",
      "summary": "Thanks to conservation efforts, endangered species...",
      "link": "https://www.goodnewsnetwork.org/kenya-wildlife",
      "date": "2025-08-09T15:45:00.000Z",
      "source": "Good News Network",
      "country": "Kenya",
      "lat": -1.2866,
      "lng": 36.8172,
      "place_name": "Kenya"
    }
    // ... more articles
  ],
  "fetched": "2025-08-10T14:22:30.123Z"
}
```

### Error Response (500)

```json
{
  "error": "Failed to fetch RSS feed: Network error"
}
```

---

## 🌐 Deployment

### Deploy to Netlify (Recommended)

#### Method 1: Using Netlify CLI

1. **Create a Netlify site**:
```bash
netlify init
```

2. **Connect your GitHub repository**:
```bash
netlify link --id your-site-id
```

3. **Deploy**:
```bash
netlify deploy --prod
```

#### Method 2: Using GitHub Integration

1. Push this repository to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Set build command: `npm install`
6. Set publish directory: `.` (or empty)
7. Click "Deploy"

#### Method 3: Drag & Drop

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Netlify automatically deploys it

### Configuration for Production

Create a `netlify.toml` file in the project root:

```toml
[build]
  command = "npm install"
  functions = "."

[functions]
  node_bundler = "esbuild"

[context.production.environment]
  CACHE_TTL = "600000"
```

---

## 🐛 Troubleshooting

### Issue: Function returns 404

**Solution:**
- Ensure the file is in the `netlify/functions/` directory
- Check that `netlify.toml` is configured correctly
- Restart the dev server: `netlify dev`

### Issue: "rss-parser" not found

**Solution:**
```bash
npm install rss-parser
npm install node-fetch
```

### Issue: Geolocation returns null

**Solution:**
- Nominatim API rate limits exist (~1 request/second)
- Some article titles may not contain recognizable locations
- This is expected behavior - articles still return with `lat: null, lng: null`

### Issue: Cache not working

**Solution:**
- Cache is in-memory only (resets on function restart)
- For persistent cache, integrate Redis or DynamoDB
- Check that `CACHE_TTL` is set correctly (in milliseconds)

### Issue: CORS errors from frontend

**Solution:**
Netlify functions automatically handle CORS. If issues persist, add to `fetchGoodNews.js`:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
}
```

### Issue: Slow responses

**Solution:**
- Check internet connection
- Verify Nominatim API is accessible
- Reduce the number of stories parsed
- Implement server-side Redis caching

---

## 📂 Project Structure Explained

```
netlify-functions-fetchGoodNews.js/
│
├── fetchGoodNews.js
│   └── Main Netlify serverless function
│       • Parses RSS feed from Good News Network
│       • Implements 10-minute caching
│       • Geocodes locations using Nominatim API
│       • Returns enriched JSON data
│
├── package.json
│   └── Project metadata and dependencies
│       • rss-parser: Parse RSS feeds
│       • node-fetch: Make HTTP requests
│
└── README.md
    └── Complete documentation (you are here!)
```

---

## 🔗 API Dependencies

This project relies on two external APIs:

### 1. Good News Network RSS
- **URL:** https://www.goodnewsnetwork.org/feed/
- **Rate Limit:** Reasonable (no official limit published)
- **Purpose:** Fetch positive news articles

### 2. OpenStreetMap Nominatim
- **URL:** https://nominatim.openstreetmap.org/
- **Rate Limit:** 1 request per second per IP
- **Purpose:** Geocode location names to coordinates

---

## 💡 Tips & Best Practices

✅ **Cache Effectively** - The 10-minute cache dramatically reduces API calls  
✅ **Monitor Rate Limits** - Nominatim has a 1 req/sec limit  
✅ **Test Locally** - Always use `netlify dev` before deploying  
✅ **Update User-Agent** - Use your actual project name in Nominatim requests  
✅ **Handle Edge Cases** - Not all articles have locations  
✅ **Keep Dependencies Updated** - Run `npm outdated` periodically  

---

## 📞 Support & Resources

- **Good News Network:** https://www.goodnewsnetwork.org/
- **OpenStreetMap Nominatim:** https://nominatim.org/
- **Netlify Functions Docs:** https://docs.netlify.com/functions/overview/
- **RSS Parser:** https://github.com/rbren/rss-parser
- **Node Fetch:** https://github.com/node-fetch/node-fetch

---

## 📝 License

This project is open-source and available for educational and commercial use.

---

## 🙌 Contributing

Found a bug? Have a feature idea? Feel free to:
1. Open an issue on GitHub
2. Fork the repository
3. Create a pull request

---

**Made with ❤️ for spreading good news around the world!** 🌍✨

---

*Last updated: 2026-06-17*  
*Author: Avyan - Software Expert*
