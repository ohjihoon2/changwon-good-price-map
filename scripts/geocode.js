const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../public/data.json');
const KAKAO_REST_KEY = '2e5c3d2cff3c3b2dd255a28683fb7b94';

async function geocode() {
  console.log("Starting accurate geocoding...");
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  let updated = 0;

  for (let i = 0; i < data.length; i++) {
    const store = data[i];
    
    // Always clear existing lat/lng to force a full refresh
    delete store.lat;
    delete store.lng;

    // Clean address rigorously
    // Example: "창원시 진해구 용원동로 262 (용원동)" -> "창원시 진해구 용원동로 262"
    // Example: "창원시 마산회원구 내서읍 경남대로 935 아로마빌딩 104호 베이커리다솜"
    let addr = store.location.split('(')[0].split(',')[0].trim();
    
    // If address contains building name after road number, regex it out
    // Match up to the road number (e.g., "로 123", "길 12-3")
    const match = addr.match(/^(.*?(?:로|길|동|읍|면|리)\s*\d+(?:-\d+)?)/);
    if (match) {
      addr = match[1];
    }

    try {
      const res = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(addr)}`, {
        headers: { 'Authorization': `KakaoAK ${KAKAO_REST_KEY}` }
      });
      const result = await res.json();
      
      if (result.documents && result.documents.length > 0) {
        // Ensure the result is actually in Changwon/Gyeongnam to avoid Seoul/Busan mismatch
        const address = result.documents[0].address || result.documents[0].road_address;
        if (address && (address.region_1depth_name.includes('경남') || address.region_1depth_name.includes('경상남도') || address.region_2depth_name.includes('창원'))) {
          store.lat = parseFloat(result.documents[0].y);
          store.lng = parseFloat(result.documents[0].x);
          updated++;
        } else {
          console.log(`Region mismatch for ${store.name}: ${addr} -> found in ${address?.region_1depth_name}`);
        }
      } else {
        console.log(`No result for ${store.name}: ${addr}`);
      }
    } catch (e) {
      console.error(`Error fetching ${addr}:`, e);
    }
    
    // Sleep to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Successfully geocoded ${updated} out of ${data.length} stores.`);
}

geocode();
