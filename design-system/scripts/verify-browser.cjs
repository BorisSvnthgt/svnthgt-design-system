const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.SVNTHGT_PLAYWRIGHT || 'C:/Users/boris/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.SVNTHGT_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  const report={combinations:[],interactions:[],runtimeErrors:errors};
  const tokens=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../tokens/resolved.json'),'utf8'));
  const out=path.resolve(__dirname,'../previews');fs.mkdirSync(out,{recursive:true});
  try {
    await page.goto(process.env.SVNTHGT_PREVIEW || 'http://127.0.0.1:5178/',{waitUntil:'networkidle'});
    if(errors.length) throw new Error(errors.join('\n'));
    await page.getByRole('heading',{name:'Many interests. One identity.'}).waitFor();
    await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.evaluate(()=>document.fonts.check('700 32px "Sora Variable"')&&document.fonts.check('400 16px "Inter Variable"')&&document.fonts.check('700 16px "Inter Variable"')));
    assert.match(await page.locator('.hero h1').evaluate(el=>getComputedStyle(el).fontFamily),/Sora/);
    assert.match(await page.locator('.hero-copy').evaluate(el=>getComputedStyle(el).fontFamily),/Inter/);
    report.interactions.push('Local Sora 700 and Inter 400/700 loaded');
    for(const brand of ['Gaming','Captures','Tech','Miniatures','Design']) for(const mode of ['Light','Dark']) {
      await page.getByRole('group',{name:'Brand theme'}).getByRole('button',{name:brand,exact:true}).click();
      await page.getByRole('group',{name:'Color mode'}).getByRole('button',{name:mode,exact:true}).click();
      await page.locator('.hero-art img').evaluate(img=>img.decode());
      await page.locator('.logo-stage img').evaluate(img=>img.decode());
      const expected=tokens.semantic[brand.toLowerCase()][mode.toLowerCase()].logo;
      const logoStop=Object.entries(tokens.brandPalettes[brand.toLowerCase()]).find(([,hex])=>hex.toLowerCase()===expected.toLowerCase())?.[0];
      const marker=page.locator('.swatches .seed-label');
      if(logoStop) {
        assert.equal(await marker.count(),1);
        assert.equal(await marker.textContent(),'Logo');
        assert.equal(await marker.locator('..').textContent(),logoStop+'Logo');
      } else assert.equal(await marker.count(),0);
      assert.equal(await page.locator('nav a[aria-current]').evaluate(el=>getComputedStyle(el).boxShadow),'none');
      if(brand!=='Design') {
        const seed=tokens.brandPalettes[brand.toLowerCase()]['500'];
        await page.getByRole('button',{name:`Copy shade 500, ${seed}`,exact:true}).waitFor();
      }
      const info=await page.evaluate(({brand,mode,expected})=>{
        const button=[...document.querySelectorAll('button')].find(b=>b.textContent==='Explore work');
        const style=getComputedStyle(button),body=getComputedStyle(document.body),img=document.querySelector('.logo-stage img');
        const mark=document.querySelector('.hero-art img'),canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d');ctx.drawImage(mark,0,0,128,128);const pixels=ctx.getImageData(0,0,128,128).data;
        const hex=expected;
        const rgb=hex.slice(1).match(/.{2}/g).map(v=>parseInt(v,16));let matches=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]===rgb[0]&&pixels[i+1]===rgb[1]&&pixels[i+2]===rgb[2]&&pixels[i+3]===255)matches++;
        return {theme:document.documentElement.dataset.astryxTheme,mode:document.documentElement.dataset.theme,bg:body.backgroundColor,text:body.color,button:{bg:style.backgroundColor,color:style.color,radius:style.borderRadius,height:style.height},logo:img.complete&&img.naturalWidth>0,logoRect:{x:img.getBoundingClientRect().x,y:img.getBoundingClientRect().y+scrollY,width:img.width,height:img.height},navRadius:getComputedStyle(document.querySelector('.brand-picker button')).borderRadius,overflow:document.documentElement.scrollWidth>innerWidth,logoTransform:getComputedStyle(document.querySelector('.hero-art')).transform,heroSurface:getComputedStyle(mark.parentElement).backgroundColor,logoSurface:getComputedStyle(img.parentElement).backgroundColor,expectedLogoPixels:matches};
      },{brand,mode,expected});
      assert.equal(info.theme,`svnthgt-${brand.toLowerCase()}`);assert.equal(info.mode,mode.toLowerCase());assert.ok(info.logo,`${brand} logo missing`);assert.ok(!info.overflow);assert.equal(info.button.height,'44px');assert.equal(info.button.radius,'8px');assert.equal(info.navRadius,'9998px');
      if(report.combinations.length) assert.deepEqual(info.logoRect,report.combinations[0].logoRect,'Logo position and scale must remain identical across brands and modes');
      report.combinations.push({brand,mode,...info});
      assert.equal(info.logoTransform,'none');assert.equal(info.heroSurface,'rgba(0, 0, 0, 0)');assert.equal(info.logoSurface,'rgba(0, 0, 0, 0)');assert.ok(info.expectedLogoPixels>100,'Correct theme-specific artwork color must render');
    }
    await page.getByRole('group',{name:'Brand theme'}).getByRole('button',{name:'Gaming',exact:true}).click();
    await page.getByRole('button',{name:'Light',exact:true}).click();
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:path.join(out,'overview-light.png')});
    await page.screenshot({path:path.join(out,'desktop-light.png'),fullPage:true});
    await page.getByRole('button',{name:'Dark',exact:true}).click();
    await page.screenshot({path:path.join(out,'overview-dark.png')});
    await page.screenshot({path:path.join(out,'desktop-dark.png'),fullPage:true});
    for(const mode of ['Light','Dark']) {
      await page.getByRole('button',{name:mode,exact:true}).click();
      const field=page.getByRole('textbox',{name:'Project name'});
      await field.focus();
      const focus=await field.evaluate(el=>{
        const wrapper=el.closest('.astryx-text-input');
        const style=getComputedStyle(wrapper);
        const probe=document.createElement('span');probe.style.color='var(--color-accent)';wrapper.append(probe);
        const accent=getComputedStyle(probe).color;probe.remove();
        return {outline:getComputedStyle(el).outlineStyle,border:style.borderColor,shadow:style.boxShadow,accent};
      });
      assert.equal(focus.outline,'none','The inner field must not get a second outline');
      assert.equal(focus.border,focus.accent,'Astryx must own the focus-within accent border');
      assert.ok(focus.shadow.includes('inset'),'Astryx inset focus state must render');
    }
    report.interactions.push('Native Astryx field focus border and inset ring; no added inner outline','8px action corners and preserved rounded navigation','Full logos share an identical rendered position and scale');
    await page.getByRole('textbox',{name:'Project name'}).fill('A curious project');
    assert.equal(await page.getByRole('textbox',{name:'Project name'}).inputValue(),'A curious project');
    await page.getByRole('button',{name:'Open dialog',exact:true}).click();
    const dialog=page.getByRole('dialog');await dialog.waitFor();
    assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)));
    await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
    assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'Open dialog');
    report.interactions.push('Text entry','Dialog autofocus, Escape dismissal, focus return');
    const checkbox=page.getByRole('checkbox',{name:'Include in selected work'});await checkbox.uncheck();assert.equal(await checkbox.isChecked(),false);
    report.interactions.push('Checkbox toggles');
    await page.getByRole('button',{name:'System',exact:true}).click();
    await page.emulateMedia({colorScheme:'light'});
    await page.waitForFunction(()=>getComputedStyle(document.body).backgroundColor==='rgb(250, 250, 250)');
    await page.emulateMedia({colorScheme:'dark'});
    await page.waitForFunction(()=>getComputedStyle(document.body).backgroundColor==='rgb(20, 20, 20)');
    report.interactions.push('System mode follows OS changes');
    for(const width of [1440,390,320]) {
      await page.setViewportSize({width,height:844});
      await page.evaluate(()=>scrollTo(0,0));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}px`);
      await page.screenshot({path:path.join(out,`mobile-${width}.png`),fullPage:true});
      await page.evaluate(()=>scrollTo(0,2200));
      assert.ok(await page.locator('.sticky-controls').evaluate(el=>Math.abs(el.getBoundingClientRect().top)<1),`sticky controls at ${width}px`);
      await page.getByRole('group',{name:'Brand theme'}).getByRole('button',{name:'Design',exact:true}).click();
      await page.getByRole('button',{name:'Light',exact:true}).click();
      assert.ok(await page.evaluate(()=>scrollY>1000),'Changing themes must retain scroll position');
      await page.screenshot({path:path.join(out,`sticky-${width}.png`)});
      await page.getByRole('link',{name:'Typography',exact:true}).click();
      assert.ok(await page.locator('#typography').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('.sticky-controls').getBoundingClientRect().bottom),'Anchor must clear sticky controls');
    }
    report.interactions.push('No horizontal page overflow at 1440, 390 and 320px');
    report.interactions.push('Upright logos; exact brand color at 500 in both modes; Design neutral 900/soft white by mode; transparent logo surfaces','Sticky identity/mode controls, scroll preserved, section anchors clear controls at all widths');
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({passed:true,combinations:report.combinations.length,interactions:report.interactions,runtimeErrors:errors}));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
