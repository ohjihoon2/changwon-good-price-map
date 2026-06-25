const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DATA_FILE = path.join(__dirname, '../public/data.json');
const KAKAO_REST_KEY = '2e5c3d2cff3c3b2dd255a28683fb7b94';

async function geocode() {
  console.log("Starting Kakao REST API geocoding...");
  let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  let updatedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const store = data[i];
    // 무조건 다시 카카오 API로 위경도 업데이트 (기존 데이터가 OSM이라 부정확함)
    let searchAddr = store.location.split('(')[0].split(',')[0].trim();
      const match = searchAddr.match(/^(.*?(?:로|길|동|읍|면|리)\s*\d+(?:-\d+)?)/);
      if (match) {
        searchAddr = match[1];
      }

      try {
        const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(searchAddr)}`, {
          headers: { 'Authorization': `KakaoAK ${KAKAO_REST_KEY}` }
        });
        const result = await response.json();

        if (result.documents && result.documents.length > 0) {
          data[i].lat = parseFloat(result.documents[0].y);
          data[i].lng = parseFloat(result.documents[0].x);
          updatedCount++;
          console.log(`[OK] ${store.name}: ${data[i].lat}, ${data[i].lng}`);
        } else {
          console.log(`[NOT FOUND] ${store.name} - ${searchAddr}`);
        }
      } catch (err) {
        console.error(`[ERROR] ${store.name}:`, err.message);
      }
      
      // Delay to avoid hitting rate limits too aggressively (though REST API allows 50/sec)
      await new Promise(r => setTimeout(r, 100));
  }

  if (updatedCount > 0) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`\nSuccessfully updated ${updatedCount} stores!`);
    
    // Git Commit & Push
    try {
      execSync('git add public/data.json', { stdio: 'inherit' });
      execSync('git commit -m "chore: auto-geocode missing stores using Kakao API"', { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('Successfully pushed to Git!');
    } catch (gitErr) {
      console.error('Git push failed:', gitErr.message);
    }
  } else {
    console.log('\nNo stores were updated. Quota might still be exceeded.');
  }
}

geocode();
