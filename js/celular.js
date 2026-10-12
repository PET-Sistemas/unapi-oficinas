/* Simulador educativo: nenhum controle altera o dispositivo real. */
(() => {
  "use strict";
  const get = (id) => document.getElementById(id);
  // Ícones Lucide SVG selecionados via Supericons; todos com viewBox coerente.
  const icons = {
    settings:"<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\" /> <circle cx=\"12\" cy=\"12\" r=\"3\" />",
    display:"<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /> <line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\" /> <line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\" />",
    wifi:"<path d=\"M12 20h.01\" /> <path d=\"M2 8.82a15 15 0 0 1 20 0\" /> <path d=\"M5 12.859a10 10 0 0 1 14 0\" /> <path d=\"M8.5 16.429a5 5 0 0 1 7 0\" />",
    bluetooth:"<path d=\"m7 7 10 10-5 5V2l5 5L7 17\" />",
    sound:"<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\" /> <path d=\"M16 9a5 5 0 0 1 0 6\" /> <path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\" />",
    messages:"<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" />",
    clock:"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 6v6l4 2\" />",
    gallery:"<path d=\"m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16\" /> <path d=\"M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2\" /> <circle cx=\"13\" cy=\"7\" r=\"1\" fill=\"currentColor\" /> <rect x=\"8\" y=\"2\" width=\"14\" height=\"14\" rx=\"2\" />",
    apps:"<path d=\"M12 3v18\" /> <path d=\"M3 12h18\" /> <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />",
    info:"<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 16v-4\" /> <path d=\"M12 8h.01\" />",
    search:"<path d=\"m21 21-4.34-4.34\" /> <circle cx=\"11\" cy=\"11\" r=\"8\" />"
  };
  const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (icons[name] || icons.info) + '</svg>';
  const lessons = [
    {title:"Encontre as Configurações",context:"",description:"Abra as Configurações do celular.",hints:["Procure uma engrenagem.","Ela aparece na tela inicial ou em Aplicativos.","Toque em Configurações."],route:"Início → Configurações."},
    {title:"Aumente as letras",context:"Maria quer ler melhor",description:"Encontre o tamanho do texto e aumente as letras.",hints:["Comece pelas Configurações.","Procure a categoria Tela.","Em Tamanho do texto, toque no +."],route:"Configurações → Tela → Tamanho do texto → +."}
  ];
  const initialSettings = () => ({textSize:1,brightness:65,volume:60,wifi:true,bluetooth:false});
  const state = {mode:"guided",mission:0,completed:[false,false],hints:0,showRoute:false,screen:"home",history:[],settings:initialSettings()};
  let feedback = "";
  const phone = get("phone-screen");
  const announce = (message) => {get("celular-announcement").textContent = message;};
  function openScreen(screen) {
    if(state.screen !== screen){state.history.push(state.screen);state.screen=screen;}
    if(state.mode==="guided" && state.mission===0 && screen==="settings") finishMission();
    render();
    const heading=phone.querySelector(".celular-subhead h2");
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
  }
  function goBack(){state.screen=state.history.pop() || "home";render();}
  function goHome(){state.screen="home";state.history=[];render();}
  function finishMission(){
    if(state.completed[state.mission])return;
    state.completed[state.mission]=true;
    feedback=state.mission===0?"Configurações encontradas!":"Pronto! As letras ficaram maiores.";
    announce(feedback);
  }
  function startMission(index){
    state.mission=index;state.hints=0;state.showRoute=false;state.screen="home";state.history=[];
    state.settings=initialSettings();feedback="";render();
    announce("Atividade "+(index+1)+": "+lessons[index].title);
  }
  function resetAll(){state.mode="guided";state.completed=[false,false];startMission(0);}
  const clock = () => new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  const day = () => new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});
  const statusBar = () => '<div class="celular-status"><button type="button" data-open="quick" aria-label="Abrir ajustes rápidos"><span class="celular-status-time">'+clock()+'</span><span class="celular-status-caret" aria-hidden="true">⌄</span></button><span class="celular-camera-cutout" aria-hidden="true"></span><div class="celular-status-icons"><span class="' + (state.settings.wifi?"":"is-off") + '" title="Wi-Fi">' + icon("wifi") + '</span><span class="' + (state.settings.bluetooth?"":"is-off") + '" title="Bluetooth">' + icon("bluetooth") + '</span><span class="celular-signal" aria-label="Sinal móvel"></span><span class="celular-status-battery" aria-label="Bateria 75%"><i></i></span></div></div>';
  function app(name,title,screen){
    return '<button type="button" class="celular-app celular-app--'+name+'" data-open="'+screen+'"><span class="celular-app-symbol">'+icon(name)+'</span><span>'+title+'</span></button>';
  }
  function row(name,title,subtitle,screen){
    return '<button type="button" class="celular-setting-row" data-open="'+screen+'" data-searchable="'+(title+" "+subtitle).toLowerCase()+'"><span class="celular-setting-icon">'+icon(name)+'</span><span class="celular-setting-text"><strong>'+title+'</strong><small>'+subtitle+'</small></span><span class="celular-row-chevron" aria-hidden="true">›</span></button>';
  }
  function section(title,content){
    return '<div class="celular-section"><header class="celular-subhead"><button type="button" class="celular-back" data-back aria-label="Voltar">‹</button><h2>'+title+'</h2></header>'+content+'</div>';
  }
  function phoneHome(drawer){
    const apps = app("settings","Configurações","settings")+app("messages","Mensagens","messages")+app("clock","Relógio","clock")+app("gallery","Fotos","gallery");
    if(drawer)return section("Aplicativos",'<div class="celular-app-drawer"><div class="celular-app-grid">'+apps+'</div></div>');
    return '<div class="celular-home-view"><div class="celular-home-heading"><span class="celular-home-date">'+day()+'</span><strong class="celular-home-clock">'+clock()+'</strong></div><div class="celular-home-bottom"><div class="celular-app-grid">'+apps+app("apps","Aplicativos","apps")+'</div><button type="button" class="celular-search-widget" data-open="settings" aria-label="Pesquisar configurações">'+icon("settings")+' <span>Pesquisar no celular</span><span aria-hidden="true">⌕</span></button></div></div>';
  }
  const toggle = (name,title,explanation) => '<div class="celular-control-row"><div><strong>'+title+'</strong><small>'+explanation+'</small></div><button class="celular-switch" type="button" data-toggle="'+name+'" aria-label="'+title+': '+(state.settings[name]?"ligado":"desligado")+'" aria-pressed="'+state.settings[name]+'">'+(state.settings[name]?"Ligado":"Desligado")+'</button></div>';
  function quickTile(name,label) {
    return '<button class="celular-quick-tile" data-toggle="'+name+'" type="button" aria-pressed="'+state.settings[name]+'"><span class="celular-quick-icon">'+icon(name)+'</span><span>'+label+'</span><small>'+(state.settings[name]?"Ligado":"Desligado")+'</small></button>';
  }
  function settingsHome(){
    return section("Configurações",'<label class="celular-sr-only" for="celular-settings-search">Pesquisar configurações</label><input id="celular-settings-search" class="celular-settings-search" type="search" placeholder="Pesquisar configurações" autocomplete="off"/><p class="celular-settings-label">Ajustes do celular</p><div class="celular-settings-list">'+row("wifi","Conexões","Wi-Fi e Bluetooth","connections")+row("display","Tela","Brilho e tamanho das letras","display")+row("sound","Som e volume","Ajustar o volume","sound")+row("info","Sobre o dispositivo","Informações gerais","about")+'</div><p class="celular-empty" id="celular-search-empty" hidden>Nenhuma opção encontrada. Experimente outra palavra.</p>');
  }
  function displayPage(){
    const size=state.settings.textSize;
    const sizes=["","Padrão","Grande","Muito grande"];
    return section("Tela",
      '<div class="celular-setting-card"><h3>Brilho da tela</h3><p>Escolha a intensidade da tela.</p><label class="celular-setting-line" for="brightness"><strong>Brilho</strong><span>'+state.settings.brightness+'%</span></label><input class="celular-phone-slider" id="brightness" type="range" min="30" max="100" value="'+state.settings.brightness+'" data-range="brightness"/></div>'+
      '<div class="celular-setting-card"><h3>Tamanho do texto</h3><p>Veja as letras mudarem ao tocar em + ou −.</p><div class="celular-font-tools"><button type="button" data-font="-1" aria-label="Diminuir tamanho do texto" '+(size===1?"disabled":"")+'>−</button><output aria-live="polite">'+sizes[size]+'</output><button type="button" data-font="1" aria-label="Aumentar tamanho do texto" '+(size===3?"disabled":"")+'>+</button></div><div class="celular-font-preview"><small>Exemplo de leitura</small>Agora as letras ficam mais fáceis de ler.</div></div>');
  }
  function renderScreen(){
    switch(state.screen){
      case "settings": return settingsHome();
      case "display": return displayPage();
      case "connections": return section("Conexões",toggle("wifi","Wi-Fi","Redes disponíveis")+toggle("bluetooth","Bluetooth","Acessórios sem fio"));
      case "quick": return section("Ajustes rápidos",'<div class="celular-quick-date">'+day()+'</div><div class="celular-quick-grid">'+quickTile("wifi","Wi-Fi")+quickTile("bluetooth","Bluetooth")+'</div><div class="celular-setting-card celular-quick-brightness"><label class="celular-setting-line" for="brightness"><strong>Brilho</strong><span>'+state.settings.brightness+'%</span></label><input class="celular-phone-slider" id="brightness" type="range" min="30" max="100" value="'+state.settings.brightness+'" data-range="brightness" /></div>'+row("settings","Todas as configurações","","settings"));
      case "sound": return section("Som e volume",'<div class="celular-setting-card"><h3>Volume do celular</h3><p>Controle o volume simulado.</p><label class="celular-setting-line" for="volume"><strong>Volume</strong><span>'+state.settings.volume+'%</span></label><input class="celular-phone-slider" type="range" id="volume" min="0" max="100" value="'+state.settings.volume+'" data-range="volume"/></div>');
      case "about": return section("Sobre o dispositivo",'<div class="celular-simple-app"><strong>Informações do dispositivo</strong><p>Versão do sistema: Android</p><p>Armazenamento: 64 GB</p></div>');
      case "messages": return section("Mensagens",'<div class="celular-simple-app"><strong>Maria · 09:12</strong>Bom dia! Vamos nos encontrar mais tarde?</div>');
      case "clock": return section("Relógio",'<div class="celular-simple-app"><strong>'+clock()+'</strong><p>Horário local</p></div>');
      case "gallery": return section("Fotos",'<div class="celular-simple-app"><strong>Fotos</strong><p>Sem imagens recentes.</p></div>');
      case "apps": return phoneHome(true);
      default: return phoneHome(false);
    }
  }
  function renderGuide(){
    const guided=state.mode==="guided";
    get("guide-content").hidden=!guided;
    get("free-content").hidden=guided;
    get("guided-mode").classList.toggle("is-current",guided);
    get("free-mode").classList.toggle("is-current",!guided);
    get("guided-mode").setAttribute("aria-pressed",String(guided));
    get("free-mode").setAttribute("aria-pressed",String(!guided));
    const lesson=lessons[state.mission];
    const count=state.completed.filter(Boolean).length;
    get("mission-count").textContent="Missão "+String(state.mission+1).padStart(2,"0");
    get("mission-progress-text").textContent=count+"/"+lessons.length+" concluídas";
    get("mission-progress").setAttribute("aria-valuenow",String(count));
    get("mission-progress-bar").style.width=(count/lessons.length*100)+"%";
    get("mission-context").textContent=lesson.context;
    get("mission-context").hidden=!lesson.context;
    get("mission-title").textContent=lesson.title;
    get("mission-description").textContent=lesson.description;
    const done=state.completed[state.mission];
    const feedbackEl=get("mission-feedback");
    feedbackEl.classList.toggle("is-success",done);
    feedbackEl.textContent=done?(feedback || (state.mission===0?"Configurações encontradas!":"Letras aumentadas!")):feedback;
    const hint=get("hint-box");
    hint.hidden=state.hints===0&&!state.showRoute;
    hint.textContent=state.showRoute?"Caminho sugerido: "+lesson.route:state.hints?("Dica "+state.hints+": "+lesson.hints[state.hints-1]):"";
    get("hint-button").disabled=state.hints>=lesson.hints.length || done;
    get("hint-button").textContent=state.hints>=lesson.hints.length?"Todas as dicas exibidas":"Quero uma dica";
    get("route-button").textContent=state.showRoute?"Ocultar o caminho":"Mostrar o caminho";
    const next=get("next-mission");
    next.disabled=!done;
    next.textContent=state.mission===lessons.length-1?"Explorar →":"Continuar →";
  }
  function render(){
    const oldScroll=phone.scrollTop;
    phone.style.setProperty("--ui-font",([16,19,22][state.settings.textSize-1])+"px");
    phone.innerHTML=statusBar()+'<div class="celular-phone-body" id="celular-phone-body">'+renderScreen()+'</div>';
    phone.scrollTop=oldScroll;
    const body=get("celular-phone-body");
    body.style.filter="brightness("+(0.80+(state.settings.brightness-30)/70*0.40)+")";
    renderGuide();
  }
  function setMode(mode){
    state.mode=mode;feedback="";render();announce(mode==="free"?"Exploração livre ativada.":"Prática guiada ativada.");
  }
  phone.addEventListener("click",(event)=>{
    const button=event.target.closest("button");
    if(!button)return;
    if(button.hasAttribute("data-back")){goBack();return;}
    if(button.dataset.open){openScreen(button.dataset.open);phone.scrollTop=0;return;}
    if(button.dataset.toggle){
      const key=button.dataset.toggle;state.settings[key]=!state.settings[key];
      render();announce((key==="wifi"?"Wi-Fi":"Bluetooth")+(state.settings[key]?" ligado.":" desligado."));
      return;
    }
    if(button.dataset.font){
      const next=state.settings.textSize+Number(button.dataset.font);
      state.settings.textSize=Math.min(3,Math.max(1,next));
      if(state.mode==="guided"&&state.mission===1&&state.settings.textSize>1)finishMission();
      render();
      const control=phone.querySelector('[data-font="'+button.dataset.font+'"]');
      if(control&&!control.disabled)control.focus({preventScroll:true});
      announce("Tamanho do texto: "+(["","padrão","grande","muito grande"][state.settings.textSize])+".");
    }
  });
  phone.addEventListener("input",(event)=>{
    const target=event.target;
    if(target.id==="celular-settings-search"){
      const normalize=(value)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
      const needle=normalize(target.value.trim());
      let visible=0;
      phone.querySelectorAll("[data-searchable]").forEach((row)=>{
        const match=normalize(row.dataset.searchable).includes(needle);
        row.hidden=!match;if(match)visible++;
      });
      get("celular-search-empty").hidden=visible>0;
    }
    if(target.dataset.range){
      const label=target.parentElement.querySelector(".celular-setting-line span");
      if(label)label.textContent=target.value+"%";
      if(target.dataset.range==="brightness"){
        get("celular-phone-body").style.filter="brightness("+(0.80+(Number(target.value)-30)/70*.40)+")";
      }
    }
  });
  phone.addEventListener("change",(event)=>{
    const key=event.target.dataset.range;
    if(!["brightness","volume"].includes(key))return;
    state.settings[key]=Number(event.target.value);
    render();announce((key==="brightness"?"Brilho":"Volume")+" alterado na simulação.");
  });
  get("phone-back").addEventListener("click",goBack);
  get("phone-home").addEventListener("click",goHome);
  get("phone-apps").addEventListener("click",()=>openScreen("apps"));
  get("guided-mode").addEventListener("click",()=>setMode("guided"));
  get("free-mode").addEventListener("click",()=>setMode("free"));
  get("hint-button").addEventListener("click",()=>{
    state.hints=Math.min(lessons[state.mission].hints.length,state.hints+1);renderGuide();
    announce(lessons[state.mission].hints[state.hints-1]);
  });
  get("route-button").addEventListener("click",()=>{
    state.showRoute=!state.showRoute;renderGuide();
  });
  get("reset-mission").addEventListener("click",()=>{
    state.completed[state.mission]=false;startMission(state.mission);
  });
  get("next-mission").addEventListener("click",()=>{
    if(!state.completed[state.mission])return;
    if(state.mission<lessons.length-1){startMission(state.mission+1);}
    else{setMode("free");goHome();}
  });
  get("reset-all").addEventListener("click",resetAll);
  render();
})();
