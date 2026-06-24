const fs = require('fs');

async function test() {
  const res = await fetch('https://changwon.go.kr/tour/index.do?menuCode=001_004004007000', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  fs.writeFileSync('page.html', html, 'utf-8');
}
test();
