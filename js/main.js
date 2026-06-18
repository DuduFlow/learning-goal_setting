const STORAGE_KEY = 'goal-setting-learning-v1';

const fieldIds = [
  'goalNow',
  'delayType',
  'smartS',
  'smartM',
  'smartA',
  'smartR',
  'smartT',
  'tinyHabit',
  'habitTime',
  'personName',
  'personType',
  'finalGoal',
  'currentPercent',
  'nextAction'
];

let people = [];
let saveTimer;

function $(id) {
  return document.getElementById(id);
}

function valueOf(id) {
  return $(id)?.value.trim() || '';
}

function esc(text) {
  return (text || '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}

function showToast(message) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function delayAdvice(type, goal) {
  const target = goal || '這個目標';
  const map = {
    start: `把「${target}」縮到 10 分鐘內能開始的版本。今天只做第一步：列出 5 個可能對象、打開名單、或傳出第一則訊息。`,
    face: `把「丟臉」改成「練習樣本」。今天只找一位安全對象演練，目標不是成交，而是讓自己敢說出口。`,
    fail: `先定義失敗也能帶走什麼。今天完成一次行動後，寫下：我做對什麼？我下次要修正什麼？`,
    reject: `把拒絕視為工作回饋。今天只做一個低風險接觸，例如打一通電話或傳一則邀約，不把對方回應解讀成自我否定。`
  };
  return map[type] || map.start;
}

function diagnoseDelay() {
  const goal = valueOf('goalNow');
  const type = $('delayType').value;
  const labels = {
    start: '不知道從哪裡開始',
    face: '怕丟臉',
    fail: '怕失敗',
    reject: '怕被拒絕'
  };
  $('delayOutput').textContent = `目前卡點：${labels[type]}\n\n第一步：${delayAdvice(type, goal)}\n\n提醒：不要把第一步設成「我要變強」，請把它設成今天真的能完成的一個動作。`;
  saveState();
  updateProgress();
  showToast('已產生第一步');
}

function buildSmart() {
  const s = valueOf('smartS') || '尚未填寫';
  const m = valueOf('smartM') || '尚未填寫';
  const a = valueOf('smartA') || '尚未填寫';
  const r = valueOf('smartR') || '尚未填寫';
  const t = valueOf('smartT') || '尚未填寫';
  $('smartOutput').textContent = `我的 SMART 行動稿

S 具體目標：${s}
M 衡量方式：${m}
A 可達成拆解：${a}
R 意義與初衷：${r}
T 完成期限：${t}

本週立刻開始的版本：先做最小可執行行動，完成後立刻復盤，不等有信心才開始。`;
  saveState();
  updateProgress();
  showToast('已產生 SMART 策略');
}

function buildHabit() {
  const habit = valueOf('tinyHabit') || '尚未填寫';
  const time = valueOf('habitTime') || '尚未填寫';
  $('habitOutput').textContent = `我的 21 天飛輪承諾：

我接下來要連續 21 天做的最小行動是：${habit}
我安排的固定時間是：${time}

我不要求第一天就看到成果，只要求自己踩下第一圈。每天完成後，我會記錄一件做對的事，讓信心從行動中長出來。`;
  saveState();
  updateProgress();
  showToast('已產生飛輪承諾');
}

function addPerson() {
  const name = valueOf('personName') || '未命名同行者';
  const type = $('personType').value;
  const risk = type === '負面抱怨' || type === '盲目苦撐';
  people.push({ name, type, risk });
  $('personName').value = '';
  renderPeople();
  saveState();
  updateProgress();
  showToast(risk ? '已加入，也提醒要調整接觸比例' : '已加入五人圈');
}

function removePerson(index) {
  people.splice(index, 1);
  renderPeople();
  saveState();
  updateProgress();
}

function renderPeople() {
  const list = $('circleList');
  if (!list) return;
  if (!people.length) {
    list.innerHTML = '<div class="person"><strong>尚未加入</strong><span>請先盤點最常接觸的 5 個人。</span></div>';
    return;
  }
  list.innerHTML = people.map((person, index) => `
    <div class="person">
      <strong>${esc(person.name)}</strong>
      <span>${esc(person.type)}${person.risk ? '｜建議降低依賴，改找能給方法的人' : '｜值得靠近與學習'}</span>
      <button class="btn btn-soft compact" onclick="removePerson(${index})">移除</button>
    </div>
  `).join('');
}

function checkedCulture() {
  return [...document.querySelectorAll('.culture-check')]
    .filter(input => input.checked)
    .map(input => input.value);
}

function buildFinalPlan() {
  const goal = valueOf('finalGoal') || '尚未填寫';
  const percent = valueOf('currentPercent') || '尚未填寫';
  const action = valueOf('nextAction') || '尚未填寫';
  const smart = $('smartOutput').textContent.includes('我的 SMART') ? $('smartOutput').textContent : 'SMART 尚未完成';
  const habit = $('habitOutput').textContent.includes('21 天') ? $('habitOutput').textContent : '飛輪承諾尚未完成';
  const culture = checkedCulture().join('、') || '尚未勾選';
  $('finalOutput').textContent = `我的下半年目標設定行動稿

一、最想達成的目標
${goal}

二、目前進度
${percent}

三、SMART 策略
${smart}

四、下週立刻開始的行動
${action}

五、飛輪承諾
${habit}

六、我要帶著哪些文化要求自己
${culture}

提醒：問題不會因等待而消失，只會因行動而被處理。開始之後，才有修正與提升能力的機會。`;
  saveState();
  updateProgress();
  showToast('已生成下半年行動稿');
}

function progressItems() {
  return [
    { label: '完成拖延診斷', done: valueOf('goalNow') && $('delayOutput').textContent.includes('第一步') },
    { label: '理解成功者心態', done: window.scrollY > 900 || valueOf('smartS') || valueOf('finalGoal') },
    { label: '完成 SMART 策略', done: ['smartS', 'smartM', 'smartA', 'smartR', 'smartT'].filter(valueOf).length >= 4 && $('smartOutput').textContent.includes('我的 SMART') },
    { label: '建立 21 天飛輪承諾', done: valueOf('tinyHabit') && $('habitOutput').textContent.includes('21 天') },
    { label: '盤點五人圈', done: people.length >= 3 },
    { label: '完成下半年行動稿', done: valueOf('finalGoal') && valueOf('nextAction') && $('finalOutput').textContent.includes('下半年目標設定') }
  ];
}

function updateProgress() {
  const items = progressItems();
  const done = items.filter(item => item.done).length;
  const percent = Math.round(done / items.length * 100);
  $('progressText').textContent = `${percent}%`;
  $('navProgressText').textContent = `${percent}%`;
  $('progressBar').style.width = `${percent}%`;
  $('navProgressBar').style.width = `${percent}%`;
  $('progressList').innerHTML = items.map(item => `<div class="progress-item ${item.done ? 'done' : ''}">${esc(item.label)}</div>`).join('');
}

function gatherState() {
  const values = {};
  fieldIds.forEach(id => {
    const el = $(id);
    if (el) values[id] = el.value;
  });
  return {
    values,
    people,
    delayOutput: $('delayOutput')?.textContent || '',
    smartOutput: $('smartOutput')?.textContent || '',
    habitOutput: $('habitOutput')?.textContent || '',
    finalOutput: $('finalOutput')?.textContent || '',
    cultureChecks: [...document.querySelectorAll('.culture-check')].map(input => input.checked)
  };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gatherState()));
  } catch (err) {
    console.warn('Unable to save state', err);
  }
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveState();
    updateProgress();
  }, 160);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);
    Object.entries(state.values || {}).forEach(([id, value]) => {
      const el = $(id);
      if (el) el.value = value;
    });
    people = Array.isArray(state.people) ? state.people : [];
    if (state.delayOutput) $('delayOutput').textContent = state.delayOutput;
    if (state.smartOutput) $('smartOutput').textContent = state.smartOutput;
    if (state.habitOutput) $('habitOutput').textContent = state.habitOutput;
    if (state.finalOutput) $('finalOutput').textContent = state.finalOutput;
    [...document.querySelectorAll('.culture-check')].forEach((input, index) => {
      input.checked = Boolean(state.cultureChecks?.[index]);
    });
  } catch (err) {
    console.warn('Unable to load state', err);
  }
}

async function copyText(id) {
  const text = $(id)?.textContent.trim();
  if (!text) {
    showToast('目前沒有可複製的內容');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  showToast('已複製');
}

function exportPlan() {
  const text = $('finalOutput').textContent.includes('下半年目標設定')
    ? $('finalOutput').textContent
    : `目標設定學習作業

拖延診斷：
${$('delayOutput').textContent}

SMART：
${$('smartOutput').textContent}

飛輪：
${$('habitOutput').textContent}

五人圈：
${people.map((p, i) => `${i + 1}. ${p.name}｜${p.type}`).join('\n') || '尚未填寫'}
`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '目標設定學習作業.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('已匯出文字檔');
}

function resetAll() {
  if (!confirm('確定要清除這一頁保存的練習內容嗎？')) return;
  localStorage.removeItem(STORAGE_KEY);
  fieldIds.forEach(id => {
    const el = $(id);
    if (el) el.value = '';
  });
  people = [];
  renderPeople();
  document.querySelectorAll('.culture-check').forEach(input => { input.checked = false; });
  $('delayOutput').textContent = '填寫後，這裡會出現一個今天就能做的第一步。';
  $('smartOutput').textContent = '填完 SMART 後，這裡會整理成可以貼到行動筆記裡的策略稿。';
  $('habitOutput').textContent = '完成後，這裡會出現你的 21 天承諾。';
  $('finalOutput').textContent = '完成上方欄位後，這裡會生成一份可帶回去執行的目標設定行動稿。';
  updateProgress();
  showToast('已重新開始');
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderPeople();
  fieldIds.forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', scheduleSave);
    el.addEventListener('change', scheduleSave);
  });
  document.querySelectorAll('.culture-check').forEach(input => input.addEventListener('change', scheduleSave));
  updateProgress();
});
