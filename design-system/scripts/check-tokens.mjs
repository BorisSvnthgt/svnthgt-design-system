import fs from 'node:fs';
import assert from 'node:assert/strict';
import {contrast, luminance} from './color.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../tokens/resolved.json',import.meta.url),'utf8'));
const manifest=JSON.parse(fs.readFileSync(new URL('../../identities/asset-manifest.json',import.meta.url),'utf8'));
const results=[];
function check(brand,mode,name,fg,bg,minimum=4.5) {
  const ratio=contrast(fg,bg);
  results.push({brand,mode,name,foreground:fg,background:bg,ratio:Number(ratio.toFixed(2)),minimum});
  assert.ok(ratio>=minimum,`${brand}/${mode}/${name}: ${ratio.toFixed(2)} < ${minimum}`);
}
for (const brand of data.brands) {
  assert.equal(brand.color,manifest.identities.find(b=>b.id===brand.id).color);
  const scale=data.brandPalettes[brand.id];
  assert.deepEqual(Object.keys(scale),['50','100','200','300','400','500','600','700','800','900','950']);
  if(brand.id!=='design') assert.equal(scale['500'].toUpperCase(),brand.color.toUpperCase(),'500 must preserve the exact identity color');
  const colors=Object.values(scale);
  for(let i=1;i<colors.length;i++) assert.ok(luminance(colors[i-1])>luminance(colors[i]),`${brand.id} scale must darken consistently`);
  assert.deepEqual(data.palettes[brand.id].light,data.palettes[brand.id].dark,'Brand primitives must remain fixed across modes');
  for (const mode of ['light','dark']) {
    const s=data.semantic[brand.id][mode];
    const logoStop=data.identity.lightLogoStops[brand.id];
    assert.equal(s.logo,mode==='light'&&logoStop?scale[logoStop]:brand.color);
    check(brand.id,mode,'sidebar selected text',s.navSelectedText,s.navSelected);

    for (const bg of ['body','surface','muted','raised']) {
      for (const role of ['text','secondary','accent']) check(brand.id,mode,`${role}/${bg}`,s[role],s[bg]);
      check(brand.id,mode,`control boundary/${bg}`,s.controlBorder,s[bg],3);
      for (const role of ['hover','pressed']) check(brand.id,mode,`${role} boundary/${bg}`,s[role],s[bg],3);
    }
    for (const bg of ['accent','hover','pressed']) check(brand.id,mode,`button label/${bg}`,s.onAccent,s[bg]);
    check(brand.id,mode,'accent subtle text',s.onSubtle,s.subtle);
    for (const [name,status] of Object.entries(s.status)) {
      check(brand.id,mode,`${name} text`,status.text,status.subtle);
      check(brand.id,mode,`${name} filled`,status.onColor,status.color);
    }
  }
}
const f=data.foundations;
let wordmark;
for(const brand of data.brands) for(const mode of ['light','dark']) for(const kind of ['mark','full-logo']) {
  const source=fs.readFileSync(new URL(`../../identities/${brand.id}/svg/svnthgt-${brand.id}-${kind}.svg`,import.meta.url),'utf8');
  const variant=fs.readFileSync(new URL(`../src/assets/svnthgt-${brand.id}-${kind}-${mode}.svg`,import.meta.url),'utf8');
  const stripRoot=svg=>svg.replace(/<svg[^>]*>/,'<svg>').replaceAll(data.semantic[brand.id][mode].logo,brand.color);
  assert.equal(stripRoot(variant),source.replace(/<svg[^>]*>/,'<svg>'),'Web variants must retain master geometry');
  if(kind==='full-logo') {
    assert.ok(variant.includes(`viewBox="0 0 ${data.logoLayout.width} ${data.logoLayout.height}"`),'Every full logo must share a canvas');
    const row=variant.match(/<g id="svnthgt-wordmark">([\s\S]*?)<\/g>/)[1];
    wordmark??=row;
    assert.equal(row,wordmark,'First wordmark row must be identical across all identities');
  }
}
for(const mode of ['light','dark']) for(const [role,stop] of Object.entries(data.sharedNeutral.roles[mode])) {
  for(const brand of data.brands) assert.equal(data.semantic[brand.id][mode][role],data.sharedNeutral.ramp[stop],`${brand.id} must share neutral ${role}`);
}
for(const hex of Object.values(data.sharedNeutral.ramp)) {
  assert.equal(hex.slice(1,3),hex.slice(3,5));
  assert.equal(hex.slice(3,5),hex.slice(5,7));
}
for(const mode of ['light','dark']) for(const hex of Object.values(data.palettes.design[mode])) {
  assert.equal(hex.slice(1,3),hex.slice(3,5),'Design must remain achromatic');
  assert.equal(hex.slice(3,5),hex.slice(5,7),'Design must remain achromatic');
}
assert.deepEqual(f.spacing,[0,2,...Array.from({length:32},(_,i)=>(i+1)*4)]);
for(const values of Object.values(f.type)) assert.ok(values[0]%2===0 && values[1]%2===0);
for(const theme of Object.values(data.themes)) for(const [key,value] of Object.entries(theme.tokens)) {
  if(key.startsWith('--spacing-')) assert.ok(f.spacing.includes(parseFloat(value)*16),`${key} outside spacing scale`);
}
fs.writeFileSync(new URL('../tokens/contrast-report.json',import.meta.url),JSON.stringify({scope:'Token pairs only; browser interactions and whole-page accessibility require separate review.',checks:results.length,passed:true,minimum:Math.min(...results.map(r=>r.ratio)),results},null,2)+'\n');
console.log(`${results.length} contrast checks passed across all 10 theme/mode combinations; spacing, type grid and brand seeds verified.`);
