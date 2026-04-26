// Reader app components — KStoryWorld
const { useState } = React;

const SEASONS = {
  spring: {kor:'봄', en:'spring', grad:'linear-gradient(135deg,#ffd6e0 0%,#ffb7a0 50%,#bdbbff 100%)', ink:'#c2185b', tint:'#fff5f7'},
  summer: {kor:'여름', en:'summer', grad:'linear-gradient(135deg,#cfe9ff 0%,#7fd1c7 50%,#d8f3dc 100%)', ink:'#1e6f6a', tint:'#f0faf8'},
  autumn: {kor:'가을', en:'autumn', grad:'linear-gradient(135deg,#f6e0b5 0%,#f4a261 55%,#e76f51 100%)', ink:'#8a3a1a', tint:'#fdf3e6'},
  winter: {kor:'겨울', en:'winter', grad:'linear-gradient(135deg,#f4f4f7 0%,#dbe7ff 60%,#3a4a7d 100%)', ink:'#1c2750', tint:'#f4f7ff'},
};

// ===== Sidebar =====
function Sidebar({route, setRoute}) {
  const items = [
    {k:'discover', l:'Discover', g:'발견'},
    {k:'reader', l:'Reading', g:'읽는 중'},
    {k:'library', l:'Library', g:'서재'},
  ];
  return (
    <aside style={{width:240,background:'#fff',borderRight:'1px solid rgba(0,0,0,0.08)',padding:'24px 20px',display:'flex',flexDirection:'column',gap:32,height:'100vh',position:'sticky',top:0}}>
      <img src="../../assets/logo-kstoryworld.svg" style={{height:22,alignSelf:'flex-start'}} alt=""/>
      <nav style={{display:'flex',flexDirection:'column',gap:2}}>
        {items.map(it => (
          <button key={it.k} onClick={()=>setRoute(it.k)} style={{textAlign:'left',padding:'10px 12px',border:0,background:route===it.k?'rgba(0,0,0,0.05)':'transparent',borderRadius:4,cursor:'pointer',display:'flex',alignItems:'baseline',justifyContent:'space-between',fontFamily:'var(--font-display)',fontSize:15,letterSpacing:'-0.15px',color:'#000'}}>
            <span>{it.l}</span>
            <span className="t-mono-xs" style={{color:'rgba(0,0,0,0.5)'}}>{it.g}</span>
          </button>
        ))}
      </nav>
      <div style={{marginTop:'auto',padding:16,background:'#010120',borderRadius:8,color:'#fff'}}>
        <div className="t-mono-sm" style={{color:'rgba(255,255,255,0.55)'}}>SEASON · 사계</div>
        <div style={{marginTop:6,fontFamily:'var(--font-display)',fontSize:22,letterSpacing:'-0.44px'}}>봄 2026</div>
        <div style={{marginTop:8,fontSize:12,color:'rgba(255,255,255,0.6)',letterSpacing:'-0.06px'}}>3 stories left this week</div>
      </div>
    </aside>
  );
}

// ===== Discover =====
function Discover({onOpen}) {
  return (
    <div style={{padding:'40px 48px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32}}>
        <div>
          <span className="t-mono-sm" style={{color:'rgba(0,0,0,0.55)'}}>FOR YOU · 오늘의 추천</span>
          <h1 className="t-h2" style={{margin:'12px 0 0'}}>Pick a story, brew tea, take an hour.</h1>
        </div>
        <div style={{display:'flex',gap:6}}>
          {Object.entries(SEASONS).map(([k,s]) => (
            <button key={k} className="badge" style={{background:s.tint,borderColor:'rgba(0,0,0,0.08)',padding:'6px 10px',cursor:'pointer'}}>{s.kor} · {s.en}</button>
          ))}
        </div>
      </div>

      {/* Featured */}
      <a onClick={()=>onOpen()} style={{display:'block',cursor:'pointer',textDecoration:'none',color:'#000',background:'#fff',border:'1px solid rgba(0,0,0,0.08)',borderRadius:8,overflow:'hidden',boxShadow:'0 4px 10px rgba(1,1,32,0.10)',marginBottom:32}}>
        <div style={{display:'grid',gridTemplateColumns:'1.3fr 1fr'}}>
          <div style={{height:320,background:SEASONS.spring.grad,position:'relative'}}>
            <span className="t-mono-sm" style={{position:'absolute',top:16,left:16,padding:'4px 10px',background:'rgba(255,255,255,0.85)',borderRadius:4}}>FEATURED · 봄 01</span>
          </div>
          <div style={{padding:'40px 36px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <div className="t-mono-sm" style={{color:SEASONS.spring.ink}}>STORY · 12 MIN READ</div>
            <h2 className="t-h2" style={{margin:'14px 0 12px',letterSpacing:'-0.8px'}}>The cherry tree at Donghwasa</h2>
            <p style={{margin:'0 0 20px',fontSize:16,color:'rgba(0,0,0,0.7)',letterSpacing:'-0.16px',lineHeight:1.4}}>A monk, a sparrow, and one perfect afternoon in April. Translated by Soyoon Choo.</p>
            <div><button className="btn btn-dark">Open story →</button></div>
          </div>
        </div>
      </a>

      {/* Grid */}
      <div className="t-mono-sm" style={{color:'rgba(0,0,0,0.55)',marginBottom:14}}>NEW THIS WEEK · 이번 주 신작</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18}}>
        {[
          {s:'summer',n:'04',t:'Bingsu at midnight, Hongdae',m:'9 min'},
          {s:'autumn',n:'07',t:'Persimmons on the windowsill',m:'14 min'},
          {s:'winter',n:'10',t:'Snow on the Daedong River',m:'18 min'},
          {s:'spring',n:'02',t:'Spring rain in Bukchon',m:'7 min'},
          {s:'summer',n:'05',t:'Letters from Jeju',m:'11 min'},
          {s:'autumn',n:'08',t:'Songpyeon for an only son',m:'10 min'},
        ].map((c,i) => {
          const s = SEASONS[c.s];
          return (
            <div key={i} style={{background:'#fff',border:'1px solid rgba(0,0,0,0.08)',borderRadius:8,overflow:'hidden',boxShadow:'0 4px 10px rgba(1,1,32,0.10)'}}>
              <div style={{height:140,background:s.grad,position:'relative'}}>
                <span className="t-mono-xs" style={{position:'absolute',top:10,left:10,padding:'2px 6px',background:'rgba(255,255,255,0.85)',borderRadius:4}}>{s.kor} · {c.n}</span>
              </div>
              <div style={{padding:18}}>
                <h3 className="t-h4" style={{margin:'0 0 8px',fontSize:18,letterSpacing:'-0.18px'}}>{c.t}</h3>
                <div className="t-mono-xs" style={{color:'rgba(0,0,0,0.55)'}}>{c.m} · {s.en}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== Story Reader =====
function StoryReader({dark, setDark}) {
  const [playing, setPlaying] = useState(false);
  const bg = dark ? '#010120' : '#fff';
  const fg = dark ? '#fff' : '#000';
  const fg2 = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
  const border = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{background:bg,color:fg,minHeight:'100vh',padding:'40px 48px 140px',position:'relative'}}>
      <div style={{maxWidth:680,margin:'0 auto'}}>
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          <span className="badge" style={dark?{background:'rgba(255,255,255,0.12)',color:'#fff',borderColor:'rgba(255,255,255,0.12)'}:{}}>봄 · 01</span>
          <span className="badge" style={dark?{background:'rgba(255,255,255,0.12)',color:'#fff',borderColor:'rgba(255,255,255,0.12)'}:{}}>12 MIN READ</span>
          <span className="badge" style={dark?{background:'rgba(255,255,255,0.12)',color:'#fff',borderColor:'rgba(255,255,255,0.12)'}:{}}>BEGINNER · 초급</span>
        </div>
        <h1 className="t-display" style={{margin:0,fontSize:56,letterSpacing:'-1.68px',lineHeight:1.05}}>The cherry tree at Donghwasa</h1>
        <div style={{margin:'14px 0 36px',color:fg2,fontSize:16,letterSpacing:'-0.16px'}}>By 김선미 · Translated by Soyoon Choo · Read by Hailey Lee</div>

        <div style={{height:280,borderRadius:8,background:SEASONS.spring.grad,marginBottom:36,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(1,1,32,0) 60%, rgba(1,1,32,0.4) 100%)'}}/>
          <div style={{position:'absolute',bottom:14,left:16,color:'#fff'}}>
            <div className="t-mono-xs" style={{opacity:0.8}}>ILLUSTRATION · 봄 01</div>
          </div>
        </div>

        <div style={{fontSize:19,lineHeight:1.6,letterSpacing:'-0.19px',color:fg2}}>
          <p style={{marginTop:0}}>매일 아침, 동화사의 늙은 스님은 오래된 벚나무 아래에서 차를 마셨다. <span style={{borderBottom:`1px dashed ${border}`,cursor:'help'}} title="Donghwasa · a Buddhist temple on Mt. Palgong">Donghwasa</span> had stood there longer than anyone could remember, and the tree, longer still.</p>
          <p>That spring, a sparrow built her nest in the lowest branch — close enough that the monk could see her without lifting his cup. <em>"You are early this year,"</em> he told her, in the patient tone he used for the children of the village.</p>
          <p>한 마리 참새가 가장 낮은 가지에 둥지를 틀었다. He did not move. The wind moved the petals. The petals moved nothing at all.</p>
          <p>By the third week of April, the tree was a soft pink storm. The monk stopped pouring tea. He simply sat. <em>This,</em> he thought, <em>is enough.</em></p>
        </div>

        <div style={{marginTop:48,padding:24,border:`1px solid ${border}`,borderRadius:8,background:dark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)'}}>
          <div className="t-mono-sm" style={{color:fg2}}>TRANSLATOR'S NOTE · 옮긴이의 말</div>
          <p style={{margin:'12px 0 0',fontSize:15,letterSpacing:'-0.15px',lineHeight:1.5,color:fg2}}>The original uses 정 (jeong) twice — a quiet warmth that sits between affection and obligation. I left the English bare so the feeling could fit yours.</p>
        </div>
      </div>

      {/* Audio bar */}
      <div style={{position:'fixed',left:240,right:0,bottom:0,padding:'14px 32px',background:dark?'rgba(1,1,32,0.85)':'rgba(255,255,255,0.85)',backdropFilter:'blur(12px)',borderTop:`1px solid ${border}`,display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>setPlaying(!playing)} style={{width:40,height:40,borderRadius:'50%',border:0,background:dark?'#fff':'#010120',color:dark?'#010120':'#fff',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>{playing?'❚❚':'▶'}</button>
        <div style={{flex:1}}>
          <div className="t-mono-xs" style={{color:fg2,marginBottom:6}}>READING BY HAILEY LEE · 12:04 / 18:30</div>
          <div style={{height:3,background:dark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.08)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:'65%',background:fg}}/></div>
        </div>
        <button onClick={()=>setDark(!dark)} className="t-mono-sm" style={{background:'transparent',border:`1px solid ${border}`,padding:'8px 12px',borderRadius:4,color:fg,cursor:'pointer'}}>{dark?'LIGHT MODE':'NIGHT READING'}</button>
      </div>
    </div>
  );
}

// ===== Library =====
function Library() {
  const stories = [
    {s:'spring',n:'01',t:'The cherry tree at Donghwasa',pg:65},
    {s:'spring',n:'02',t:'Spring rain in Bukchon',pg:100},
    {s:'autumn',n:'07',t:'Persimmons on the windowsill',pg:30},
    {s:'winter',n:'11',t:"Tteokguk for two",pg:100},
  ];
  return (
    <div style={{padding:'40px 48px'}}>
      <span className="t-mono-sm" style={{color:'rgba(0,0,0,0.55)'}}>YOUR LIBRARY · 서재</span>
      <h1 className="t-h2" style={{margin:'12px 0 32px'}}>Saved stories — 4</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:18}}>
        {stories.map((c,i) => {
          const s = SEASONS[c.s];
          return (
            <div key={i} style={{background:'#fff',border:'1px solid rgba(0,0,0,0.08)',borderRadius:8,padding:20,display:'flex',gap:18,boxShadow:'0 4px 10px rgba(1,1,32,0.10)'}}>
              <div style={{width:80,height:100,borderRadius:4,background:s.grad,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div className="t-mono-xs" style={{color:s.ink}}>{s.kor} · STORY {c.n}</div>
                <h3 className="t-h4" style={{margin:'8px 0 12px'}}>{c.t}</h3>
                <div style={{height:3,background:'rgba(0,0,0,0.08)',borderRadius:2,marginBottom:6}}><div style={{height:'100%',width:c.pg+'%',background:'#010120',borderRadius:2}}/></div>
                <div className="t-mono-xs" style={{color:'rgba(0,0,0,0.55)'}}>{c.pg===100?'COMPLETED':`${c.pg}% READ`}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.AK = { Sidebar, Discover, StoryReader, Library };
