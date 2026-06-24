const fs = require('fs');
const path = require('path');

const API_URL = 'https://changwon.go.kr/tour/foodUser/getFoodExcelList.do';
const DATA_FILE_PATH = path.join(__dirname, '../public/data.json');

async function crawl() {
  try {
    const params = new URLSearchParams();
    params.append('type', 'mom'); // 'mom' is the parameter used by the site for 착한가격업소 (Good Price Stores)

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // API returns JSON object with a 'result' property containing the array
    const data = await response.json();
    
    // Convert to our format
    const result = data.result.map(item => ({
      name: item.name,
      location: item.address,
      category: item.category,
      mainMenu: item.mainMenu
    }));

    const publicDir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Successfully fetched and saved ${result.length} items to public/data.json`);

  } catch (error) {
    console.error('Crawling failed:', error);
    process.exit(1);
  }
}

crawl();
