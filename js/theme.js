// Lightweight theme selector utility
(function(){
  var _selected = 'animals';
  function setTheme(themeKey){
    _selected = themeKey;
    // if MemoryGame exists attach
    if(window.MemoryGame) window.MemoryGame.selectedTheme = themeKey;
    document.querySelectorAll('.theme-btn').forEach(function(btn){
      btn.classList.toggle('theme-selected', btn.getAttribute('data-theme')===themeKey);
    });
  }
  function getTheme(){ return _selected; }
  window.setTheme = setTheme;
  window.getSelectedTheme = getTheme;
})();
