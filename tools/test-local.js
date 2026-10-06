const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE = 'http://127.0.0.1:8780/';
const repoRoot = path.resolve(__dirname, '..');

function fetchStatus(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', (err) => {
      resolve('ERROR: ' + err.message);
    });
  });
}

async function runTests() {
  console.log('--- BẮT ĐẦU KIỂM TRA LOCAL SERVER (http://127.0.0.1:8780) ---');
  
  const htmlFiles = fs.readdirSync(repoRoot).filter(f => f.endsWith('.html'));
  console.log(`Tìm thấy ${htmlFiles.length} file HTML.`);

  let totalErrors = 0;
  let totalWarnings = 0;

  // 1. Kiểm tra HTTP Status của từng trang
  console.log('\n[1] Kiểm tra HTTP Status các trang HTML:');
  for (const file of htmlFiles) {
    const status = await fetchStatus(BASE + file);
    if (status === 200) {
      console.log(`  [PASS] ${file} -> HTTP ${status}`);
    } else {
      console.error(`  [FAIL] ${file} -> HTTP ${status}`);
      totalErrors++;
    }
  }

  // 2. Quét tất cả asset (ảnh, script, css) và liên kết nội bộ trong từng file HTML
  console.log('\n[2] Kiểm tra đường dẫn ảnh và tài nguyên trong các file HTML:');
  const assetRegex = /\b(?:src|href|srcset|data-full-jpg|data-full-webp)=["']([^"']+)["']/g;

  for (const file of htmlFiles) {
    let content = fs.readFileSync(path.join(repoRoot, file), 'utf-8');
    // Bỏ qua nội dung trong HTML comments <!-- ... -->
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    const assetRegex = /(?:(?<![-a-zA-Z0-9])(?:src|href|srcset|data-full-jpg|data-full-webp))\s*=\s*["']([^"']+)["']/g;
    const fileAssets = [];
    let match;

    while ((match = assetRegex.exec(content)) !== null) {
      const val = match[1];
      // Bỏ qua external links, tel, mailto, anchor chỉ có #, data:
      if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('tel:') || 
          val.startsWith('mailto:') || val.startsWith('zalo:') || val.startsWith('#') || 
          val.startsWith('data:') || val.startsWith('javascript:')) {
        continue;
      }
      fileAssets.push({ val, matchStr: match[0], index: match.index });
    }

    let fileHasError = false;
    for (const item of fileAssets) {
      const rawAsset = item.val;
      // Tách phần query string nếu có ví dụ style.css?v=...
      const cleanAsset = rawAsset.split('?')[0].split('#')[0];
      if (!cleanAsset) continue;

      const assetPath = path.join(repoRoot, cleanAsset);
      if (!fs.existsSync(assetPath)) {
        const lineNo = content.substring(0, item.index).split('\n').length;
        console.error(`  [FAIL] Trong ${file}:${lineNo}: Không tìm thấy file "${rawAsset}" (khớp: "${item.matchStr}")`);
        totalErrors++;
        fileHasError = true;
      }
    }

    if (!fileHasError) {
      // console.log(`  [PASS] ${file}: Tất cả assets hợp lệ.`);
    }
  }

  // 3. Kiểm tra các liên kết giữa các trang sản phẩm
  console.log('\n[3] Kiểm tra liên kết trang sản phẩm trong menu và footer:');
  const hrefRegex = /href=["']([^"'#?]+(?:\.html))["']/g;
  for (const file of htmlFiles) {
    const content = fs.readFileSync(path.join(repoRoot, file), 'utf-8');
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
      const target = match[1];
      if (target.startsWith('http://') || target.startsWith('https://')) {
        continue;
      }
      if (!fs.existsSync(path.join(repoRoot, target))) {
        console.error(`  [FAIL] Trong ${file}: Liên kết trỏ tới "${target}" không tồn tại!`);
        totalErrors++;
      }
    }
  }

  console.log('\n--- KẾT QUẢ TỔNG HỢP ---');
  if (totalErrors === 0) {
    console.log('✅ TẤT CẢ CÁC KIỂM TRA ĐỀU THÀNH CÔNG (0 LỖI)!');
  } else {
    console.log(`❌ CÓ ${totalErrors} LỖI CẦN XỬ LÝ.`);
  }
}

runTests();
