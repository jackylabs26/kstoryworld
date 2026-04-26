// Marketing site components — KStoryWorld (responsive)
const { useState, useEffect } = React;
function useIsMobile(breakpoint = 768) {
  const [m, setM] = useState(typeof window !== 'undefined' && window.innerWidth < breakpoint);
  useEffect(() => {
    const on = () => setM(window.innerWidth < breakpoint);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [breakpoint]);
  return m;
}

// ===== Header =====
function Header() {
  const m = useIsMobile();
  const [open, setOpen] = useState(false);
  if (m) {
    return (
      <header style={{position:'sticky',top:0,zIndex:10,height:56,padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,0.86)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(0,0,0,0.06)'}}>
        <img src="../../assets/logo-kstoryworld.svg" style={{height:18}} alt="kstoryworld"/>
        <button onClick={()=>setOpen(!open)} aria-label="Menu" style={{width:36,height:36,border:'1px solid rgba(0,0,0,0.08)',borderRadius:4,background:'#fff',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',gap:3,cursor:'pointer'}}>
          <span style={{width:14,height:1.5,background:'#000'}}/><span style={{width:14,height:1.5,background:'#000'}}/><span style={{width:14,height:1.5,background:'#000'}}/>
        </button>
        {open && (
          <div style={{position:'absolute',top:56,left:0,right:0,background:'#fff',borderBottom:'1px solid rgba(0,0,0,0.08)',padding:'16px 16px 20px',display:'flex',flexDirection:'column',gap:4}}>
            {['Stories','Seasons','Research','About'].map(l => (
              <a key={l} href="#" style={{fontSize:18,letterSpacing:'-0.18px',color:'#000',textDecoration:'none',padding:'10px 0',borderBottom:'1px solid rgba(0,0,0,0.04)'}}>{l}</a>
            ))}
            <span className="t-mono-sm" style={{color:'rgba(0,0,0,0.55)',marginTop:12}}>EN · 한국어 · 日本語</span>
            <button className="btn btn-dark" style={{marginTop:14,justifyContent:'center'}}>Start reading</button>
          </div>
        )}
      </header>
    );
  }
  return (
    <header style={{position:'sticky',top:0,zIndex:10,height:64,padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,0.72)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(0,0,0,0.06)'}}>
      <div style={{display:'flex',alignItems:'center',gap:32}}>
        <img src="../../assets/logo-kstoryworld.svg" style={{height:22}} alt="kstoryworld"/>
        <nav style={{display:'flex',gap:24}}>
          {['Stories','Seasons','Research','About'].map(l => (
            <a key={l} href="#" style={{fontSize:15,letterSpacing:'-0.15px',color:'#000',textDecoration:'none'}}>{l}</a>
          ))}
        </nav>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <a className="t-mono-sm" href="#" style={{color:'#000',textDecoration:'none'}}>EN · 한국어</a>
        <button className="btn btn-dark">Start reading</button>
      </div>
    </header>
  );
}

// ===== Hero =====
function Hero() {
  const m = useIsMobile();
  return (
    <section style={{position:'relative',padding: m ? '56px 20px 72px' : '100px 32px 120px',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
        <div style={{position:'absolute',width:520,height:520,borderRadius:'50%',background:'#ffd6e0',filter:'blur(60px)',opacity:0.85,left:-100,top:-120}}/>
        <div style={{position:'absolute',width:480,height:480,borderRadius:'50%',background:'#bdbbff',filter:'blur(70px)',opacity:0.75,left:380,top:40}}/>
        <div style={{position:'absolute',width:380,height:380,borderRadius:'50%',background:'#ffb7a0',filter:'blur(50px)',opacity:0.8,right:120,top:-40}}/>
        <div style={{position:'absolute',width:420,height:420,borderRadius:'50%',background:'#cfe9ff',filter:'blur(60px)',opacity:0.7,right:-60,top:200}}/>
      </div>
      <div style={{position:'relative',maxWidth:1240,margin:'0 auto'}}>
        <span className="badge">사계 · FOUR SEASONS · ISSUE 04</span>
        <h1 className="t-display" style={{margin:'18px 0 0',maxWidth:880,fontSize: m ? 44 : 64,letterSpacing: m ? '-1.32px' : '-1.92px',lineHeight: m ? 1.05 : 1.05}}>Every Korean story,<br/>told with care.</h1>
        <p className="t-body-l" style={{margin: m ? '14px 0 24px' : '20px 0 32px',maxWidth:560,color:'rgba(0,0,0,0.7)',fontSize: m ? 16 : 18}}>
          From p'ansori to today's K-drama, the thread of <em>jeong</em> runs through everything we publish — translated by humans, illustrated with restraint.
        </p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn btn-dark">Start with a tale →</button>
          <button className="btn btn-outline">이야기 둘러보기</button>
        </div>
      </div>
    </section>
  );
}

// ===== Stats =====
function Stats() {
  const m = useIsMobile();
  const items = [
    {n:'3,200+', c:'Stories told this season'},
    {n:'42', c:'Translators & voice actors'},
    {n:'12', c:'Languages, growing'},
    {n:'4', c:'Seasons, four moods'},
  ];
  return (
    <section style={{borderTop:'1px solid rgba(0,0,0,0.08)',borderBottom:'1px solid rgba(0,0,0,0.08)',padding: m ? '32px 20px' : '48px 32px'}}>
      <div style={{maxWidth:1240,margin:'0 auto',display:'grid',gridTemplateColumns: m ? 'repeat(2,1fr)' : 'repeat(4,1fr)',gap: m ? 24 : 32}}>
        {items.map((s,i)=>(
          <div key={i}>
            <div style={{fontFamily:'var(--font-display)',fontSize: m ? 40 : 64,fontWeight:500,letterSpacing: m ? '-1.2px' : '-1.92px',lineHeight:1}}>{s.n}</div>
            <div className="t-mono-sm" style={{marginTop:10,color:'rgba(0,0,0,0.6)'}}>{s.c}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== Story Card =====
function StoryCard({grad, label, title, sub, num}) {
  const [hover, setHover] = useState(false);
  return (
    <a href="#" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{display:'block',textDecoration:'none',color:'#000',background:'#fff',border:'1px solid rgba(0,0,0,0.08)',borderRadius:8,overflow:'hidden',transition:'box-shadow 240ms cubic-bezier(0.2,0.8,0.2,1), transform 240ms cubic-bezier(0.2,0.8,0.2,1)',boxShadow: hover ? '0 8px 24px rgba(1,1,32,0.16)' : '0 4px 10px rgba(1,1,32,0.10)',transform: hover ? 'translateY(-2px)':'translateY(0)'}}>
      <div style={{height:180,background:grad,position:'relative'}}>
        <span className="t-mono-sm" style={{position:'absolute',top:12,left:12,padding:'2px 8px',background:'rgba(255,255,255,0.85)',borderRadius:4}}>{num}</span>
      </div>
      <div style={{padding:'20px 24px 24px'}}>
        <div className="t-mono-sm" style={{color:'rgba(0,0,0,0.55)'}}>{label}</div>
        <h3 className="t-h4" style={{margin:'8px 0 6px'}}>{title}</h3>
        <p style={{margin:0,fontSize:14,color:'rgba(0,0,0,0.65)',letterSpacing:'-0.07px',lineHeight:1.4}}>{sub}</p>
      </div>
    </a>
  );
}

// ===== Season Row =====
function SeasonRow({season, kor, grad, label, stories}) {
  const m = useIsMobile();
  return (
    <section style={{padding: m ? '48px 20px' : '80px 32px'}}>
      <div style={{maxWidth:1240,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom: m ? 24 : 32,gap:12}}>
          <div>
            <span className="t-mono-sm" style={{color:'rgba(0,0,0,0.55)'}}>{label}</span>
            <h2 className="t-h2" style={{margin:'10px 0 0',fontSize: m ? 28 : 40,letterSpacing: m ? '-0.56px' : '-0.80px'}}>{kor} · <span style={{color:'rgba(0,0,0,0.5)'}}>{season}</span></h2>
          </div>
          <a href="#" className="t-mono-sm" style={{color:'#000',textDecoration:'none',padding:'8px 12px',border:'1px solid rgba(0,0,0,0.08)',borderRadius:4,whiteSpace:'nowrap'}}>{m ? 'All →' : 'View all →'}</a>
        </div>
        <div style={{display:'grid',gridTemplateColumns: m ? '1fr' : 'repeat(3,1fr)',gap: m ? 14 : 20}}>
          {stories.map((s,i)=>(<StoryCard key={i} {...s} grad={grad}/>))}
        </div>
      </div>
    </section>
  );
}

// ===== Research =====
function ResearchSection() {
  const m = useIsMobile();
  const papers = [
    {n:'PAPER 04', t:'Translating jeong: lessons from twelve translators', a:'Soyoon Choo · 2026'},
    {n:'PAPER 03', t:'P\'ansori in audio-first formats', a:'Hailey Lee · 2026'},
    {n:'PAPER 02', t:'A grammar of Korean melodrama', a:'Stella Gong · 2025'},
  ];
  return (
    <section style={{background:'#010120',color:'#fff',padding: m ? '64px 20px' : '100px 32px',position:'relative',overflow:'hidden'}}>
      <div style={{maxWidth:1240,margin:'0 auto',position:'relative',zIndex:1}}>
        <span className="t-mono-sm" style={{color:'rgba(255,255,255,0.6)'}}>RESEARCH · 연구</span>
        <h2 className="t-h2" style={{margin:'10px 0 36px',maxWidth:680,fontSize: m ? 28 : 40,letterSpacing: m ? '-0.56px' : '-0.80px'}}>How stories travel — notes from our editorial desk.</h2>
        <div style={{display:'grid',gridTemplateColumns: m ? '1fr' : 'repeat(3,1fr)',gap: m ? 14 : 20}}>
          {papers.map((p,i)=>(
            <a key={i} href="#" style={{display:'block',padding:24,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,textDecoration:'none',color:'#fff'}}>
              <div className="t-mono-sm" style={{color:'rgba(255,255,255,0.6)'}}>{p.n}</div>
              <h3 className="t-h4" style={{margin:'12px 0 16px'}}>{p.t}</h3>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.6)',letterSpacing:'-0.07px'}}>{p.a}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== Footer =====
function Footer() {
  const m = useIsMobile();
  return (
    <footer style={{background:'#010120',color:'#fff',position:'relative',overflow:'hidden',paddingTop: m ? 48 : 80}}>
      <div style={{maxWidth:1240,margin:'0 auto',padding: m ? '0 20px' : '0 32px',display:'grid',gridTemplateColumns: m ? '1fr 1fr' : '2fr 1fr 1fr 1fr',gap: m ? 24 : 48,position:'relative',zIndex:1}}>
        <div>
          <img src="../../assets/logo-kstoryworld.svg" style={{height:24,filter:'invert(1)'}} alt=""/>
          <p style={{marginTop:18,maxWidth:300,fontSize:14,color:'rgba(255,255,255,0.7)',letterSpacing:'-0.07px',lineHeight:1.5}}>Korean stories, translated with care. Built in Seoul · Brooklyn · Berlin.</p>
        </div>
        {[
          {h:'Read', l:['Stories','Seasons','Audio']},
          {h:'About', l:['Our team','Translators','Press']},
          {h:'Contact', l:['Pitch a story','Newsletter','hello@kstoryworld']},
        ].map((c,i)=>(
          <div key={i}>
            <div className="t-mono-sm" style={{color:'rgba(255,255,255,0.5)',marginBottom:14}}>{c.h}</div>
            {c.l.map(x => <div key={x} style={{marginBottom:8,fontSize:14}}><a href="#" style={{color:'rgba(255,255,255,0.85)',textDecoration:'none'}}>{x}</a></div>)}
          </div>
        ))}
      </div>
      <div style={{fontFamily:'var(--font-display)',fontSize: m ? 96 : 240,fontWeight:500,letterSpacing: m ? '-2.88px' : '-7.2px',color:'rgba(255,255,255,0.06)',lineHeight:1,whiteSpace:'nowrap',marginTop: m ? 36 : 60,paddingLeft: m ? 20 : 32,userSelect:'none'}}>kstoryworld·</div>
      <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',padding: m ? '14px 20px' : '20px 32px',display:'flex',justifyContent:'space-between',fontSize:12,color:'rgba(255,255,255,0.55)',letterSpacing:'0.02px',flexWrap:'wrap',gap:8}}>
        <span>© 2026 KStoryWorld · 케이스토리월드</span>
        <span className="t-mono-xs">EST · 2024 · SEOUL</span>
      </div>
    </footer>
  );
}

window.MK = { Header, Hero, Stats, StoryCard, SeasonRow, ResearchSection, Footer };
