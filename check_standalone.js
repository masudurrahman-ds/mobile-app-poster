
// ---- progress bar ----
const bar = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  bar.style.width = pct + '%';
  document.getElementById('totop').classList.toggle('show', h.scrollTop > 600);
});
document.getElementById('totop').addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));

// ---- FAIL-SAFE reveal-on-scroll: content is visible by default (see CSS .reveal{opacity:1}).
// JS only ever ADDS a nicer entrance by first marking elements .pre (invisible) once JS is confirmed
// running, then revealing them via IntersectionObserver OR a hard timeout fallback so nothing can
// ever get permanently stuck hidden even if the observer fails for any reason. ----
try{
  const revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(el=>el.classList.add('pre'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); e.target.classList.remove('pre'); io.unobserve(e.target);} });
  },{threshold:0.08});
  revealEls.forEach(el=>io.observe(el));
  // hard safety net: force-reveal everything after 2.5s no matter what
  setTimeout(()=>{ revealEls.forEach(el=>{ el.classList.add('visible'); el.classList.remove('pre'); }); }, 2500);
}catch(err){ console.warn('reveal animation skipped, content still visible by default', err); }

// ---- active nav highlighting ----
try{
  const navLinks = document.querySelectorAll('.navlinks a');
  const sections = [...navLinks].map(a=>document.querySelector(a.getAttribute('href')));
  const navIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        navLinks.forEach(a=>a.classList.remove('active'));
        const link = document.querySelector('a[href="#'+e.target.id+'"]');
        if(link) link.classList.add('active');
      }
    });
  },{rootMargin:'-40% 0px -55% 0px'});
  sections.forEach(s=>{ if(s) navIO.observe(s); });
}catch(err){}

// ---- 3D tilt on team cards ----
document.querySelectorAll('.member').forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - 0.5;
    const y = (e.clientY - r.top)/r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', ()=>{ card.style.transform = 'perspective(900px) rotateY(0) rotateX(0)'; });
});

// ---- framework comparison toggle ----
function showPanel(groupId, panelId, btn){
  document.querySelectorAll('#'+groupId+' .toggle-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('#'+groupId+' .toggle-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(panelId).classList.add('active');
  btn.classList.add('active');
}

// ---- animated bar charts: fill to target width when scrolled into view ----
try{
  const barIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.querySelectorAll('.bar-fill').forEach(b=>{ b.style.width = b.dataset.target + '%'; });
        barIO.unobserve(e.target);
      }
    });
  },{threshold:0.3});
  document.querySelectorAll('.barchart').forEach(el=>barIO.observe(el));
}catch(err){}

// ---- animated donut chart: draw the stroke in when scrolled into view ----
try{
  const donutIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.querySelectorAll('circle[data-dash]').forEach(c=>{ c.style.strokeDasharray = c.dataset.dash; });
        donutIO.unobserve(e.target);
      }
    });
  },{threshold:0.3});
  document.querySelectorAll('.donut-wrap').forEach(el=>donutIO.observe(el));
}catch(err){}

// ---- animated counters: count up from 0 to target when scrolled into view ----
try{
  function animateCount(el){
    const target = el.dataset.count;
    const isPct = target.includes('%');
    const hasTilde = target.includes('~');
    const numMatch = target.match(/[\\d.]+/);
    if(!numMatch) return; // non-numeric label (e.g. plain text), leave as-is
    const num = parseFloat(numMatch[0]);
    const suffix = target.slice(target.indexOf(numMatch[0])+numMatch[0].length);
    const prefix = target.slice(0, target.indexOf(numMatch[0]));
    let cur = 0;
    const steps = 40, inc = num/steps;
    const timer = setInterval(()=>{
      cur += inc;
      if(cur >= num){ cur = num; clearInterval(timer); }
      const shown = Number.isInteger(num) ? Math.round(cur) : (Math.round(cur*10)/10);
      el.textContent = prefix + shown + suffix;
    }, 1400/steps);
  }
  const countIO = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ animateCount(e.target); countIO.unobserve(e.target); }
    });
  },{threshold:0.4});
  document.querySelectorAll('[data-count]').forEach(el=>countIO.observe(el));
}catch(err){}

// ---- code comparison tabs ----
function showCode(tabId, panelId, btn){
  document.querySelectorAll('#'+tabId+' .code-tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('#'+tabId.replace('tabs','panels')+' .code-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(panelId).classList.add('active');
}

// ---- cost calculator ----
function calcCost(){
  const box = document.getElementById('calcBox');
  if(!box) return;
  let low = 8000, high = 15000; // base: simple single-screen app
  box.querySelectorAll('input[type=checkbox]').forEach(cb=>{
    if(cb.checked){ low += parseInt(cb.dataset.low); high += parseInt(cb.dataset.high); }
  });
  const platform = box.querySelector('input[name=platform]:checked').value;
  if(platform === 'both-native'){ low*=1.8; high*=1.8; }
  else if(platform === 'cross'){ low*=1.15; high*=1.15; }
  document.getElementById('calcLow').textContent = '$' + Math.round(low).toLocaleString();
  document.getElementById('calcHigh').textContent = '$' + Math.round(high).toLocaleString();
}
document.addEventListener('DOMContentLoaded', calcCost);
window.addEventListener('load', calcCost);
(function(){
  const track = document.getElementById('carTrack');
  if(!track) return;
  const slides = track.children.length;
  let idx = 0;
  const dotsWrap = document.getElementById('carDots');
  for(let i=0;i<slides;i++){
    const d = document.createElement('button');
    d.className = 'car-dot' + (i===0?' active':'');
    d.onclick = ()=>goTo(i);
    dotsWrap.appendChild(d);
  }
  function goTo(i){
    idx = (i+slides)%slides;
    track.style.transform = `translateX(-${idx*100}%)`;
    [...dotsWrap.children].forEach((d,j)=>d.classList.toggle('active', j===idx));
  }
  document.getElementById('carPrev').onclick = ()=>goTo(idx-1);
  document.getElementById('carNext').onclick = ()=>goTo(idx+1);
  let auto = setInterval(()=>goTo(idx+1), 4200);
  track.closest('.carousel').addEventListener('mouseenter', ()=>clearInterval(auto));
  track.closest('.carousel').addEventListener('mouseleave', ()=>{ auto = setInterval(()=>goTo(idx+1), 4200); });
})();

// ---- expandable deep-dive cards ----
function toggleDD(id, btn){
  const body = document.getElementById(id);
  const card = body.closest('.deepdive');
  const isOpen = body.classList.toggle('open');
  card.classList.toggle('open', isOpen);
  btn.textContent = isOpen ? 'Show Less \u2212' : 'Read More +';
}

// ---- lifecycle scroll tracker + completion percentage ----
(function(){
  const stages = ['Discover','Design','Build','Test','Ship','Grow'];
  const track = document.getElementById('lifecycleTrack');
  if(!track) return;
  let html = '';
  stages.forEach((s,i)=>{
    html += '<span class="lc-stage" data-i="'+i+'">'+s+'</span>';
    if(i<stages.length-1) html += '<span class="lc-sep">\u2192</span>';
  });
  html += '<span class="lc-pct" id="lcPct">0% explored</span>';
  track.innerHTML = html;
  const stageEls = track.querySelectorAll('.lc-stage');

  window.addEventListener('scroll', ()=>{
    const h = document.documentElement;
    const pct = Math.min(100, Math.max(0, (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100));
    track.classList.toggle('show', h.scrollTop > 300);
    const stageIdx = Math.min(stages.length-1, Math.floor(pct/100*stages.length));
    stageEls.forEach((el,i)=>el.classList.toggle('active', i===stageIdx));
    document.getElementById('lcPct').textContent = Math.round(pct) + '% explored';
  });
})();

// ---- dark / light theme toggle (in-memory only, no storage) ----
function toggleTheme(btn){
  const isLight = document.body.classList.toggle('light-theme');
  btn.textContent = isLight ? '\u2600\ufe0f Light' : '\ud83c\udf19 Dark';
}
