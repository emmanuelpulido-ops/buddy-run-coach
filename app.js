const PLAN_START = '2026-08-31';
const RACE_DATE = '2027-03-21';
const STORAGE_KEY = 'buddyRunCoachDataV1';

const plan = [
[1,'Aug 31–Sep 6','3 E','3 E + 4 strides','5 E',11],
[2,'Sep 7–13','3 E','4 E + 6 strides','6 E',13],
[3,'Sep 14–20','3 E','4 w/ 6 × 1 min fast','6 E',13],
[4,'Sep 21–27','4 E','4 E + 6 strides','7 E',15],
[5,'Sep 28–Oct 4','4 E','5 w/ 6 × 2 min steady','7 E',16],
[6,'Oct 5–11','3 E','4 E + 6 strides','6 E',13],
[7,'Oct 12–18','4 E','5 w/ 8 × 45 sec hills','7 E',16],
[8,'Oct 19–25','4 E','5 w/ 3 × 6 min T','8 E',17],
[9,'Oct 26–Nov 1','4 E','5 E + strides','9 E',18],
[10,'Nov 2–8','4 E','6 w/ 4 × 5 min T','8 E',18],
[11,'Nov 9–15','5 E','6 w/ 8 × 60 sec hills','10 E',21],
[12,'Nov 16–22','4 E','5 E + 6 strides','8 E',17],
[13,'Nov 23–29','5 E','6 w/ 3 × 8 min T','10 E',21],
[14,'Nov 30–Dec 6','5 E','6 w/ 5 × 1 mi TH','9 E',20],
[15,'Dec 7–13','5 E','6 E + strides','11 E',22],
[16,'Dec 14–20','4 E','6 w/ 2 × 15 min T','9 E',19],
[17,'Dec 21–27','5 E','6 w/ 4 × 1 mi TH','11 E',22],
[18,'Dec 28–Jan 3','4 E','5 E + strides','8 E',17],
[19,'Jan 4–10','5 E','7 w/ 3 × 2 mi HM','10 E',22],
[20,'Jan 11–17','5 E','7 w/ 5 × 1 mi TH','12 E',24],
[21,'Jan 18–24','5 E','6 E + strides','10 E',21],
[22,'Jan 25–31','5 E','7 w/ 2 × 3 mi HM','12 E',24],
[23,'Feb 1–7','5 E','7 w/ 4 × 1 mi TH','13 E',25],
[24,'Feb 8–14','4 E','6 w/ 3 × 2 mi HM','10 E',20],
[25,'Feb 15–21','5 E','7 w/ 3 × 2 mi HM','11 E',23],
[26,'Feb 22–28','5 E','6 w/ 4 × 1 mi TH','12 E',23],
[27,'Mar 1–7','5 E','6 w/ 4 mi HM continuous','9 E',20],
[28,'Mar 8–14','4 E','5 w/ 3 × 1 mi HM','7 E',16],
[29,'Mar 15–21','3 E','3 E + strides','13.1 RACE',19]
].map(r=>({week:r[0],dates:r[1],mon:r[2],wed:r[3],sun:r[4],weekly:r[5]}));

let state = loadState();
let deferredPrompt = null;

function localDate(str){ const [y,m,d]=str.split('-').map(Number); return new Date(y,m-1,d); }
function isoDate(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function addDays(date,n){ const d=new Date(date); d.setDate(d.getDate()+n); return d; }
function diffDays(a,b){ return Math.floor((a-b)/(1000*60*60*24)); }
function currentTrainingWeek(date=new Date()){
  const days=diffDays(new Date(date.getFullYear(),date.getMonth(),date.getDate()),localDate(PLAN_START));
  if(days<0) return 0;
  return Math.min(29,Math.floor(days/7)+1);
}
function weekDate(week,dayOffset){ return addDays(localDate(PLAN_START),(week-1)*7+dayOffset); }
function workoutForDate(dateStr){
  const d=localDate(dateStr), wk=currentTrainingWeek(d); if(wk<1||wk>29) return null;
  const row=plan[wk-1], dow=d.getDay();
  if(dow===1) return {week:wk,day:'Monday',key:`${wk}-mon`,detail:row.mon,date:dateStr};
  if(dow===3) return {week:wk,day:'Wednesday',key:`${wk}-wed`,detail:row.wed,date:dateStr};
  if(dow===0) return {week:wk,day:'Sunday',key:`${wk}-sun`,detail:row.sun,date:dateStr};
  return null;
}
function allWorkouts(){
  return plan.flatMap(w=>[
    {week:w.week,day:'Monday',key:`${w.week}-mon`,detail:w.mon,date:isoDate(weekDate(w.week,0))},
    {week:w.week,day:'Wednesday',key:`${w.week}-wed`,detail:w.wed,date:isoDate(weekDate(w.week,2))},
    {week:w.week,day:'Sunday',key:`${w.week}-sun`,detail:w.sun,date:isoDate(weekDate(w.week,6))}
  ]);
}
function loadState(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {runs:[]}; }
  catch { return {runs:[]}; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
function getDurationSeconds(){
  const h=Number(document.getElementById('durationHours').value)||0;
  const m=Number(document.getElementById('durationMinutes').value)||0;
  const s=Number(document.getElementById('durationSeconds').value)||0;
  if(h<0 || m<0 || m>59 || s<0 || s>59) return 0;
  return h*3600+m*60+s;
}
function fmtDuration(sec){ const h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s=Math.round(sec%60); return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`; }
function fmtPace(secPerMi){ if(!isFinite(secPerMi)||secPerMi<=0)return '—'; const m=Math.floor(secPerMi/60),s=Math.round(secPerMi%60); return `${m}:${String(s).padStart(2,'0')}/mi`; }
function completedKeys(){ return new Set(state.runs.filter(r=>r.completed&&r.workoutKey).map(r=>r.workoutKey)); }
function plannedMiles(detail){ const m=String(detail).match(/^([0-9.]+)/); return m?Number(m[1]):0; }
function toast(msg){ const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1800); }

function renderHome(){
  const today=new Date(), todayIso=isoDate(today), wk=currentTrainingWeek(today), race=localDate(RACE_DATE);
  const days=Math.max(0,diffDays(race,new Date(today.getFullYear(),today.getMonth(),today.getDate())));
  document.getElementById('countdown').textContent=days===0?'Race day!':`${days} days`;
  document.getElementById('currentWeek').textContent=wk?`${wk}/29`:'—';
  const wo=workoutForDate(todayIso), done=wo&&completedKeys().has(wo.key);
  if(wo){
    document.getElementById('todayTitle').textContent=`${wo.day} Run`;
    document.getElementById('todayDetail').textContent=wo.detail;
    document.getElementById('todayStatus').textContent=done?'Completed':'Scheduled';
    document.getElementById('logTodayBtn').style.display=done?'none':'block';
    document.getElementById('logTodayBtn').onclick=()=>openLogForWorkout(wo);
  } else {
    document.getElementById('todayTitle').textContent='Recovery / cross-training day';
    document.getElementById('todayDetail').textContent= wk>=1&&wk<=29 ? 'No run scheduled today. Recover well and stay ready for your next session.' : 'Your training plan begins August 31, 2026.';
    document.getElementById('todayStatus').textContent='Rest';
    document.getElementById('logTodayBtn').style.display='none';
  }
  const weekRuns=state.runs.filter(r=>currentTrainingWeek(localDate(r.date))===wk);
  const miles=weekRuns.reduce((a,r)=>a+Number(r.distance||0),0);
  document.getElementById('weekMiles').textContent=`${miles.toFixed(1)} mi`;
  document.getElementById('weekGoal').textContent=`of ${wk?plan[wk-1].weekly:0} mi planned`;
  const total=state.runs.reduce((a,r)=>a+Number(r.distance||0),0);
  document.getElementById('totalMiles').textContent=total.toFixed(1);
  const scheduledSoFar=allWorkouts().filter(x=>localDate(x.date)<=today).length || 1;
  const completed=completedKeys().size;
  document.getElementById('completionPct').textContent=`${Math.min(100,Math.round(completed/scheduledSoFar*100))}%`;
  document.getElementById('longestRun').textContent=`${Math.max(0,...state.runs.map(r=>Number(r.distance||0))).toFixed(1)} mi`;
  const upcoming=allWorkouts().filter(x=>localDate(x.date)>=new Date(today.getFullYear(),today.getMonth(),today.getDate()) && !completedKeys().has(x.key)).slice(0,3);
  document.getElementById('upcomingList').innerHTML=upcoming.map(x=>`<div class="upcoming-item"><div><b>${x.day} • ${x.detail}</b><small>Week ${x.week} • ${localDate(x.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</small></div><span>→</span></div>`).join('') || '<p class="muted">No upcoming runs.</p>';
}

function renderPlan(){
  const wk=currentTrainingWeek(), done=completedKeys();
  document.getElementById('planList').innerHTML=plan.map(w=>`<article class="week-card ${w.week===wk?'current':''}"><div class="section-heading"><div><h3>Week ${w.week}</h3><span class="dates">${w.dates}</span></div><b>${w.weekly} mi</b></div><div class="workouts"><div class="workout-chip ${done.has(`${w.week}-mon`)?'done':''}"><span>MON</span>${w.mon}</div><div class="workout-chip ${done.has(`${w.week}-wed`)?'done':''}"><span>WED</span>${w.wed}</div><div class="workout-chip ${done.has(`${w.week}-sun`)?'done':''}"><span>SUN • LONG</span>${w.sun}</div></div></article>`).join('');
}

function fillWorkoutSelect(){
  const sel=document.getElementById('plannedWorkout'), current=sel.value;
  sel.innerHTML='<option value="">Unplanned / extra run</option>'+allWorkouts().map(w=>`<option value="${w.key}" data-date="${w.date}">Week ${w.week} • ${w.day} • ${w.detail}</option>`).join('');
  if(current) sel.value=current;
}
function openLogForWorkout(wo){ navigate('log'); document.getElementById('runDate').value=wo.date; document.getElementById('plannedWorkout').value=wo.key; }
function renderRecent(){
  const recent=[...state.runs].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt).slice(0,8);
  document.getElementById('recentRuns').innerHTML=recent.map(r=>`<div class="run-item"><div><b>${Number(r.distance).toFixed(2)} mi • ${fmtPace(r.durationSec/Number(r.distance))}</b><small>${localDate(r.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})} • ${fmtDuration(r.durationSec)}${r.rpe?` • RPE ${r.rpe}`:''}</small></div><button class="delete-run" data-id="${r.id}" aria-label="Delete run">×</button></div>`).join('') || '<p class="muted">No runs logged yet.</p>';
  document.querySelectorAll('.delete-run').forEach(btn=>btn.onclick=()=>{ state.runs=state.runs.filter(r=>r.id!==btn.dataset.id); saveState(); renderAll(); toast('Run deleted'); });
}

function renderProgress(){
  const runs=state.runs, totalSec=runs.reduce((a,r)=>a+Number(r.durationSec||0),0), totalMiles=runs.reduce((a,r)=>a+Number(r.distance||0),0);
  document.getElementById('avgPace').textContent=totalMiles?fmtPace(totalSec/totalMiles):'—';
  document.getElementById('totalTime').textContent=`${Math.floor(totalSec/3600)}h ${Math.floor((totalSec%3600)/60)}m`;
  document.getElementById('runsLogged').textContent=runs.length;
  const hrs=runs.map(r=>Number(r.heartRate)).filter(Boolean); document.getElementById('avgHR').textContent=hrs.length?`${Math.round(hrs.reduce((a,b)=>a+b,0)/hrs.length)} bpm`:'—';
  drawMileageChart(); renderPBs();
}
function drawMileageChart(){
  const c=document.getElementById('mileageChart'), ctx=c.getContext('2d'), dpr=window.devicePixelRatio||1, cssW=c.clientWidth||700, cssH=Math.min(330,cssW*.48);
  c.width=cssW*dpr;c.height=cssH*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,cssW,cssH);
  const miles=plan.map(w=>state.runs.filter(r=>currentTrainingWeek(localDate(r.date))===w.week).reduce((a,r)=>a+Number(r.distance||0),0));
  const max=Math.max(5,...miles,...plan.map(w=>w.weekly)), pad={l:30,r:8,t:16,b:28}, w=cssW-pad.l-pad.r,h=cssH-pad.t-pad.b;
  ctx.strokeStyle='#2a3650';ctx.fillStyle='#94a3b8';ctx.font='10px system-ui';ctx.lineWidth=1;
  for(let i=0;i<=4;i++){ const y=pad.t+h-(h*i/4);ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(cssW-pad.r,y);ctx.stroke();ctx.fillText(String(Math.round(max*i/4)),4,y+3); }
  const barW=w/29*.56;
  miles.forEach((m,i)=>{const x=pad.l+(i+.5)*w/29-barW/2,y=pad.t+h-(m/max*h),bh=m/max*h;ctx.fillStyle='#60a5fa';ctx.fillRect(x,y,barW,bh);if((i+1)%4===1){ctx.fillStyle='#94a3b8';ctx.fillText(String(i+1),x,cssH-9);}});
  const wk=currentTrainingWeek(); if(wk>=1){const x=pad.l+(wk-.5)*w/29;ctx.strokeStyle='#34d399';ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+h);ctx.stroke();}
}
function renderPBs(){
  const targets=[['1 Mile',1],['5K',3.10686],['10K',6.21371],['Half',13.1094]];
  const html=targets.map(([name,dist])=>{
    const eligible=state.runs.filter(r=>Number(r.distance)>=dist*.97 && Number(r.distance)<=dist*1.08).sort((a,b)=>a.durationSec-b.durationSec);
    const best=eligible[0]; return `<div class="pb"><span>${name}</span><strong>${best?fmtDuration(best.durationSec):'—'}</strong></div>`;
  }).join(''); document.getElementById('personalBests').innerHTML=html;
}

function renderAll(){ renderHome(); renderPlan(); renderRecent(); renderProgress(); }
function navigate(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id)); document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===id)); if(id==='progress') setTimeout(drawMileageChart,20); window.scrollTo({top:0,behavior:'smooth'}); }

document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.nav)));
fillWorkoutSelect();
document.getElementById('runDate').value=isoDate(new Date());
['distance','durationHours','durationMinutes','durationSeconds'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{ const d=Number(document.getElementById('distance').value), s=getDurationSeconds(); document.getElementById('pacePreview').textContent=d&&s?fmtPace(s/d):'—'; }));
document.getElementById('runDate').addEventListener('change',e=>{ const wo=workoutForDate(e.target.value); document.getElementById('plannedWorkout').value=wo?wo.key:''; });
document.getElementById('plannedWorkout').addEventListener('change',e=>{ const wo=allWorkouts().find(w=>w.key===e.target.value); if(wo) document.getElementById('runDate').value=wo.date; });
document.getElementById('runForm').addEventListener('submit',e=>{
  e.preventDefault(); const distance=Number(document.getElementById('distance').value), durationSec=getDurationSeconds(); if(!distance||!durationSec){toast('Enter a valid distance and duration');return;}
  const key=document.getElementById('plannedWorkout').value;
  state.runs.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),createdAt:Date.now(),date:document.getElementById('runDate').value,workoutKey:key||null,distance,durationSec,heartRate:Number(document.getElementById('heartRate').value)||null,rpe:Number(document.getElementById('rpe').value)||null,notes:document.getElementById('notes').value.trim(),completed:document.getElementById('completed').checked});
  saveState(); e.target.reset(); document.getElementById('runDate').value=isoDate(new Date()); document.getElementById('completed').checked=true; document.getElementById('pacePreview').textContent='—'; fillWorkoutSelect(); renderAll(); toast('Run saved'); navigate('home');
});
document.getElementById('exportBtn').addEventListener('click',()=>{ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url;a.download=`buddy-run-coach-backup-${isoDate(new Date())}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); });
document.getElementById('importInput').addEventListener('change',async e=>{ const f=e.target.files[0]; if(!f)return; try{const data=JSON.parse(await f.text()); if(!Array.isArray(data.runs))throw new Error(); state=data;saveState();renderAll();toast('Backup imported');}catch{toast('Invalid backup file');} e.target.value=''; });
document.getElementById('clearDataBtn').addEventListener('click',()=>{ if(confirm('Delete all logged runs and stats from this device?')){state={runs:[]};saveState();renderAll();toast('All data cleared');} });

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.getElementById('installBtn').classList.remove('hidden');});
document.getElementById('installBtn').addEventListener('click',async()=>{ if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.getElementById('installBtn').classList.add('hidden');});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
window.addEventListener('resize',()=>{ if(document.getElementById('progress').classList.contains('active')) drawMileageChart(); });
renderAll();
