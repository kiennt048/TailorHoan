/* Front-end verification harness — run before every delivery.
 *
 * This is a dev tool, not a site dependency; tools/ is excluded from the
 * deploy by .assetsignore, so the site stays dependency-free.
 *
 *   python3 -m http.server 8780 &      # from the repo root
 *   npm i playwright-core
 *   node tools/verify-fe.js
 *
 * Checks both locales: JS/console errors, 4xx, every image loading and
 * served as WebP, intrinsic dimensions, version-busted stylesheet actually
 * applying, section/card/badge counts, all five filters, horizontal overflow
 * at 1440/768/360, skip link, mobile drawer (open, reachable close, Escape),
 * 24px targets, the quote form refusing to fake success, and full content
 * visibility with JavaScript disabled.
 */
const { chromium } = require('playwright-core');
const B=process.env.BASE || "http://127.0.0.1:8780/";
let FAIL=0;
const ok=(c,m)=>{ if(!c) FAIL++; console.log((c?'  PASS  ':'  FAIL  ')+m); };
(async()=>{
const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});

for (const f of ['index.html','en.html']) {
  console.log('\n===== '+f+' =====');
  const ctx=await br.newContext({viewport:{width:1440,height:900}});
  const p=await ctx.newPage();
  const errs=[], http=[];
  p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});
  p.on('response',r=>{if(r.status()>=400)http.push(r.status()+' '+r.url().split('/').pop());});
  await p.goto(B+f,{waitUntil:'networkidle'});
  await p.evaluate(async()=>{[...document.images].forEach(i=>i.loading='eager');
    for(let y=0;y<document.body.scrollHeight;y+=250){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,25));}
    window.scrollTo(0,0);});
  await p.waitForTimeout(1200);

  // keyboard — must run before any click, otherwise focus has already moved
  { const kp = await ctx.newPage(); await kp.goto(B+f,{waitUntil:'networkidle'}); await kp.waitForTimeout(300);
    await kp.keyboard.press('Tab');
    ok(await kp.evaluate(()=>document.activeElement.classList.contains('skip-link')),'skip link is first tab stop');
    await kp.waitForTimeout(400);
    ok(await kp.evaluate(()=>document.activeElement.getBoundingClientRect().top>=0),'skip link becomes visible when focused');
    await kp.close(); }

  ok(errs.length===0,'no JS/console errors '+(errs.length?JSON.stringify(errs.slice(0,3)):''));
  ok(http.length===0,'no 4xx/5xx '+(http.length?JSON.stringify(http.slice(0,4)):''));

  const im=await p.evaluate(()=>({t:document.images.length,
    broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src.split('/').pop()),
    webp:[...document.images].filter(i=>i.currentSrc.endsWith('.webp')).length,
    nodim:[...document.images].filter(i=>!i.getAttribute('width')||!i.getAttribute('height')).length,
    failed:document.querySelectorAll('.media.img-failed').length}));
  ok(im.broken.length===0,`images ${im.t}, 0 broken `+JSON.stringify(im.broken));
  ok(im.webp===im.t,`all ${im.t} served as WebP (${im.webp})`);
  ok(im.nodim===0,'every image has width/height');
  ok(im.failed===0,'no fallback tiles');

  // cache-busted assets actually resolve
  const cssv=await p.evaluate(()=>document.querySelector('link[rel=stylesheet]').getAttribute('href'));
  ok(/\?v=\d{8}$/.test(cssv),'stylesheet is version-busted: '+cssv);
  ok(await p.evaluate(()=>getComputedStyle(document.body).fontFamily.includes('Be Vietnam Pro')),'stylesheet applied');

  ok(await p.evaluate(()=>!document.querySelector('.owner-figure figcaption')),'owner caption removed');
  ok(await p.evaluate(()=>document.querySelectorAll('.workshop-item').length===4),'4 workshop tiles');
  ok(await p.evaluate(()=>document.querySelectorAll('.badge-illus').length===4),'4 illustration badges');
  ok(await p.evaluate(()=>document.querySelectorAll('.product-card').length===14),'14 product cards');

  // filters
  let fres=[];
  for (const c of ['medical','office','education','hospitality','all']) {
    await p.click(`[data-filter="${c}"]`); await p.waitForTimeout(200);
    fres.push(c+'='+await p.evaluate(()=>[...document.querySelectorAll('.product-card')].filter(x=>!x.hidden).length));
  }
  ok(fres.join(' ')==='medical=6 office=4 education=2 hospitality=2 all=14','filters '+fres.join(' '));

  // overflow at three widths
  for (const w of [1440,768,360]) {
    await p.setViewportSize({width:w,height:900}); await p.waitForTimeout(250);
    const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    ok(o===0,`no horizontal overflow @${w}px (${o})`);
  }
  await p.setViewportSize({width:1440,height:900});

  await p.setViewportSize({width:390,height:844}); await p.waitForTimeout(300);
  await p.click('#navToggle'); await p.waitForTimeout(400);
  ok(await p.evaluate(()=>document.querySelector('#navToggle').getAttribute('aria-expanded')==='true'),'drawer opens, aria-expanded true');
  ok(await p.evaluate(()=>{const t=document.querySelector('#navToggle').getBoundingClientRect();
      const e=document.elementFromPoint(t.x+t.width/2,t.y+t.height/2); return document.querySelector('#navToggle').contains(e);}),
     'close button reachable while drawer open');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok(await p.evaluate(()=>document.querySelector('#navToggle').getAttribute('aria-expanded')==='false'),'Escape closes drawer');
  await p.setViewportSize({width:1440,height:900});

  // targets
  const small=await p.evaluate(()=>[...document.querySelectorAll('a,button,select,textarea,input:not(.sr-only)')]
    .filter(e=>e.offsetParent!==null).filter(e=>e.getBoundingClientRect().height<24).length);
  ok(small===0,`no interactive target under 24px (${small})`);

  // form refuses to fake success while unconfigured
  await p.fill('#name','Test'); await p.fill('#phone','0900000000'); await p.selectOption('#service','doctor');
  await p.click('button[type=submit]'); await p.waitForTimeout(600);
  ok(await p.evaluate(()=>document.querySelector('#formSuccess').hidden && !document.querySelector('#formError').hidden),
     'unconfigured form shows error, never fake success');
  await ctx.close();
}

// no-JS resilience
const c2=await br.newContext({viewport:{width:1440,height:900}, javaScriptEnabled:false});
const p2=await c2.newPage(); await p2.goto(B+'index.html',{waitUntil:'domcontentloaded'}); await p2.waitForTimeout(500);
const hid=await p2.evaluate(()=>[...document.querySelectorAll('.reveal')].filter(e=>getComputedStyle(e).opacity==='0').length);
ok(hid===0,`all content visible with JS disabled (${hid} hidden)`);
await br.close();
console.log('\n'+(FAIL===0?'ALL FRONT-END CHECKS PASSED':FAIL+' CHECK(S) FAILED'));
process.exit(FAIL?1:0);
})();
