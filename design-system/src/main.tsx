import {StrictMode, useEffect, useRef, useState, type ReactNode, type CSSProperties} from 'react';
import {createRoot} from 'react-dom/client';
import {Theme} from '@astryxdesign/core/theme';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Switch} from '@astryxdesign/core/Switch';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Badge} from '@astryxdesign/core/Badge';
import {Dialog} from '@astryxdesign/core/Dialog';
import {ToastViewport, useToast} from '@astryxdesign/core/Toast';
import {Icon} from '@astryxdesign/core/Icon';
import {ArrowUpRight, ArrowRight, CircleHalf, Check, Copy, GameController, Camera, Cpu, PaintBrush, Cursor, Sun, Moon, SquaresFour, TextAa, Ruler, Stack, CheckCircle} from '@phosphor-icons/react';
import data from '../tokens/resolved.json';
import {themes, type Brand} from './themes';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '../tokens/tokens.css';
import './components.css';
import './fonts.css';
import './system.css';

type Mode = 'light'|'dark'|'system';
const brandIcons = {gaming:GameController,captures:Camera,tech:Cpu,miniatures:PaintBrush,design:Cursor};
const brandNames = {gaming:'Gaming',captures:'Captures',tech:'Tech',miniatures:'Miniatures',design:'Design'};
const nav = [{id:'overview',label:'Overview',icon:SquaresFour},{id:'color',label:'Color & themes',icon:CircleHalf},{id:'typography',label:'Typography',icon:TextAa},{id:'spacing',label:'Spacing & shape',icon:Ruler},{id:'components',label:'Components',icon:Stack},{id:'icons',label:'Iconography',icon:Cursor},{id:'guidelines',label:'Usage principles',icon:CheckCircle}];
function saved(key:string, fallback:string){try{return localStorage.getItem(key)||fallback;}catch{return fallback;}}
function Section({id,index,title,description,children}:{id:string,index:string,title:string,description:string,children:ReactNode}){
  return <section id={id} className="section"><div className="section-heading"><span className="eyebrow">{index}</span><div><h2>{title}</h2><p>{description}</p></div></div>{children}</section>;
}
function Notification({message}:{message:{body:string}|null}){
  const toast=useToast();
  useEffect(()=>{
    if(message) toast({body:message.body,uniqueID:'showcase-feedback',collisionBehavior:'overwrite',isAutoHide:true,autoHideDuration:3000});
  },[message,toast]);
  return null;
}
function App(){
  const toolbarRef=useRef<HTMLDivElement>(null);
  const [brand,setBrand]=useState<Brand>(()=>{const s=saved('sg-brand','gaming');return s in themes?s as Brand:'gaming';});
  const [mode,setMode]=useState<Mode>(()=>{const s=saved('sg-mode','system');return ['light','dark','system'].includes(s)?s as Mode:'system';});
  const [systemDark,setSystemDark]=useState(matchMedia('(prefers-color-scheme: dark)').matches);
  const [name,setName]=useState('');
  const [checked,setChecked]=useState(true);
  const [enabled,setEnabled]=useState(true);
  const [dialog,setDialog]=useState(false);
  const [message,setNotice]=useState<{body:string}|null>(null);
  function setMessage(body:string){setNotice({body});}
  const [active,setActive]=useState('overview');
  const dark=mode==='dark'||(mode==='system'&&systemDark);
  const resolved=dark?'dark':'light';
  const current=data.semantic[brand][resolved];
  const logoStop=Object.entries(data.brandPalettes[brand]).find(([,hex])=>hex.toLowerCase()===current.logo.toLowerCase())?.[0];
  const Glyph=brandIcons[brand];
  useEffect(()=>{const el=toolbarRef.current;if(!el)return;const observer=new ResizeObserver(()=>document.documentElement.style.setProperty('--sg-toolbar-height',`${el.getBoundingClientRect().height}px`));observer.observe(el);return()=>{observer.disconnect();document.documentElement.style.removeProperty('--sg-toolbar-height');};},[]);
  useEffect(()=>{const query=matchMedia('(prefers-color-scheme: dark)');const fn=()=>setSystemDark(query.matches);query.addEventListener('change',fn);return ()=>query.removeEventListener('change',fn);},[]);
  useEffect(()=>{try{localStorage.setItem('sg-brand',brand);localStorage.setItem('sg-mode',mode);}catch{}},[brand,mode]);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)setActive(entry.target.id);}),{rootMargin:'-10% 0px -70% 0px'});document.querySelectorAll('section[id],header[id]').forEach(el=>observer.observe(el));return ()=>observer.disconnect();},[]);
  async function copy(value:string){try{await navigator.clipboard.writeText(value);setMessage(`Copied ${value}`);}catch{setMessage(`Token value: ${value}`);}}
  const logo=new URL(`./assets/svnthgt-${brand}-full-logo-${resolved}.svg`,import.meta.url).href;
  const mark=new URL(`./assets/svnthgt-${brand}-mark-${resolved}.svg`,import.meta.url).href;
  return <Theme theme={themes[brand]} mode={mode}>
    <ToastViewport position="bottomEnd" maxVisible={1}>
    <Notification message={message}/>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="shell">
      <aside className="sidebar">
        <a className="wordmark" href="#overview">SVNTHGT<span>.</span></a>
        <div className="sidebar-caption">Design system <span className="version">v0.2</span></div>
        <nav aria-label="Design system sections">{nav.map(({id,label,icon:NavIcon})=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined}><NavIcon size={20} aria-hidden/>{label}</a>)}</nav>
        <div className="sidebar-bottom"><span className="tiny-label">THE FOUNDATION</span><a href="https://astryx.atmeta.com/" target="_blank" rel="noreferrer">Astryx by Meta <ArrowUpRight size={16}/></a><p>One system.<br/>Every side of Svnthgt.</p></div>
      </aside>
      <main id="main">
        <div className="sticky-controls" ref={toolbarRef} aria-label="Theme controls">
        <div className="toolbar"><div className="breadcrumb">SVNTHGT <span>/</span> Foundations</div><div className="mode-picker" role="group" aria-label="Color mode">{([{value:'light',icon:Sun,label:'Light'},{value:'dark',icon:Moon,label:'Dark'},{value:'system',icon:CircleHalf,label:'System'}] as const).map(({value,icon:ModeIcon,label})=><button key={value} aria-pressed={mode===value} onClick={()=>setMode(value)}><ModeIcon size={16} aria-hidden/>{label}</button>)}</div></div>
        <div className="theme-dock"><div><span className="tiny-label">EXPLORE AN IDENTITY</span><p>Same system. A different side.</p></div><div className="brand-picker" role="group" aria-label="Brand theme">{data.brands.map(b=>{const BIcon=brandIcons[b.id as Brand];return <button key={b.id} aria-pressed={brand===b.id} onClick={()=>setBrand(b.id as Brand)} style={{'--brand-dot':b.color} as CSSProperties}><BIcon size={20} aria-hidden/><span>{brandNames[b.id as Brand]}</span></button>;})}</div></div>
        </div>
        <header id="overview" className="hero"><div className="eyebrow">THE SVNTHGT DESIGN LANGUAGE</div><h1>Many interests.<br/><span>One identity.</span></h1><p className="hero-copy">A shared foundation for the things I make, play,<br className="desktop-break"/> explore, and capture. Built to feel like me.</p><div className="hero-meta"><span><span className="status-dot"/> Foundation draft</span><span>2px grid</span><span>Astryx + Phosphor</span></div><div className="hero-art" aria-hidden><div className="art-square"><img src={mark} alt=""/></div><div className="art-caption">{brandNames[brand].toUpperCase()} / {resolved.toUpperCase()}</div></div></header>
        <Section id="color" index="01" title="Color with a purpose." description="Exact brand colors for identity. Tonal shades for everything that needs to be read or used.">
          <div className="color-top"><Card><div className="card-heading"><span className="tiny-label">IDENTITY · {resolved.toUpperCase()} MODE</span><Glyph size={24}/></div><div className="logo-stage"><img src={logo} alt={`Svnthgt ${brandNames[brand]} logo`}/></div><div className="row between"><span>{brandNames[brand]}</span><button className="copy-token" onClick={()=>copy(current.logo)}>{current.logo}<Copy size={16}/></button></div></Card><div className="color-note"><span className="tiny-label">AUTOMATIC, INTENTIONAL CONTRAST</span><h3>Bright ideas.<br/>Readable interfaces.</h3><p>Color roles adapt to {resolved} mode. {brand==='design'?'Design shares the neutral scale. Its light-mode logo uses neutral 900; its dark-mode logo stays soft white.':'The vivid brand color anchors 500 in both modes. Tech and Miniatures use darker logo shades in light mode. Actions and text use contrast-checked shades from this palette.'}</p><div className="row"><Badge variant="success" label="Contrast checks passed"/><span className="subtle">Across 10 combinations</span></div></div></div>
          <div className="palette-label"><span className="tiny-label">{brandNames[brand].toUpperCase()} · {brand==='design'?'SHARED NEUTRAL':'BRAND COLOR AT 500'} RAMP</span><span className="subtle">{!logoStop&&`Logo ink ${current.logo} · `}Tap a swatch to copy</span></div><div className="swatches">{[50,100,200,300,400,500,600,700,800,900,950].map(stop=>{const hex=(data.brandPalettes[brand] as Record<string,string>)[stop];return <button key={stop} onClick={()=>copy(hex)} aria-label={`Copy shade ${stop}, ${hex}`}><span style={{background:hex}}/><strong>{stop}{String(stop)===logoStop&&<em className="seed-label">Logo</em>}</strong><code>{hex}</code></button>;})}</div>
          <div className="semantic-grid">{(['body','surface','muted','text','secondary','controlBorder','accent','subtle'] as const).map(role=><button key={role} onClick={()=>copy(current[role])}><span className="semantic-dot" style={{background:current[role]}}/><span>{role.replace('controlBorder','control border')}<code>{current[role]}</code></span><Copy size={16}/></button>)}</div>
          <div className="neutral-palette"><div className="palette-label"><span className="tiny-label">SHARED NEUTRALS · EVERY IDENTITY</span><span className="subtle">White to black · fixed primitive colors</span></div><p className="neutral-description">A true gray foundation, inspired by your original palette. The same colors serve every identity; surfaces, text, and borders select different stops in light and dark mode.</p><div className="swatches neutral-swatches">{data.sharedNeutral.order.map(stop=>{const hex=data.sharedNeutral.ramp[stop as keyof typeof data.sharedNeutral.ramp];return <button key={stop} onClick={()=>copy(hex)} aria-label={`Copy neutral ${stop}, ${hex}`}><span style={{background:hex}}/><strong>{stop}</strong><code>{hex}</code></button>;})}</div><div className="neutral-roles">{(['body','surface','muted','text','secondary','border','controlBorder'] as const).map(role=><div key={role}><span>{role==='controlBorder'?'Control border':role}</span><code>Neutral {data.sharedNeutral.roles[resolved][role]}</code></div>)}</div></div>
        </Section>
        <Section id="typography" index="02" title="A clear rhythm." description="Even-numbered type sizes and line heights. A 16px body size leaves room to breathe.">
          <div className="notice"><InfoIcon/><p><strong>Sora for headings. Inter for everything you read and use.</strong> Bold 700 headings, with Regular 400 and Bold 700 paragraphs. Both font families are served locally.</p></div>
          <div className="type-table">{(['heading-1','heading-2','heading-3','heading-4','heading-5','large','large-bold','body','body-bold','supporting','supporting-bold','caption','caption-bold'] as const).map(role=>{const [size,line,weight]=data.foundations.type[role];const heading=role.startsWith('heading');return <div className="type-row" key={role}><div><span className="tiny-label">{role.replaceAll('-',' ')}</span><code>{heading?'Sora':'Inter'} · {size} / {line} · {weight}</code></div><div className={`type-sample ${role}`} style={{fontFamily:heading?'var(--font-family-heading)':'var(--font-family-body)',fontSize:`${size/16}rem`,lineHeight:`${line/16}rem`,fontWeight:weight}}>{role==='heading-1'?'Stay curious.':heading?'Made of many things.':'The quick brown fox jumps over the lazy dog.'}</div></div>;})}</div>
        </Section>
        <Section id="spacing" index="03" title="Everything in its place." description="2, 4, 8, 12, 16, 20, 24… then four-pixel steps. Zero is reserved for no spacing.">
          <div className="spacing-layout"><Card><span className="tiny-label">SPACING SCALE · PX</span><div className="space-bars">{data.foundations.spacing.filter(n=>n>0&&n<=48).map(n=><div key={n}><code>{n}</code><span style={{width:`${n/16}rem`}}/></div>)}</div><p className="subtle">The same progression continues through 128px.</p></Card><div className="shape-column"><Card><span className="tiny-label">ROUNDED, WITH INTENT</span><div className="shape-samples">{[[`${data.foundations.actionRadius}px`,'Action'],['12px','Input'],['20px','Card'],['9998px','Navigation']].map(([radius,label])=><div key={label}><span style={{borderRadius:radius}}/><p>{label}</p><code>{label==='Navigation'?'Pill':radius}</code></div>)}</div></Card><Card><span className="tiny-label">SIZED FOR INTERACTION</span><div className="row control-samples"><Button label="Small · 40" size="sm"/><Button label="Default · 44"/><Button label="Large · 48" size="lg"/></div><p className="subtle">Touch devices lift small controls to 44px.</p></Card></div></div>
        </Section>
        <Section id="components" index="04" title="The working parts." description="Real Astryx components, connected to Svnthgt tokens and Phosphor icons.">
          <div className="component-grid"><Card><div className="card-heading"><h3>Actions</h3><code>Button</code></div><div className="row wrap"><Button label="Explore work" variant="primary" icon={<ArrowUpRight size={20} aria-hidden/>} onClick={()=>setDialog(true)}/><Button label="Secondary" onClick={()=>setMessage('Secondary action selected.')}/><Button label="Ghost" variant="ghost" onClick={()=>setMessage('Ghost action selected.')}/></div><div className="row wrap"><Button label="Disabled" isDisabled/><Button label="Loading" isLoading/><Button label="Destructive" variant="destructive" onClick={()=>setMessage('Destructive style preview. No data is deleted.')}/></div><p className="subtle">Tab to inspect focus. Hover and press to inspect states.</p></Card>
          <Card><div className="card-heading"><h3>Text fields</h3><code>TextInput</code></div><TextInput label="Project name" placeholder="Something worth making" value={name} onChange={setName} hasClear/><TextInput label="Validation example" value="hello" onChange={()=>{}} isReadOnly status={{type:'error',message:'Enter a complete email address.'}} statusVariant="detached"/></Card>
          <Card><div className="card-heading"><h3>Selection</h3><code>Switch · CheckboxInput</code></div><div className="selection-row"><Switch label="Show project details" value={enabled} onChange={setEnabled}/></div><div className="selection-row"><CheckboxInput label="Include in selected work" value={checked} onChange={setChecked}/></div><p className="subtle">{enabled?'Project details are visible.':'Project details are hidden.'} {checked?'Included in selected work.':'Excluded from selected work.'}</p></Card>
          <Card><div className="card-heading"><h3>Feedback</h3><code>Badge</code></div><div className="row wrap"><Badge variant="success" label="Success" icon={<Check size={16} aria-hidden/>}/><Badge variant="warning" label="Warning"/><Badge variant="error" label="Error"/><Badge variant="info" label="Information"/></div><p className="subtle">Status colors keep their meaning across every brand theme. Always pair color with text or an icon.</p><Button label="Open dialog" onClick={()=>setDialog(true)} icon={<Icon icon="externalLink"/>}/></Card></div>
        </Section>
        <Section id="icons" index="05" title="A familiar visual voice." description="Phosphor Regular. 20px by default, with 16, 24, and 32px options."><div className="icon-grid">{Object.entries(brandIcons).map(([id,BIcon])=><div key={id}><BIcon size={32} aria-hidden/><span>{brandNames[id as Brand]}</span></div>)}{(['search','menu','copy','check','externalLink','calendar','close'] as const).map(name=><div key={name}><Icon icon={name} size="lg"/><span>{name}</span></div>)}</div><p className="subtle">All 30 built-in Astryx semantic icons are mapped to Phosphor. The brand’s custom logo symbols remain the identity assets.</p></Section>
        <Section id="guidelines" index="06" title="Designed to stay consistent." description="A small set of rules to carry into the website."><div className="principles">{[['Use roles, not raw colors.','Choose surface, text, accent, and status tokens. Keep exact logo colors for identity artwork.'],['Let the content lead.','Use one primary action per context, a comfortable reading width, and the shared spacing scale.'],['Make every state legible.','Include hover, pressed, focus, disabled, loading, and error states. Respect reduced motion.'],['Keep the family together.','Change the brand and mode at the theme provider. Typography, spacing, and component behavior stay shared.']].map(([title,body],i)=><article key={title}><span className="eyebrow">0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></Section>
        <footer><span>SVNTHGT. / Design system v0.2</span><span>Ready to shape what comes next. <ArrowRight size={16}/></span></footer>
      </main>
    </div>
    <Dialog isOpen={dialog} onOpenChange={setDialog} width={480} aria-labelledby="dialog-title"><div className="dialog-content"><span className="eyebrow">COMPONENT PREVIEW</span><h2 id="dialog-title">A space for the details.</h2><p>This Astryx dialog inherits the active {brandNames[brand]} theme, rounded corners, and Phosphor icon registry.</p><p className="subtle">Press Escape to close. Keyboard focus returns to the button that opened it.</p><Button label="Got it" variant="primary" onClick={()=>setDialog(false)}/></div></Dialog>
    </ToastViewport>
  </Theme>;
}
function InfoIcon(){return <Icon icon="info"/>;}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
