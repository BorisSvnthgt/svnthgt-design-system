import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {choose, ink} from './color.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8').replace(/^\uFEFF/, ''));
const f = read('tokens/foundations.json');
const brandScale = read('tokens/brand-scale.json');
const brands = read('../identities/asset-manifest.json').identities;
const identity = read('tokens/identity.json');
const sharedNeutral = read('tokens/neutral.json');
const neutralModes = Object.fromEntries(Object.entries(sharedNeutral.roles).map(([mode,roles])=>[mode,Object.fromEntries(Object.entries(roles).map(([role,stop])=>[role,sharedNeutral.ramp[stop]]))]));
const {palette: generatedPalette, recipe} = read('tokens/palette.json');
// Design is achromatic. Derive its 21-stop ramp from the same shared neutral primitives,
// avoiding artificial hue/chroma introduced by a color generator near white.
const anchors = [[0,'black'],[5,'950'],[10,'900'],[15,'800'],[25,'700'],[40,'600'],[55,'500'],[70,'400'],[80,'300'],[90,'200'],[95,'100'],[98,'50'],[100,'white']];
const neutralRamp = Object.fromEntries(Array.from({length:21},(_,i)=>{
  const stop=i*5;
  const upper=anchors.findIndex(([n])=>n>=stop);
  const [hi,hiKey]=anchors[upper], [lo,loKey]=anchors[Math.max(0,upper-1)];
  const a=parseInt(sharedNeutral.ramp[loKey].slice(1,3),16),b=parseInt(sharedNeutral.ramp[hiKey].slice(1,3),16);
  const gray=Math.round(hi===lo?b:a+(b-a)*(stop-lo)/(hi-lo)).toString(16).padStart(2,'0');
  return [stop,`#${gray.repeat(3)}`];
}));
const brandPalettes = {};
const palette = {...generatedPalette,design:{name:'design',light:neutralRamp,dark:neutralRamp}};
function mixHex(a,b,t) {
  return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
}
for (const brand of brands.filter(b=>b.id!=='design')) {
  const scale=Object.fromEntries(Object.entries(brandScale.mix).map(([stop,amount])=>[stop,mixHex(brand.color,amount<0?'#ffffff':'#000000',Math.abs(amount))]));
  brandPalettes[brand.id]=scale;
  // Adapt the fixed 50–950 brand scale to Astryx's ascending 0–100 tone convention.
  const points=[[0,'#000000'],...Object.entries(scale).map(([stop,hex])=>[(1000-Number(stop))/10,hex]),[100,'#ffffff']].sort((a,b)=>a[0]-b[0]);
  const ramp=Object.fromEntries(Array.from({length:21},(_,i)=>{
    const stop=i*5, upper=points.findIndex(([n])=>n>=stop);
    const [hi,b]=points[upper], [lo,a]=points[Math.max(0,upper-1)];
    return [stop,mixHex(a,b,hi===lo?1:(stop-lo)/(hi-lo))];
  }));
  palette[brand.id]={name:brand.id,light:ramp,dark:ramp};
}
brandPalettes.design=Object.fromEntries(Object.keys(brandScale.mix).map(stop=>[stop,sharedNeutral.ramp[stop]]));
const logoColor=(brand,mode)=> mode==='light'&&identity.lightLogoStops[brand.id]
  ? brandPalettes[brand.id][identity.lightLogoStops[brand.id]] : brand.color;
// Shared canvas keeps the mark and first wordmark row stationary as identity changes.
const fullLogos=brands.map(brand=>fs.readFileSync(path.join(root,`../identities/${brand.id}/svg/svnthgt-${brand.id}-full-logo.svg`),'utf8'));
const bounds=fullLogos.map(svg=>svg.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number));
const logoLayout={width:Math.max(...bounds.map(b=>b[2])),height:Math.max(...bounds.map(b=>b[3]))};
fs.mkdirSync(path.join(root,'src/assets'),{recursive:true});
for(const brand of brands) for(const mode of ['light','dark']) for(const kind of ['mark','full-logo']) {
  const source=fs.readFileSync(path.join(root,`../identities/${brand.id}/svg/svnthgt-${brand.id}-${kind}.svg`),'utf8');
  let svg=source.replaceAll(brand.color,logoColor(brand,mode));
  if(kind==='full-logo') svg=svg.replace(/viewBox="[^"]+"/,`viewBox="0 0 ${logoLayout.width} ${logoLayout.height}"`)
    .replace(/width="[^"]+" height="[^"]+"/,`width="${logoLayout.width*10}" height="${logoLayout.height*10}"`);
  fs.writeFileSync(path.join(root,`src/assets/svnthgt-${brand.id}-${kind}-${mode}.svg`),svg);
}
const rem = n => `${n / 16}rem`;
const common = {};
for (const [key, value] of Object.entries(f.font)) if (['body', 'heading', 'code'].includes(key)) common[`--font-family-${key}`] = value;
for (let step = 0; step <= 12; step++) common[`--spacing-${step}`] = rem(step * 4);
common['--spacing-0-5'] = rem(2);
// Astryx has a 6px alias; collapse it to an allowed 8px rather than introducing a new spacing value.
common['--spacing-1-5'] = rem(8);
for (const [role, [size, line, weight]] of Object.entries(f.type)) {
  if (role === 'caption' || role.endsWith('-bold')) continue;
  common[`--text-${role}-size`] = rem(size);
  common[`--text-${role}-leading`] = String(line / size);
  common[`--text-${role}-weight`] = String(weight);
}
for (const [name, size] of Object.entries({'4xs': 12, '3xs': 12, '2xs': 12, xs: 12, sm: 14, base: 16, lg: 20, xl: 24, '2xl': 32, '3xl': 40, '4xl': 48, '5xl': 64})) common[`--font-size-${name}`] = rem(size);
for (const [name, n] of Object.entries(f.radius)) common[`--radius-${name}`] = `${n}px`;
for (const name of ['sm', 'md', 'lg']) common[`--size-element-${name}`] = rem(f.control[name]);
Object.assign(common, {
  '--border-width': '2px', '--focus-outline-width': '2px', '--focus-outline-offset': '2px',
  '--focus-outline-style': 'solid', '--focus-outline-color': 'var(--color-text-accent)',
  '--duration-fast-min': '80ms', '--duration-fast': '120ms', '--duration-fast-max': '160ms',
  '--duration-medium-min': '160ms', '--duration-medium': '200ms', '--duration-medium-max': '240ms',
  '--duration-slow-min': '280ms', '--duration-slow': '320ms', '--duration-slow-max': '400ms'
});
common['--ease-standard'] = f.motion.ease;
common['--shadow-low'] = '0 2px 8px var(--color-shadow)';
common['--shadow-med'] = '0 4px 16px var(--color-shadow)';
common['--shadow-high'] = '0 8px 32px var(--color-shadow)';
common['--shadow-inset-hover'] = 'inset 0 0 0 2px var(--color-border-emphasized)';
common['--shadow-inset-selected'] = 'inset 0 0 0 2px var(--color-accent)';
for (const status of ['success','warning','error']) common[`--shadow-inset-${status}`] = `inset 0 0 0 2px var(--color-${status})`;
const semantic = {};
for (const brand of brands) {
  semantic[brand.id] = {};
  for (const mode of ['light', 'dark']) {
    const dark = mode === 'dark';
    const ramp = palette[brand.id][mode];
    const {body, surface, muted, raised} = neutralModes[mode];
    const surfaces = [body, surface, muted, raised];
    const accent = brand.id === 'design' ? neutralModes[mode].text : choose(ramp, dark ? 50 : 40, surfaces, 4.5);
    const onAccent = ink(accent);
    const hover = choose(ramp, dark ? 60 : 30, [onAccent, ...surfaces], 4.5);
    const pressed = choose(ramp, dark ? 70 : 20, [onAccent, ...surfaces], 4.5);
    const subtle = ramp[dark ? 15 : 95];
    const onSubtle = choose(ramp, dark ? 85 : 25, [subtle], 4.5);
    const status = {};
    for (const name of ['success', 'warning', 'error', 'info']) {
      const r = palette[name][mode];
      const color = choose(r, dark ? 80 : 35, surfaces, 4.5);
      status[name] = {color, subtle: r[dark ? 15 : 95], onColor: ink(color), text: choose(r, dark ? 85 : 25, [r[dark ? 15 : 95]], 4.5)};
    }
    semantic[brand.id][mode] = {
      ...neutralModes[mode],
      logo: logoColor(brand,mode),
      navSelected: dark ? subtle : brandPalettes[brand.id]['200'],
      navSelectedText: dark ? onSubtle : choose(ramp,25,[brandPalettes[brand.id]['200']],4.5),
      accent, onAccent, hover, pressed, subtle, onSubtle, status
    };
  }
}
const themes = {};
for (const brand of brands) {
  const tokens = {...common};
  const tuple = fn => ['light', 'dark'].map(mode => fn(semantic[brand.id][mode], mode));
  const map = {
    'color-background-body':'body', 'color-background-surface':'surface', 'color-background-card':'surface',
    'color-background-popover':'raised', 'color-background-muted':'muted', 'color-text-primary':'text',
    'color-text-secondary':'secondary', 'color-text-disabled':'disabled', 'color-icon-primary':'text',
    'color-icon-secondary':'secondary', 'color-icon-disabled':'disabled', 'color-accent':'accent',
    'color-text-accent':'accent', 'color-icon-accent':'accent', 'color-on-accent':'onAccent',
    'color-accent-muted':'subtle', 'color-border':'border', 'color-border-emphasized':'controlBorder',
    'color-neutral':'muted', 'color-track':'controlBorder', 'color-skeleton':'border'
  };
  for (const [key, role] of Object.entries(map)) tokens[`--${key}`] = tuple(s => s[role]);
  tokens['--color-background-inverted'] = [sharedNeutral.ramp['950'], sharedNeutral.ramp['50']];
  // Switch off tracks need an identifiable boundary against both surface modes.
  tokens['--color-background-gray'] = tuple(s=>s.controlBorder);
  tokens['--color-overlay'] = ['#14141480', '#000000a8'];
  tokens['--color-overlay-hover'] = ['#0000000a', '#ffffff0a'];
  tokens['--color-overlay-pressed'] = ['#00000014', '#ffffff14'];
  tokens['--color-tint-hover'] = ['#000000', '#ffffff'];
  tokens['--color-shadow'] = ['#14141414', '#00000066'];
  for (const name of ['success', 'warning', 'error']) {
    tokens[`--color-${name}`] = tuple(s => s.status[name].color);
    tokens[`--color-${name}-muted`] = tuple(s => s.status[name].subtle);
    tokens[`--color-on-${name}`] = tuple(s => s.status[name].onColor);
  }
  const localTokens = {};
  for (const [stop,hex] of Object.entries(sharedNeutral.ramp)) localTokens[`--sg-neutral-${stop}`] = hex;
  localTokens['--sg-brand-original'] = brand.color;
  localTokens['--sg-logo-color'] = tuple(s=>s.logo);
  localTokens['--sg-radius-action'] = `${f.actionRadius}px`;
  localTokens['--sg-radius-navigation'] = 'var(--radius-full)';
  localTokens['--sg-nav-selected'] = tuple(s=>s.navSelected);
  localTokens['--sg-nav-selected-text'] = tuple(s=>s.navSelectedText);
  for(const [stop,hex] of Object.entries(brandPalettes[brand.id])) localTokens[`--sg-brand-${stop}`] = hex;
  for (const [key, role] of Object.entries({hover:'hover',pressed:'pressed','on-subtle':'onSubtle'})) localTokens[`--sg-${key}`] = tuple(s => s[role]);
  for (const n of f.spacing) localTokens[`--sg-space-${n}`] = rem(n);
  for (const [role, [size, line, weight]] of Object.entries(f.type)) {
    localTokens[`--sg-type-${role}`] = rem(size);
    localTokens[`--sg-leading-${role}`] = rem(line);
    localTokens[`--sg-weight-${role}`] = String(weight);
  }
  for (const name of ['success', 'warning', 'error', 'info']) for (const role of ['color', 'subtle', 'text']) localTokens[`--sg-${name}-${role}`] = tuple(s => s.status[name][role]);
  for (const [name, n] of Object.entries(f.zIndex)) localTokens[`--sg-z-${name}`] = String(n);
  localTokens['--sg-content-max'] = rem(f.layout.contentMax);
  localTokens['--sg-reading-max'] = f.layout.readingMax;
  localTokens['--sg-ease'] = f.motion.ease;
  for(const [name,n] of Object.entries(f.layout)) if(typeof n==='number') localTokens[`--sg-layout-${name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}`] = rem(n);
  themes[brand.id] = {name:`svnthgt-${brand.id}`, tokens, localTokens};
}
const output = {schemaVersion:1, version:f.version, paletteRecipe:brandScale.recipe, statusPaletteRecipe:recipe, brandScale, brandPalettes, identity, logoLayout, fontStatus:f.font.status, sharedNeutral, palettes:palette, brands:brands.map(({id,displayName,color})=>({id,displayName,color})), foundations:f, semantic, themes};
fs.writeFileSync(path.join(root,'tokens/resolved.json'), JSON.stringify(output,null,2)+'\n');
let css = '/* Generated by npm run tokens. Edit foundations.json, neutral.json, or brand-scale.json. */\n';
for (const theme of Object.values(themes)) {
  css += `[data-astryx-theme="${theme.name}"] {\n`;
  for (const [name,value] of Object.entries({...theme.tokens,...theme.localTokens})) css += `  ${name}: ${Array.isArray(value) ? `light-dark(${value.join(', ')})` : value};\n`;
  css += '}\n';
}
css += ':root {color-scheme:light dark} [data-theme="light"] {color-scheme:light} [data-theme="dark"] {color-scheme:dark}\n';
fs.writeFileSync(path.join(root,'tokens/tokens.css'),css);
console.log(`Generated ${brands.length} themes × 2 modes, exact brand seeds, CSS and JSON.`);
