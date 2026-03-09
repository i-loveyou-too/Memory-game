// Main game: state, init, start, preview, modals
(function(){
  const MemoryGame = {
    cards: [], flippedCards: [], matchedPairs:0, moves:0, gameStarted:false,
    timerInterval:null, seconds:0, isLocked:false, currentDifficulty:null, timeLimit:180,
    gameState:'preview', combo:0, maxCombo:0, score:0,
    selectedTheme: window.getSelectedTheme ? window.getSelectedTheme() : 'animals',
    difficultySettings: {
      easy:{ pairs:8, cols:4, rows:4, timeLimit:180, text:'😊 쉬움' },
      normal:{ pairs:10, cols:4, rows:5, timeLimit:180, text:'🎮 보통' },
      hard:{ pairs:15, cols:5, rows:6, timeLimit:180, text:'🔥 어려움' },
      veryhard:{ pairs:20, cols:5, rows:8, timeLimit:180, text:'⚡ 베리 하드' }
    },
    defaultConfig: { game_title: '🧠 메모리 게임', time_limit: 180 }
  };
  window.MemoryGame = MemoryGame;

  function toCardFace(item){ if(typeof item==='string') return { type:'emoji', value:item }; if(item && (item.type==='emoji' || item.type==='image')) return item; return { type:'emoji', value:String(item) }; }
  function getMatchKey(face){ return face.type === 'image' ? face.src : face.value; }

  function initGame(){
    const settings = MemoryGame.difficultySettings[MemoryGame.currentDifficulty];
    const themeCards = (window.THEMES && window.THEMES[MemoryGame.selectedTheme]) || window.THEMES.animals;
    const cardsUsed = themeCards.slice(0, settings.pairs);
    MemoryGame.cards = [...cardsUsed, ...cardsUsed].sort(()=>Math.random()-0.5).map((item, index)=>{
      const face = toCardFace(item);
      return { id:index, face, matchKey:getMatchKey(face), isFlipped:false, isMatched:false };
    });
    MemoryGame.flippedCards = []; MemoryGame.matchedPairs=0; MemoryGame.moves=0; MemoryGame.seconds=0; MemoryGame.gameStarted=false; MemoryGame.isLocked=false; MemoryGame.gameState='countdown'; MemoryGame.combo=0; MemoryGame.maxCombo=0; MemoryGame.score=0;
    if(MemoryGame.timerInterval){ clearInterval(MemoryGame.timerInterval); MemoryGame.timerInterval=null; }
    if(window.updateStats) window.updateStats();
    if(window.renderBoard) window.renderBoard();
  }

  function startCountdown(){
    const overlay = document.getElementById('countdown-overlay');
    if(!overlay) return;

    if(MemoryGame.timerInterval){
      clearInterval(MemoryGame.timerInterval);
      MemoryGame.timerInterval = null;
    }

    let count = 3;
    MemoryGame.seconds = 0;
    MemoryGame.moves = 0;
    MemoryGame.combo = 0;
    MemoryGame.maxCombo = 0;
    MemoryGame.score = 0;
    MemoryGame.gameStarted = false;
    MemoryGame.gameState = 'countdown';
    if(window.updateScore) window.updateScore();
    if(window.updateStats) window.updateStats();

    overlay.classList.remove('hidden', 'go');
    overlay.style.display = 'flex';
    overlay.textContent = count;

    const timer = setInterval(function(){
      count--;
      if(count > 0){
        overlay.textContent = count;
      } else if(count === 0){
        overlay.textContent = 'GO!';
        overlay.classList.add('go');
      } else {
        clearInterval(timer);
        overlay.style.display = 'none';
        overlay.classList.add('hidden');
        overlay.classList.remove('go');
        MemoryGame.gameStarted = true;
        MemoryGame.gameState = 'playing';
        if(window.startTimer) window.startTimer();
        if(window.updateStats) window.updateStats();
      }
    }, 1000);
  }

  function startGame(difficulty){
    MemoryGame.currentDifficulty = difficulty;
    const settings = MemoryGame.difficultySettings[difficulty];
    document.getElementById('difficulty-text').textContent = settings.text;
    MemoryGame.timeLimit = settings.timeLimit || MemoryGame.defaultConfig.time_limit;
    var mainMenuEl = document.getElementById('main-menu');
    var gameScreenEl = document.getElementById('game-screen');
    if(mainMenuEl) mainMenuEl.classList.add('hidden');
    if(gameScreenEl){
      gameScreenEl.classList.remove('hidden');
      gameScreenEl.classList.add('animate-fade-in');
      setTimeout(function(){ gameScreenEl.classList.remove('animate-fade-in'); }, 400);
    }
    initGame();
    MemoryGame.score = 0;
    if(window.updateScore) window.updateScore();
    requestAnimationFrame(()=>{ if(window.renderBoard) window.renderBoard(); });
    setTimeout(()=>{ if(MemoryGame.currentDifficulty){ if(window.renderBoard) window.renderBoard(); startCountdown(); } }, 60);
  }

  function updateScore(){
    const scoreEl = document.getElementById('score-display') || document.getElementById('score');
    if(scoreEl) scoreEl.textContent = MemoryGame.score || 0;
  }

  function updateStats(){
    document.getElementById('moves').textContent = MemoryGame.moves;
    document.getElementById('matches').textContent = MemoryGame.matchedPairs;
    // display calculated score if available
    var sc = (window.calculateScore ? window.calculateScore() : MemoryGame.score || 0);
    MemoryGame.score = sc;
    updateScore();
    const remaining = MemoryGame.gameState === 'preview' ? MemoryGame.timeLimit : Math.max(0, MemoryGame.timeLimit - MemoryGame.seconds);
    document.getElementById('timer').textContent = (window.formatTime ? window.formatTime(remaining) : (Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0')));
    const timerBar = document.getElementById('timer-bar'); if(timerBar){ const pct = MemoryGame.timeLimit>0 ? (remaining/MemoryGame.timeLimit)*100 : 0; timerBar.style.width = pct + '%'; if(remaining <= 30 && remaining > 0 && MemoryGame.gameState === 'playing') timerBar.classList.add('timer-bar-warning'); else timerBar.classList.remove('timer-bar-warning'); }
    const timerContainer = document.getElementById('timer-container'); if(timerContainer){ if(remaining <= 30 && remaining > 0 && MemoryGame.gameState === 'playing') timerContainer.classList.add('time-warning'); else timerContainer.classList.remove('time-warning'); }
  }

  function playMatchSound(){ try{ const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination); osc.frequency.value = 800; osc.type='sine'; gain.gain.setValueAtTime(0.3,audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.2); osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime+0.2);}catch(e){} }
  function playMatchSound(){
    try{
      var audioCtx = window._mg_audio_ctx || null;
      if(!audioCtx){ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); window._mg_audio_ctx = audioCtx; }
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.connect(gain); gain.connect(audioCtx.destination);
      osc.frequency.value = 800; osc.type='sine'; gain.gain.setValueAtTime(0.3,audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.2);
      osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime+0.2);
    }catch(e){}
  }

  function triggerConfetti(){ const container = document.getElementById('confetti-container'); if(!container) return; container.classList.remove('hidden'); container.innerHTML=''; const colors=['#fbbf24','#34d399','#60a5fa','#f472b6','#a78bfa']; for(let i=0;i<50;i++){ const c=document.createElement('div'); c.className='confetti'; c.style.left = Math.random()*100 + '%'; c.style.background = colors[Math.floor(Math.random()*colors.length)]; c.style.animationDelay = Math.random()*0.5 + 's'; c.style.borderRadius = Math.random()>0.5?'50%':'0'; container.appendChild(c); } setTimeout(()=>{ container.classList.add('hidden'); container.innerHTML=''; }, 3000); }

  function showWinModal(){ MemoryGame.gameState='finished'; if(MemoryGame.timerInterval){ clearInterval(MemoryGame.timerInterval); MemoryGame.timerInterval=null; }
    const finalScore = (window.calculateScore ? window.calculateScore() : MemoryGame.score || 0);
    const entry = { score: finalScore, moves: MemoryGame.moves, time: MemoryGame.seconds, difficulty: MemoryGame.currentDifficulty, theme: MemoryGame.selectedTheme, date: Date.now() };
    if(window.Storage) window.Storage.saveRanking(MemoryGame.currentDifficulty, entry);
    const ranking = window.Storage ? window.Storage.getRanking(MemoryGame.currentDifficulty) : [];
    const isNewRecord = ranking.length && ranking[0].score === finalScore && ranking[0].date === entry.date;
    const scoreEl = document.getElementById('win-final-score'); if(scoreEl) scoreEl.textContent = finalScore.toLocaleString();
    const comboEl = document.getElementById('win-final-combo'); if(comboEl) comboEl.textContent = 'x' + MemoryGame.maxCombo;
    const movesEl = document.getElementById('win-final-moves'); if(movesEl) movesEl.textContent = MemoryGame.moves;
    const timeEl = document.getElementById('win-final-time'); if(timeEl) timeEl.textContent = (window.formatTime ? window.formatTime(MemoryGame.seconds) : (MemoryGame.seconds + 's'));
    const diffEl = document.getElementById('win-final-difficulty'); if(diffEl) diffEl.textContent = '난이도: ' + (MemoryGame.difficultySettings[MemoryGame.currentDifficulty] ? MemoryGame.difficultySettings[MemoryGame.currentDifficulty].text : MemoryGame.currentDifficulty);
    const themeEl = document.getElementById('win-final-theme'); if(themeEl) themeEl.textContent = '테마: ' + (MemoryGame.selectedTheme || '-');
    if(isNewRecord){ const badge = document.getElementById('new-record-badge'); if(badge) badge.classList.remove('hidden'); }
    triggerConfetti(); const winModal = document.getElementById('win-modal'); if(winModal) winModal.classList.remove('hidden'); if(window.updateRecordDisplay) window.updateRecordDisplay();
  }

  function showGameOverModal(){ MemoryGame.gameState='finished'; document.getElementById('modal-title').textContent = '시간 초과!'; document.getElementById('final-moves').textContent = MemoryGame.moves; document.getElementById('game-over-modal').classList.remove('hidden'); }

  function restartGame(){
    document.getElementById('game-over-modal').classList.add('hidden');
    document.getElementById('win-modal').classList.add('hidden');
    initGame();
    requestAnimationFrame(function(){
      if(window.renderBoard) window.renderBoard();
      if(MemoryGame.currentDifficulty) startCountdown();
    });
  }
  function goToMenu(){
    if(MemoryGame.timerInterval){ clearInterval(MemoryGame.timerInterval); MemoryGame.timerInterval=null; }
    var gameScreenEl = document.getElementById('game-screen');
    var mainMenuEl = document.getElementById('main-menu');
    if(gameScreenEl) gameScreenEl.classList.add('hidden');
    if(mainMenuEl){
      mainMenuEl.classList.remove('hidden');
      mainMenuEl.classList.add('animate-fade-in');
      setTimeout(function(){ mainMenuEl.classList.remove('animate-fade-in'); }, 400);
    }
    document.getElementById('game-over-modal').classList.add('hidden');
    document.getElementById('win-modal').classList.add('hidden');
    if(window.updateRecordDisplay) window.updateRecordDisplay();
  }
  function closeModal(){ document.getElementById('game-over-modal').classList.add('hidden'); }
  function closeWinModal(){ document.getElementById('win-modal').classList.add('hidden'); }

  // expose
  window.startGame = startGame; window.restartGame = restartGame; window.goToMenu = goToMenu; window.closeModal = closeModal; window.closeWinModal = closeWinModal; window.showWinModal = showWinModal; window.showGameOverModal = showGameOverModal; window.playMatchSound = playMatchSound; window.triggerConfetti = triggerConfetti; window.updateStats = updateStats; window.updateScore = updateScore; window.startCountdown = startCountdown; window.initGame = initGame;

  // UI bindings for elements previously using inline onclick attributes
  function bindUI(){
    try{
      document.querySelectorAll('.theme-btn').forEach(function(btn){
        var key = btn.getAttribute('data-theme');
        if(key){ btn.addEventListener('click', function(){ if(window.setTheme) window.setTheme(key); }); }
      });
      document.querySelectorAll('.difficulty-btn').forEach(function(btn){
        var diff = btn.getAttribute('data-difficulty');
        if(diff){ btn.addEventListener('click', function(){ startGame(diff); }); }
      });
      var rankingBtn = document.getElementById('ranking-btn'); if(rankingBtn) rankingBtn.addEventListener('click', showRankingModal);
      var restartBtn = document.getElementById('restart-btn'); if(restartBtn) restartBtn.addEventListener('click', restartGame);
      var menuBtn = document.getElementById('menu-btn'); if(menuBtn) menuBtn.addEventListener('click', goToMenu);
      var rankingClose = document.getElementById('ranking-close-btn'); if(rankingClose) rankingClose.addEventListener('click', closeRankingModal);
      var gameoverClose = document.getElementById('gameover-close-btn'); if(gameoverClose) gameoverClose.addEventListener('click', closeModal);
      var winClose = document.getElementById('win-close-btn'); if(winClose) winClose.addEventListener('click', closeWinModal);
      var winRestart = document.getElementById('win-restart-btn'); if(winRestart) winRestart.addEventListener('click', function(){ restartGame(); });
      var winMenu = document.getElementById('win-menu-btn'); if(winMenu) winMenu.addEventListener('click', function(){ goToMenu(); });
    }catch(e){ console.error('bindUI failed', e); }
  }

  bindUI();

  // Adjust board wrapper to allow scrolling when viewport height is constrained (iPad/short screens)
  function adjustBoardScrollable(){
    try{
      var wrapper = document.querySelector('.game-board-wrapper');
      var board = document.getElementById('game-board');
      if(!wrapper || !board) return;
      // remove first to re-evaluate
      wrapper.classList.remove('scrollable');
      // small timeout to allow layout to settle after render
      setTimeout(function(){
        if(board.scrollHeight > wrapper.clientHeight){ wrapper.classList.add('scrollable'); }
        else { wrapper.classList.remove('scrollable'); }
      }, 50);
    }catch(e){ console.error('adjustBoardScrollable failed', e); }
  }

  // call on resize and when UI changes
  window.addEventListener('resize', function(){ if(window.requestAnimationFrame) requestAnimationFrame(adjustBoardScrollable); else adjustBoardScrollable(); });
  // ensure initial evaluation
  setTimeout(adjustBoardScrollable, 120);

  // Expose adjustment function for manual calls (tests)
  window.adjustBoardScrollable = adjustBoardScrollable;

  // Wire up some functions used by other modules
  window.formatTime = function(secs){ const mins = Math.floor(secs/60); const s = secs%60; return `${mins}:${s.toString().padStart(2,'0')}`; };

  // Initialize on load
  try{ if(window.getSelectedTheme) MemoryGame.selectedTheme = window.getSelectedTheme(); if(window.updateRecordDisplay) window.updateRecordDisplay(); }catch(e){}

})();
