const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const namesEl = document.getElementById('names');
const countEl = document.getElementById('count');
const resultEl = document.getElementById('result');
const spinBtn = document.getElementById('spin');
const shuffleBtn = document.getElementById('shuffle');
const resetBtn = document.getElementById('reset');
const mapTypeEl = document.getElementById('mapType');
const pointerEl = document.getElementById('pointer');

const baseNames = ['전시기', '오스틴', '지노', '홍박사'];
const maps = {
  classic: {
    colors: ['#60a5fa', '#f472b6', '#34d399', '#f59e0b', '#a78bfa', '#fb7185', '#22d3ee', '#f97316'],
    bg: '#ffffff',
    text: '#ffffff',
    pointer: '#ef4444'
  },
  night: {
    colors: ['#1d4ed8', '#0f766e', '#7c3aed', '#be185d', '#0369a1', '#047857', '#6d28d9', '#b45309'],
    bg: '#0f172a',
    text: '#e2e8f0',
    pointer: '#38bdf8'
  },
  candy: {
    colors: ['#fb7185', '#f9a8d4', '#fdba74', '#fde68a', '#86efac', '#93c5fd', '#a5b4fc', '#f0abfc'],
    bg: '#fff7ed',
    text: '#1f2937',
    pointer: '#fb7185'
  },
  sunset: {
    colors: ['#ef4444', '#f97316', '#f59e0b', '#fb7185', '#ec4899', '#f43f5e', '#dc2626', '#ea580c'],
    bg: '#fff1f2',
    text: '#ffffff',
    pointer: '#b91c1c'
  },
  aurora: {
    colors: ['#0ea5e9', '#14b8a6', '#22c55e', '#84cc16', '#06b6d4', '#10b981', '#3b82f6', '#6366f1'],
    bg: '#ecfeff',
    text: '#f8fafc',
    pointer: '#0f766e'
  }
};

let wheelRotation = 0;
let spinning = false;
let currentMap = 'classic';

const getNames = () => namesEl.value.split(/\n+/).map((v) => v.trim()).filter(Boolean);

const setNames = (list) => {
  namesEl.value = list.join('\n');
  update();
};

function updateCount(list) {
  countEl.textContent = `${list.length}명`;
}

function applyMapTheme() {
  const map = maps[currentMap];
  canvas.style.background = map.bg;
  pointerEl.style.borderTopColor = map.pointer;
}

function draw(list) {
  const n = Math.max(list.length, 1);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 350;
  const map = maps[currentMap];
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(wheelRotation);

  for (let i = 0; i < n; i += 1) {
    const start = (Math.PI * 2 / n) * i;
    const end = start + (Math.PI * 2 / n);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = map.colors[i % map.colors.length];
    ctx.fill();

    ctx.save();
    ctx.rotate(start + (end - start) / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = map.text;
    ctx.font = '700 30px sans-serif';
    ctx.fillText(list[i] || '항목', radius - 24, 10);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(0, 0, 110, 0, Math.PI * 2);
  ctx.fillStyle = map.bg;
  ctx.fill();
  ctx.restore();
}

function getWinner(list) {
  const n = list.length;
  if (!n) return '-';
  const normalized = ((wheelRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const pointerAngle = (Math.PI * 1.5 - normalized + Math.PI * 2) % (Math.PI * 2);
  const idx = Math.floor(pointerAngle / (Math.PI * 2 / n)) % n;
  return list[idx];
}

function spin() {
  const list = getNames();
  if (list.length < 2 || spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  const start = performance.now();
  const duration = 4500;
  const begin = wheelRotation;
  const extra = (Math.PI * 2) * (7 + Math.random() * 3) + Math.random() * Math.PI * 2;

  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 4);
    wheelRotation = begin + extra * eased;
    draw(list);
    if (t < 1) {
      requestAnimationFrame(tick);
      return;
    }
    spinning = false;
    spinBtn.disabled = false;
    resultEl.textContent = `결과: ${getWinner(list)}`;
  };
  requestAnimationFrame(tick);
}

function update() {
  const list = getNames();
  updateCount(list);
  applyMapTheme();
  draw(list);
}

namesEl.addEventListener('input', update);
mapTypeEl.addEventListener('change', () => {
  currentMap = mapTypeEl.value;
  update();
});
spinBtn.addEventListener('click', spin);
shuffleBtn.addEventListener('click', () => {
  const list = getNames();
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  setNames(list);
});
resetBtn.addEventListener('click', () => {
  setNames(baseNames);
  resultEl.textContent = '결과: -';
  wheelRotation = 0;
  currentMap = 'classic';
  mapTypeEl.value = 'classic';
  draw(getNames());
});

update();
