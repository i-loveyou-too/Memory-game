// Ranking UI functions using Storage
function showRankingModal(){
  const content = document.getElementById('ranking-content'); if(!content) return;
  content.innerHTML = '';
  // Aggregate all difficulty rankings, annotate difficulty, sort by score desc and take top 5
  const diffs = ['easy','normal','hard','veryhard'];
  let all = [];
  diffs.forEach(d=>{
    const list = window.Storage.getRanking(d) || [];
    list.forEach(item=>{ all.push(Object.assign({}, item, { difficulty: d })); });
  });
  all.sort((a,b)=> (b.score - a.score) || (b.date - a.date));
  const top = all.slice(0,5);
  const ul = document.createElement('ul');
  if(top.length === 0){ ul.innerHTML = '<li class="empty">기록 없음</li>'; }
  else {
    top.forEach((entry,i)=>{
      const li = document.createElement('li');
      const timeStr = (window.formatTime && typeof entry.time === 'number') ? window.formatTime(entry.time) : (entry.time + 's');
      const dateStr = entry.date ? new Date(entry.date).toLocaleString() : '-';
      const diffLabel = ({easy:'EASY',normal:'NORMAL',hard:'HARD',veryhard:'VERY'}[entry.difficulty] || entry.difficulty);
      const themeStr = entry.theme ? `· 테마: ${entry.theme}` : '';
      li.textContent = `${i+1}. ${entry.score.toLocaleString()} · ${diffLabel} · ${entry.moves}회 · ${timeStr} ${themeStr} · ${dateStr}`;
      ul.appendChild(li);
    });
  }
  const header = document.createElement('div'); header.className = 'label'; header.textContent = '🏆 TOP 5';
  content.appendChild(header); content.appendChild(ul);
  document.getElementById('ranking-modal').classList.remove('hidden');
}

function closeRankingModal(){ const el = document.getElementById('ranking-modal'); if(el) el.classList.add('hidden'); }

function updateRecordDisplay(){ ['easy','normal','hard','veryhard'].forEach(diff=>{
  const list = window.Storage.getRanking(diff); const el = document.getElementById(diff+'-record'); if(!el) return; if(list.length) el.textContent = `최고점: ${list[0].score.toLocaleString()}`; else el.textContent = '아직 기록이 없어요';
}); }

window.showRankingModal = showRankingModal;
window.closeRankingModal = closeRankingModal;
window.updateRecordDisplay = updateRecordDisplay;
