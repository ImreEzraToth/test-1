const grid = document.getElementById('table-grid');
const tablesPreview = document.getElementById('tables-preview');
const minN = document.getElementById('minN');
const maxN = document.getElementById('maxN');
const unique = document.getElementById('unique');
const countSel = document.getElementById('count');
const startBtn = document.getElementById('start');
const restartBtn = document.getElementById('restart');
const exprEl = document.getElementById('expr');
const ansEl = document.getElementById('answer');
const checkBtn = document.getElementById('check');
const progressEl = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const barEl = document.getElementById('bar');

const preset110 = document.getElementById('preset-1-10');
const preset120 = document.getElementById('preset-1-20');
const addTableBtn = document.getElementById('add-table');
const customTable = document.getElementById('custom-table');
const clearTablesBtn = document.getElementById('clear-tables');

let selectedTables = new Set();
let questions = [];
let idx = 0;
let correct = 0;
let awaitingAnswer = false;

function buildGrid(limit=30){
  grid.innerHTML='';
  for(let i=1;i<=limit;i++){
    const b=document.createElement('div');
    b.className='chip';
    b.textContent=i;
    b.dataset.val=i;
    b.addEventListener('click',()=>toggleTable(i,b));
    grid.appendChild(b);
  }
}
buildGrid();

function toggleTable(n, node){
  if(selectedTables.has(n)){ selectedTables.delete(n); node.classList.remove('sel'); }
  else { selectedTables.add(n); node.classList.add('sel'); }
  updatePreview();
}
function updatePreview(){
  const arr=[...selectedTables].sort((a,b)=>a-b);
  tablesPreview.textContent = arr.length? 'Gekozen tafels: ' + arr.join(', ') : 'Gekozen tafels: —';
}

addTableBtn.addEventListener('click', ()=>{
  const v=parseInt(customTable.value,10);
  if(!isNaN(v) && v>0){
    selectedTables.add(v);
    updatePreview();
    customTable.value='';
  }
});
clearTablesBtn.addEventListener('click',()=>{ selectedTables.clear(); updatePreview(); [...grid.children].forEach(c=>c.classList.remove('sel')); });

preset110.addEventListener('click',()=>{
  selectedTables = new Set([...Array(10)].map((_,i)=>i+1));
  minN.value=1; maxN.value=10;
  [...grid.children].forEach(c=> c.classList.toggle('sel', selectedTables.has(parseInt(c.dataset.val))));
  updatePreview();
});
preset120.addEventListener('click',()=>{
  selectedTables = new Set([...Array(20)].map((_,i)=>i+1));
  minN.value=1; maxN.value=20;
  [...grid.children].forEach(c=> c.classList.toggle('sel', selectedTables.has(parseInt(c.dataset.val))));
  updatePreview();
});

function makeQuestions(){
  const tables=[...selectedTables];
  if(!tables.length){ alert('Kies ten minste één tafel (of gebruik een preset).'); return []; }
  const a = parseInt(minN.value,10) || 1;
  const b = parseInt(maxN.value,10) || 10;
  const lo = Math.min(a,b), hi = Math.max(a,b);
  let pool=[];
  for(const t of tables){
    for(let n=lo;n<=hi;n++){
      pool.push([t,n]);
    }
  }
  if(pool.length===0) return [];
  let want = parseInt(countSel.value,10);
  if(want<=0) want = pool.length; // 0 = alle combinaties
  let qs=[];
  for(let i=0;i<want;i++){
    qs.push(pool[Math.floor(Math.random()*pool.length)]);
  }
  return qs;
}

function showCurrent(){
  if(idx>=questions.length){
    exprEl.textContent='Klaar!';
    progressEl.textContent=`${questions.length}/${questions.length}`;
    barEl.value=barEl.max=questions.length;
    scoreEl.textContent = questions.length? Math.round(100*correct/questions.length)+'%' : '0%';
    awaitingAnswer=false;
    return;
  }
  const [t,n]=questions[idx];
  exprEl.textContent=`${t} × ${n}`;
  ansEl.value=''; ansEl.focus();
  progressEl.textContent = `${idx}/${questions.length}`;
  barEl.max = questions.length; barEl.value = idx;
  scoreEl.textContent = questions.length? Math.round(100*correct/questions.length)+'%' : '0%';
  awaitingAnswer=true;
}
function check(){
  if(idx>=questions.length || !awaitingAnswer) return;
  const [t,n]=questions[idx];
  const val = parseInt(ansEl.value,10);
  if(val===t*n){ correct++; }
  idx++;
  awaitingAnswer=false;
  showCurrent();
}

ansEl.addEventListener('input', ()=>{
  if(!awaitingAnswer || idx>=questions.length) return;
  const [t,n]=questions[idx];
  const val = parseInt(ansEl.value,10);
  if(!Number.isNaN(val) && val === t*n){
    check();
  }
});

startBtn.addEventListener('click', ()=>{
  questions = makeQuestions();
  idx=0; correct=0;
  showCurrent();
});
restartBtn.addEventListener('click', ()=>{
  idx=0; correct=0;
  showCurrent();
});
checkBtn.addEventListener('click', check);
ansEl.addEventListener('keydown', e=>{ if(e.key==='Enter') check(); });
