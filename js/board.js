// Board: card creation, shuffle, flip, match check
function renderBoard(){
  const MG = window.MemoryGame || {};
  const board = document.getElementById('game-board');
  if(!board || !MG.currentDifficulty) return;
  const settings = MG.difficultySettings[MG.currentDifficulty];
  const cols = settings.cols; const rows = settings.rows;
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  const gap = window.innerWidth >= 768 ? 10 : 6; board.style.gap = gap + 'px';
  board.innerHTML = '';

  (MG.cards || []).forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.className = 'card-container cursor-pointer';
    const face = card.face;
    const faceContent = face.type === 'image' ? `<img src="${face.src}" alt="">` : face.value;
    cardElement.innerHTML = `
      <div class="card w-full h-full ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}" data-index="${index}">
        <div class="card-face card-back"></div>
        <div class="card-face card-front">${faceContent}</div>
      </div>`;
    cardElement.onclick = function(){ flipCard(index); };
    board.appendChild(cardElement);
  });
}

function flipCard(index){
  const MG = window.MemoryGame;
  if(!MG) return;
  if(typeof index !== 'number' || !MG.cards || !MG.cards[index]) return;
  if(!MG.gameStarted) return;
  if(MG.gameState !== 'playing') return;
  if(MG.isLocked) return;
  if(MG.cards[index].isFlipped || MG.cards[index].isMatched) return;
  if(MG.flippedCards.includes(index)) return;
  if(MG.flippedCards.length >= 2) return;

  MG.cards[index].isFlipped = true;
  MG.flippedCards.push(index);
  const el = document.querySelector(`[data-index='${index}']`);
  if(el) el.classList.add('flipped');

  if(MG.flippedCards.length === 2){
    // lock input to prevent rapid extra flips until match/mismatch handled
    MG.isLocked = true;
    MG.moves++;
    if(window.updateStats) window.updateStats();
    checkMatch();
  }
}

function checkMatch(){
  const MG = window.MemoryGame;
  if(!MG) return;
  if(!MG.flippedCards || MG.flippedCards.length < 2) return;
  const [first, second] = MG.flippedCards;
  if(typeof first !== 'number' || typeof second !== 'number' || !MG.cards[first] || !MG.cards[second]){ MG.flippedCards = []; MG.isLocked = false; return; }
  if(MG.cards[first].matchKey === MG.cards[second].matchKey){
    if(window.playMatchSound) window.playMatchSound();
    if(window.handleCombo) window.handleCombo(true);
    const points = MG.combo === 1 ? 100 : MG.combo === 2 ? 200 : 400;
    if(window.showFloatingScore) window.showFloatingScore(points);
    MG.cards[first].isMatched = true; MG.cards[second].isMatched = true;
    MG.matchedPairs++;
    setTimeout(()=>{
      const a = document.querySelector(`[data-index='${first}']`);
      const b = document.querySelector(`[data-index='${second}']`);
      if(a) a.classList.add('matched','sparkle'); if(b) b.classList.add('matched','sparkle');
      MG.flippedCards = [];
      if(window.updateStats) window.updateStats();
      MG.isLocked = false;
      const settings = MG.difficultySettings[MG.currentDifficulty];
      if(MG.matchedPairs === settings.pairs){ setTimeout(()=>{ if(window.showWinModal) window.showWinModal(); }, 600); }
    }, 300);
  } else {
    if(window.handleCombo) window.handleCombo(false);
    // MG.isLocked is already true (set by flipCard), keep locked until flip-back completes
    setTimeout(()=>{
      MG.cards[first].isFlipped = false; MG.cards[second].isFlipped = false;
      const a = document.querySelector(`[data-index='${first}']`);
      const b = document.querySelector(`[data-index='${second}']`);
      if(a) a.classList.remove('flipped'); if(b) b.classList.remove('flipped');
      MG.flippedCards = [];
      MG.isLocked = false;
    }, 1000);
  }
}

// Re-render on resize for responsiveness
window.addEventListener('resize', function(){ if(window.MemoryGame && window.MemoryGame.currentDifficulty) renderBoard(); });
