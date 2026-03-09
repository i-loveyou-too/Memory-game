// Score: calculation, combo, floating score
function handleCombo(isMatch){
  const MG = window.MemoryGame;
  if(!MG) return;
  if(isMatch){
    MG.combo++;
    MG.maxCombo = Math.max(MG.maxCombo, MG.combo);
    const container = document.getElementById('combo-container');
    container.textContent = '🔥 COMBO x' + MG.combo;
    container.classList.remove('hidden'); container.classList.remove('animate'); container.offsetHeight; container.classList.add('animate');
    setTimeout(()=>{ container.classList.add('hidden'); }, 1000);
  } else { MG.combo = 0; }
}

function showFloatingScore(points){
  const container = document.getElementById('floating-score-container');
  if(!container) return;
  const el = document.createElement('div'); el.className = 'floating-score animate'; el.textContent = '+' + points;
  container.appendChild(el); setTimeout(()=>el.remove(), 1100);
}

function calculateScore(){
  const MG = window.MemoryGame; if(!MG) return 0;
  const settings = MG.difficultySettings[MG.currentDifficulty];
  return Math.max(0, (settings.pairs * 1000) - (MG.moves * 30) - (MG.seconds * 5) + (MG.maxCombo * 200));
}
