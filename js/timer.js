// Timer: start/stop and UI update
function startTimer(){
  const MG = window.MemoryGame; if(!MG) return;
  if(MG.timerInterval) clearInterval(MG.timerInterval);
  MG.timerInterval = setInterval(()=>{
    if(MG.gameState !== 'playing') return;
    MG.seconds++;
    if(MG.seconds >= MG.timeLimit){ clearInterval(MG.timerInterval); MG.timerInterval = null; if(window.showGameOverModal) window.showGameOverModal(); return; }
    if(window.updateStats) window.updateStats();
  }, 1000);
}

function stopTimer(){ const MG = window.MemoryGame; if(!MG) return; if(MG.timerInterval) { clearInterval(MG.timerInterval); MG.timerInterval = null; } }

// Export a single `window.formatTime` if not already provided by other modules
if(!window.formatTime){
  window.formatTime = function(totalSeconds){ const mins = Math.floor(totalSeconds/60); const secs = totalSeconds%60; return `${mins}:${secs.toString().padStart(2,'0')}`; };
}
