// Netlify function: netlify/functions/fetchGoodNews.js
const Parser = require('rss-parser');
const fetch = require('node-fetch'); // if using Vercel with Node 18+ you can use global fetch
const parser = new Parser();

// simple in-memory cache
let cache = { ts:0, data:null };
const CACHE_TTL = 60 * 10 * 1000; // cache 10 minutes

// helper: Nominatim geocode (limit 1)
async function geocode(q){
  if(!q) return null;
  const url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(q) + '&limit=1&accept-language=en';
  try{
    const r = await fetch(url, { headers: { 'User-Agent': 'VoiceOfPeaceDemo/1.0 (+your-email@example.com)' } });
    if(!r.ok) return null;
    const arr = await r.json();
    if(arr && arr.length>0) return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon), display_name: arr[0].display_name };
  }catch(e){
    console.warn('geocode fail', e);
  }
  return null;
}

exports.handler = async function(event, context){
  try{
    // use cache
    if(cache.data && (Date.now() - cache.ts) < CACHE_TTL){
      return { statusCode:200, body: JSON.stringify(cache.data) };
    }

    // parse RSS
    const feedUrl = 'https://www.goodnewsnetwork.org/feed/';
    const feed = await parser.parseURL(feedUrl);

    // create items (limit 12)
    const items = (feed.items || []).slice(0,12);
    const results = [];
    for(const it of items){
      const title = it.title || '';
      const summary = (it.contentSnippet || it.content || it.description || '').replace(/<\/?[^>]+(>|$)/g, '').trim();
      const link = it.link || '';
      const date = it.pubDate || it.isoDate || new Date().toISOString();
      const source = feed.title || 'GoodNewsNetwork';

      // Try simple country detection (check for a country name in title)
      // fallback: ask Nominatim to geocode with title (may or may not find a location)
      let lat = null, lng = null, country = null, place_name = null;

      // heuristic: common country names — small list to speed detection
      const countries = ['Spain','United Kingdom','India','Kenya','Brazil','Japan','United States','USA','Mexico','Canada','Australia','Nigeria','France','Germany','Italy','Chile','Peru','Colombia'];
      for(const c of countries){
        if(title.toLowerCase().includes(c.toLowerCase()) || summary.toLowerCase().includes(c.toLowerCase())){
          const geo = await geocode(c);
          if(geo){ lat = geo.lat; lng = geo.lng; country = c; place_name = geo.display_name; }
          break;
        }
      }

      // if not detected, try geocoding the title (may return a place or organization)
      if(!lat){
        const geo = await geocode(title);
        if(geo){ lat = geo.lat; lng = geo.lng; place_name = geo.display_name; }
      }

      // final fallback: try summary short phrase
      if(!lat && summary && summary.length<300){
        const geo = await geocode(summary.slice(0,200));
        if(geo){ lat = geo.lat; lng = geo.lng; place_name = geo.display_name; }
      }

      results.push({
        title, summary: summary.slice(0,800), link, date, source, country, lat, lng, place_name
      });
    }

    const payload = { items: results, fetched: new Date().toISOString() };

    // cache
    cache = { ts: Date.now(), data: payload };

    return {
      statusCode: 200,
      headers: { 'Content-Type':'application/json', 'Cache-Control': 'max-age=0, s-maxage=600' },
      body: JSON.stringify(payload)
    };
  }catch(err){
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
