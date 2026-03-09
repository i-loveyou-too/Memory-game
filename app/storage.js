// LocalStorage wrapper for rankings
(function(){
  const KEY = 'memoryGameRanking';
  function getRanking(difficulty){
    const raw = localStorage.getItem(KEY) || JSON.stringify({easy:[],normal:[],hard:[],veryhard:[]});
    try{ const parsed = JSON.parse(raw); return parsed[difficulty] || []; }catch(e){ return []; }
  }
  function saveRanking(difficulty, entry){
    const raw = localStorage.getItem(KEY) || JSON.stringify({easy:[],normal:[],hard:[],veryhard:[]});
    let parsed;
    try{
      parsed = JSON.parse(raw);
      if(!parsed || typeof parsed !== 'object') parsed = {easy:[],normal:[],hard:[],veryhard:[]};
    }catch(e){
      parsed = {easy:[],normal:[],hard:[],veryhard:[]};
    }
    if(!parsed[difficulty]) parsed[difficulty] = [];
    parsed[difficulty].push(entry);
    // sort by score desc, if tie use date desc to prefer latest record with same score
    parsed[difficulty].sort(function(a,b){ return (b.score - a.score) || (b.date - a.date); });
    parsed[difficulty] = parsed[difficulty].slice(0,10);
    try{ localStorage.setItem(KEY, JSON.stringify(parsed)); }catch(e){ console.error('Failed to save ranking to localStorage', e); }
  }
  window.Storage = { getRanking, saveRanking };
})();
