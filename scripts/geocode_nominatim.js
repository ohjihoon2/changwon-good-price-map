const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../public/data.json');

async function geocode() {
  console.log("Starting OpenStreetMap (Nominatim) geocoding...");
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
    
    // Skip if already has coordinates
    if (store.lat && store.lng) continue;

    // Clean address rigorously
    let addr = store.location.split('(')[0].split(',')[0].trim();
    const match = addr.match(/^(.*?(?:로|길|동|읍|면|리)\s*\d+(?:-\d+)?)/);
    if (match) {
      addr = match[1];
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addr)}&format=json`, {
        headers: { 'User-Agent': 'changwon-map-fix/1.0' }
      });
      const result = await res.json();
      
      if (result && result.length > 0) {
        store.lat = parseFloat(result[0].lat);
        store.lng = parseFloat(result[0].lon);
        updated++;
        console.log(`[Success] ${store.name}: ${addr}`);
        
        // Save incrementally so user can see progress
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
      } else {
        console.log(`[No result] ${store.name}: ${addr}`);
      }
    } catch (e) {
      console.error(`Error fetching ${addr}:`, e.message);
    }
    
    // Strict 1.5 second delay for Nominatim policy
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`Successfully geocoded ${updated} out of ${data.length} stores.`);
}

geocode();
