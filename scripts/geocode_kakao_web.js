const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../public/data.json');

async function geocode() {
  console.log("Starting Kakao Web Search geocoding...");
  let data;
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch(e) {
    console.error("Failed to read data.json");
    return;
  }
  
  let updated = 0;

  for (let i = 0; i < data.length; i++) {
    const store = data[i];
    
    // Clean address rigorously
    let addr = store.location.split('(')[0].split(',')[0].trim();
    const match = addr.match(/^(.*?(?:로|길|동|읍|면|리)\s*\d+(?:-\d+)?)/);
    if (match) {
      addr = match[1];
    }

    try {
      const res = await fetch(`https://search.map.kakao.com/mapsearch/map.daum?callback=jQuery&q=${encodeURIComponent(addr)}&msFlag=A&sort=0`, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://map.kakao.com/'
        }
      });
      const text = await res.text();
      
      // text is like: jQuery({...})
      // Extract the JSON part
      const jsonStrMatch = text.match(/jQuery\((.*)\);?$/);
      if (jsonStrMatch) {
        const result = JSON.parse(jsonStrMatch[1]);
        if (result.place && result.place.length > 0) {
          // Kakao map search returns lat and lon (sometimes as x and y depending on the API version, but this endpoint returns lat and lon explicitly)
          store.lat = parseFloat(result.place[0].lat);
          store.lng = parseFloat(result.place[0].lon);
          updated++;
          console.log(`[Success] ${store.name}: ${addr} -> ${store.lat}, ${store.lng}`);
        } else {
          console.log(`[No result] ${store.name}: ${addr}`);
          delete store.lat;
          delete store.lng;
        }
      }
    } catch (e) {
      console.error(`Error fetching ${addr}:`, e.message);
    }
    
    // Polite delay for Kakao web search
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Final save
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Successfully geocoded ${updated} out of ${data.length} stores using Kakao Map Web API.`);
}

geocode();
