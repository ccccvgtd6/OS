import { Chess } from 'https://unpkg.com/chess.js@1.4.0/dist/esm/chess.js';

const $ = (selector) => document.querySelector(selector);
const boardEl = $('#board');
const moveListEl = $('#moveList');
const files = ['a','b','c','d','e','f','g','h'];
const glyphs = { w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'}, b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'} };
const pieceValues = { p:100,n:320,b:335,r:500,q:900,k:0 };

const translations = {
  ar:{
    offlineReady:'جاهز للعب',eyebrow:'مساحة هادئة لعقول استراتيجية',heroTitle:'كل نقلة',heroAccent:'تصنع فرقًا.',heroCopy:'ركّز، خطّط، واستمتع بالشطرنج على طريقتك.',heroNote:'فكّر بهدوء.<br />العب بذكاء.',
    boardLabel:'رقعة اللعب',matchTitle:'المباراة الحالية',boardSideTop:'MESA CHESS CLUB',whiteCaptured:'الأبيض أخذ',blackCaptured:'الأسود أخذ',undo:'تراجع',flip:'قلب الرقعة',newGame:'مباراة جديدة',
    setupKicker:'إعداد المباراة',setupTitle:'اختر أسلوبك',modeLabel:'طريقة اللعب',vsComputer:'ضد الكمبيوتر',twoPlayers:'لاعبان محليًا',sideLabel:'لونك',whiteSide:'الأبيض',blackSide:'الأسود',
    levelLabel:'المستوى',easy:'سهل',medium:'متوسط',hard:'متقدم',computerHint:'أنت تلعب بالأبيض. الكمبيوتر يلعب بالأسود.',blackHint:'أنت تلعب بالأسود. الكمبيوتر يبدأ بالأبيض.',localHint:'تبادل الأدوار مع صديق على الجهاز نفسه.',
    statusKicker:'حالة اللعب',statusTitle:'على الرقعة الآن',live:'مباشر',historyKicker:'تسلسل المباراة',historyTitle:'سجل النقلات',moveNumber:'#',whiteMove:'الأبيض',blackMove:'الأسود',
    emptyHistory:'ستظهر النقلات هنا بعد بداية المباراة.',tipTitle:'نصيحة صغيرة',tipCopy:'قبل كل نقلة، اسأل نفسك: ماذا يهدد خصمي؟',footerText:'صُمّم للتركيز، وصُنع للاستمتاع.',
    white:'الأبيض',black:'الأسود',you:'أنت',computer:'الكمبيوتر',playerTwo:'اللاعب الثاني',yourTurn:'دورك الآن',computerThinking:'الكمبيوتر يفكر...',whiteToMove:'دور الأبيض',blackToMove:'دور الأسود',
    check:'كش!',checkmate:'كش مات — فاز {winner}.',stalemate:'تعادل — وضعية جمود.',draw:'انتهت المباراة بالتعادل.',checkText:'الملك في حالة كش.',startText:'المباراة جاهزة. حان وقت أول نقلة.',
    whiteWins:'الأبيض',blackWins:'الأسود',newConfirm:'بدء مباراة جديدة؟ سيتم مسح سجل النقلات الحالي.',waiting:'بانتظار نقلة اللاعب.',noMoves:'لا توجد نقلات للتراجع عنها.',capturedNone:'—',boardAria:'رقعة شطرنج'
  },
  en:{
    offlineReady:'Ready to play',eyebrow:'A quiet space for strategic minds',heroTitle:'Every move',heroAccent:'makes a mark.',heroCopy:'Focus, plan, and enjoy chess your way.',heroNote:'Think calmly.<br />Play wisely.',
    boardLabel:'THE BOARD',matchTitle:'Current match',boardSideTop:'MESA CHESS CLUB',whiteCaptured:'White captured',blackCaptured:'Black captured',undo:'Undo',flip:'Flip board',newGame:'New game',
    setupKicker:'MATCH SETUP',setupTitle:'Choose your game',modeLabel:'Game mode',vsComputer:'Vs computer',twoPlayers:'Local players',sideLabel:'Your side',whiteSide:'White',blackSide:'Black',
    levelLabel:'Difficulty',easy:'Easy',medium:'Medium',hard:'Advanced',computerHint:'You play White. The computer plays Black.',blackHint:'You play Black. The computer moves first.',localHint:'Take turns with a friend on the same device.',
    statusKicker:'GAME STATUS',statusTitle:'At the board',live:'LIVE',historyKicker:'MATCH TIMELINE',historyTitle:'Move history',moveNumber:'#',whiteMove:'White',blackMove:'Black',
    emptyHistory:'Moves will appear here once the game begins.',tipTitle:'A small reminder',tipCopy:'Before each move, ask yourself: what is my opponent threatening?',footerText:'Designed for focus. Made to be enjoyed.',
    white:'White',black:'Black',you:'You',computer:'Computer',playerTwo:'Player 2',yourTurn:'Your turn',computerThinking:'Computer is thinking...',whiteToMove:'White to move',blackToMove:'Black to move',
    check:'Check!',checkmate:'Checkmate — {winner} wins.',stalemate:'Draw — stalemate.',draw:'The game ended in a draw.',checkText:'The king is in check.',startText:'The board is ready. Make your first move.',
    whiteWins:'White',blackWins:'Black',newConfirm:'Start a new game? The current move history will be cleared.',waiting:'Waiting for the player to move.',noMoves:'There are no moves to undo.',capturedNone:'—',boardAria:'Chess board'
  }
};

let game = new Chess();
let mode = 'computer';
let playerColor = 'w';
let difficulty = 2;
let flipped = false;
let selectedSquare = null;
let legalTargets = [];
let language = 'ar';
let aiTimer = null;
let thinking = false;

function t(key){ return translations[language][key] ?? key; }

function setLanguage(next){
  language = next;
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  $('#languageToggle').textContent = language === 'ar' ? 'EN' : 'عربي';
  document.querySelectorAll('[data-i18n]').forEach((element)=>{
    const key = element.dataset.i18n;
    if(translations[language][key] !== undefined) element.innerHTML = translations[language][key];
  });
  boardEl.setAttribute('aria-label',t('boardAria'));
  render();
}

function isHumanTurn(){ return mode === 'local' || game.turn() === playerColor; }
function squareIsSelectable(square){
  const piece = game.get(square);
  return Boolean(piece && piece.color === game.turn() && isHumanTurn() && !game.isGameOver() && !thinking);
}
function algebraicAt(row,col){
  const fileIndex = flipped ? 7-col : col;
  const rank = flipped ? row+1 : 8-row;
  return files[fileIndex] + rank;
}

function renderBoard(){
  const board = game.board();
  const last = game.history({verbose:true}).slice(-1)[0];
  const checkedKing = game.isCheck() ? board.flat().find((piece)=>piece && piece.type === 'k' && piece.color === game.turn())?.square : null;
  const squares = [];
  for(let row=0;row<8;row++){
    for(let col=0;col<8;col++){
      const square = algebraicAt(row,col);
      const piece = board[8-Number(square[1])][files.indexOf(square[0])];
      const isLight = (files.indexOf(square[0]) + Number(square[1])) % 2 === 0;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'square ' + (isLight ? 'light' : 'dark');
      button.dataset.square = square;
      button.setAttribute('role','gridcell');
      button.setAttribute('aria-label',square + (piece ? ', ' + (piece.color === 'w' ? 'white ' : 'black ') + piece.type : ''));
      if(selectedSquare === square) button.classList.add('selected');
      if(last && (last.from === square || last.to === square)) button.classList.add('last-move');
      if(checkedKing === square) button.classList.add('in-check');
      if(piece){
        const glyph = document.createElement('span');
        glyph.className = 'piece ' + (piece.color === 'w' ? 'white-piece-glyph' : 'black-piece-glyph');
        glyph.textContent = glyphs[piece.color][piece.type];
        button.append(glyph);
      }
      if(row === 0){
        const rankLabel = document.createElement('span'); rankLabel.className = 'coordinate rank-coordinate'; rankLabel.textContent = square[1]; button.append(rankLabel);
      }
      if(col === 7){
        const fileLabel = document.createElement('span'); fileLabel.className = 'coordinate file-coordinate'; fileLabel.textContent = square[0]; button.append(fileLabel);
      }
      const target = legalTargets.find((move)=>move.to === square);
      if(target){
        const marker = document.createElement('span'); marker.className = piece ? 'capture-ring' : 'move-dot'; button.append(marker);
      }
      button.draggable = squareIsSelectable(square);
      squares.push(button);
    }
  }
  boardEl.replaceChildren(...squares);
}

function getEndMessage(){
  if(game.isCheckmate()){
    const winner = game.turn() === 'w' ? t('blackWins') : t('whiteWins');
    return {text:t('checkmate').replace('{winner}',winner),ended:true};
  }
  if(game.isStalemate()) return {text:t('stalemate'),ended:true};
  if(game.isDraw()) return {text:t('draw'),ended:true};
  if(game.isCheck()) return {text:t('checkText'),ended:false};
  return {text:game.history().length ? t('waiting') : t('startText'),ended:false};
}

function renderStatus(){
  const turn = game.turn();
  const isComputerTurn = mode === 'computer' && turn !== playerColor && !game.isGameOver();
  $('#turnText').textContent = thinking || isComputerTurn ? t('computerThinking') : (turn === 'w' ? t('whiteToMove') : t('blackToMove'));
  $('#turnBadge').classList.toggle('computer-turn',thinking || isComputerTurn);
  $('#whitePlayerName').textContent = t('white');
  $('#blackPlayerName').textContent = t('black');
  $('#whitePlayerSub').textContent = mode === 'local' ? t('you') + ' / ' + t('playerTwo') : (playerColor === 'w' ? t('you') : t('computer'));
  $('#blackPlayerSub').textContent = mode === 'local' ? t('you') + ' / ' + t('playerTwo') : (playerColor === 'b' ? t('you') : t('computer'));
  $('#whiteTurnMark').classList.toggle('active',turn === 'w' && !game.isGameOver());
  $('#blackTurnMark').classList.toggle('active',turn === 'b' && !game.isGameOver());
  const end = getEndMessage();
  let message = end.text;
  if(!end.ended && thinking) message = t('computerThinking');
  else if(!end.ended && isHumanTurn() && game.history().length) message = t('yourTurn') + (game.isCheck() ? ' · ' + t('check') : '');
  else if(!end.ended && isComputerTurn) message = t('computerThinking');
  $('#gameMessage').lastElementChild.textContent = message;
  $('#moveCounter').textContent = String(Math.ceil(game.history().length/2)).padStart(2,'0') + ' / ' + String(game.history().length).padStart(2,'0');
  $('#historyCount').textContent = game.history().length;
  $('#undoButton').disabled = game.history().length === 0 || thinking;
}

function renderHistory(){
  const moves = game.history({verbose:true});
  if(!moves.length){
    const empty = document.createElement('div'); empty.className = 'empty-history'; empty.textContent = t('emptyHistory'); moveListEl.replaceChildren(empty); return;
  }
  const rows = [];
  for(let i=0;i<moves.length;i+=2){
    const row = document.createElement('div'); row.className = 'move-row';
    const number = document.createElement('span'); number.className = 'move-no'; number.textContent = String(Math.floor(i/2)+1).padStart(2,'0');
    const white = document.createElement('span'); white.textContent = moves[i].san;
    if(i === moves.length-1) white.className = 'latest';
    const black = document.createElement('span'); black.textContent = moves[i+1] ? moves[i+1].san : '·';
    if(i+1 === moves.length-1) black.className = 'latest';
    row.append(number,white,black); rows.push(row);
  }
  moveListEl.replaceChildren(...rows); moveListEl.scrollTop = moveListEl.scrollHeight;
}

function renderCaptured(){
  const whiteCaptured = []; const blackCaptured = [];
  for(const move of game.history({verbose:true})){
    if(!move.captured) continue;
    const victimColor = move.color === 'w' ? 'b' : 'w';
    (move.color === 'w' ? whiteCaptured : blackCaptured).push(glyphs[victimColor][move.captured]);
  }
  $('#whiteCaptured').textContent = whiteCaptured.length ? whiteCaptured.join(' ') : t('capturedNone');
  $('#blackCaptured').textContent = blackCaptured.length ? blackCaptured.join(' ') : t('capturedNone');
}

function render(){
  renderBoard(); renderStatus(); renderHistory(); renderCaptured();
}

function clearSelection(){ selectedSquare = null; legalTargets = []; }
function selectSquare(square){ selectedSquare = square; legalTargets = game.moves({square,verbose:true}); renderBoard(); }

function makeMove(from,to){
  if(!isHumanTurn() || thinking || game.isGameOver()) return false;
  try{
    const move = game.move({from,to,promotion:'q'});
    if(!move) return false;
    clearSelection(); render(); scheduleComputerMove(); return true;
  }catch{return false;}
}

function handleSquare(square){
  if(!isHumanTurn() || thinking || game.isGameOver()) return;
  const piece = game.get(square);
  if(selectedSquare && legalTargets.some((move)=>move.to === square)){
    if(makeMove(selectedSquare,square)) return;
  }
  if(piece && piece.color === game.turn()) selectSquare(square);
  else{ clearSelection(); renderBoard(); }
}

function evaluateWhite(position){
  if(position.isCheckmate()) return position.turn() === 'w' ? -100000 : 100000;
  if(position.isDraw()) return 0;
  let score = 0;
  const board = position.board();
  for(let row=0;row<8;row++){
    for(let col=0;col<8;col++){
      const piece = board[row][col]; if(!piece) continue;
      const sign = piece.color === 'w' ? 1 : -1;
      const center = 3.5 - (Math.abs(3.5-row)+Math.abs(3.5-col))/2;
      let positional = 0;
      if(piece.type === 'n' || piece.type === 'b') positional = center * (piece.type === 'n' ? 8 : 4);
      if(piece.type === 'p') positional = (piece.color === 'w' ? 6-row : row-1)*5 + center*2;
      if(piece.type === 'q') positional = center*2;
      score += sign * (pieceValues[piece.type] + positional);
    }
  }
  if(position.isCheck()) score += position.turn() === 'w' ? -22 : 22;
  return score;
}

function minimax(position,depth,alpha,beta){
  if(depth === 0 || position.isGameOver()) return evaluateWhite(position);
  const moves = position.moves({verbose:true}).sort((a,b)=>Number(Boolean(b.captured))-Number(Boolean(a.captured)));
  if(position.turn() === 'w'){
    let best = -Infinity;
    for(const move of moves){
      const child = new Chess(position.fen()); child.move({from:move.from,to:move.to,promotion:move.promotion || 'q'});
      best = Math.max(best,minimax(child,depth-1,alpha,beta)); alpha = Math.max(alpha,best); if(beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for(const move of moves){
    const child = new Chess(position.fen()); child.move({from:move.from,to:move.to,promotion:move.promotion || 'q'});
    best = Math.min(best,minimax(child,depth-1,alpha,beta)); beta = Math.min(beta,best); if(beta <= alpha) break;
  }
  return best;
}

function chooseComputerMove(){
  const moves = game.moves({verbose:true}).sort((a,b)=>Number(Boolean(b.captured))-Number(Boolean(a.captured)));
  if(!moves.length) return null;
  const maximizing = game.turn() === 'w';
  let bestScore = maximizing ? -Infinity : Infinity; let bestMoves = [];
  for(const move of moves){
    const child = new Chess(game.fen()); child.move({from:move.from,to:move.to,promotion:move.promotion || 'q'});
    const score = minimax(child,difficulty-1,-Infinity,Infinity);
    const better = maximizing ? score > bestScore : score < bestScore;
    if(better){bestScore = score;bestMoves=[move];}
    else if(score === bestScore) bestMoves.push(move);
  }
  return bestMoves[Math.floor(Math.random()*bestMoves.length)] || moves[0];
}

function scheduleComputerMove(){
  if(aiTimer) clearTimeout(aiTimer);
  if(mode !== 'computer' || game.isGameOver() || game.turn() === playerColor){
    thinking = false; renderStatus(); return;
  }
  thinking = true; clearSelection(); render();
  aiTimer = setTimeout(()=>{
    try{
      const move = chooseComputerMove();
      if(move) game.move({from:move.from,to:move.to,promotion:'q'});
    }finally{
      thinking = false; aiTimer = null; render();
    }
  },280);
}

function updateModeControls(){
  document.querySelectorAll('[data-mode]').forEach((button)=>button.classList.toggle('active',button.dataset.mode === mode));
  $('#colorSelect').disabled = mode === 'local';
  $('#difficultySelect').disabled = mode === 'local';
  $('#difficultyBlock').style.opacity = mode === 'local' ? '.45' : '1';
  const hintKey = mode === 'local' ? 'localHint' : (playerColor === 'w' ? 'computerHint' : 'blackHint');
  $('#modeHint').lastElementChild.innerHTML = t(hintKey);
}

function newGame(confirmReset){
  if(confirmReset && game.history().length && !window.confirm(t('newConfirm'))) return;
  if(aiTimer) clearTimeout(aiTimer);
  aiTimer = null; game = new Chess(); thinking = false; clearSelection();
  flipped = mode === 'computer' && playerColor === 'b';
  updateModeControls(); render(); scheduleComputerMove();
}

function undoMove(){
  if(!game.history().length || thinking) return;
  if(mode === 'computer'){
    game.undo();
    if(game.turn() !== playerColor && game.history().length) game.undo();
  }else game.undo();
  clearSelection(); thinking = false; render();
}

boardEl.addEventListener('click',(event)=>{
  const square = event.target.closest('[data-square]');
  if(square) handleSquare(square.dataset.square);
});
boardEl.addEventListener('dragstart',(event)=>{
  const square = event.target.closest('[data-square]');
  if(!square || !squareIsSelectable(square.dataset.square)){event.preventDefault();return;}
  selectedSquare = square.dataset.square; legalTargets = game.moves({square:selectedSquare,verbose:true});
  event.dataTransfer.setData('text/plain',selectedSquare); event.dataTransfer.effectAllowed = 'move'; renderBoard();
});
boardEl.addEventListener('dragover',(event)=>{if(event.target.closest('[data-square]')) event.preventDefault();});
boardEl.addEventListener('drop',(event)=>{
  event.preventDefault(); const target = event.target.closest('[data-square]');
  const from = event.dataTransfer.getData('text/plain');
  if(target && from) makeMove(from,target.dataset.square);
});

document.querySelectorAll('[data-mode]').forEach((button)=>button.addEventListener('click',()=>{mode=button.dataset.mode;newGame(false);}));
$('#colorSelect').addEventListener('change',(event)=>{playerColor=event.target.value;newGame(false);});
$('#difficultySelect').addEventListener('change',(event)=>{difficulty=Number(event.target.value);if(mode==='computer') newGame(false);});
$('#undoButton').addEventListener('click',undoMove);
$('#flipButton').addEventListener('click',()=>{flipped=!flipped;renderBoard();});
$('#newGameButton').addEventListener('click',()=>newGame(true));
$('#languageToggle').addEventListener('click',()=>setLanguage(language==='ar'?'en':'ar'));

updateModeControls(); setLanguage('ar'); render(); scheduleComputerMove();
