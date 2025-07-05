// In-memory user storage
const users = {};
let currentUser = null;

function signup() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if (users[u]) {
    document.getElementById('loginStatus').innerText = "User already exists.";
    return;
  }
  users[u] = p;
  document.getElementById('loginStatus').innerText = "Signup successful!";
}

function login() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if (users[u] && users[u] === p) {
    currentUser = u;
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('gameSection').classList.remove('hidden');
    initGame();
  } else {
    document.getElementById('loginStatus').innerText = "Invalid login.";
  }
}

// Simplified linear track (52 cells)
const trackLength = 52;

const players = [
  { id: 'user', name: 'You', tokens: [-1, -1, -1, -1], color: 'user' },
  { id: 'bot1', name: 'Bot 1', tokens: [-1, -1, -1, -1], color: 'bot1' },
  { id: 'bot2', name: 'Bot 2', tokens: [-1, -1, -1, -1], color: 'bot2' },
  { id: 'bot3', name: 'Bot 3', tokens: [-1, -1, -1, -1], color: 'bot3' }
];

let currentPlayerIndex = 0;

function initGame() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let i = 0; i < trackLength; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    board.appendChild(cell);
  }
  updateBoard();
  document.getElementById('status').innerText = `${players[currentPlayerIndex].name}'s turn.`;
}

function updateBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => cell.innerHTML = '');

  players.forEach(player => {
    player.tokens.forEach((pos, idx) => {
      if (pos >= 0 && pos < trackLength) {
        const token = document.createElement('div');
        token.className = 'token ' + player.color;
        token.innerText = idx + 1;
        cells[pos].appendChild(token);
      }
    });
  });
}

function rollDice() {
  const player = players[currentPlayerIndex];
  const dice = Math.floor(Math.random() * 6) + 1;
  document.getElementById('status').innerText = `${player.name} rolled a ${dice}.`;

  setTimeout(() => {
    if (player.id === 'user') {
      userMove(player, dice);
    } else {
      botMove(player, dice);
    }
  }, 500);
}

function userMove(player, dice) {
  let moved = false;

  // Try to bring a token onto the board
  for (let i = 0; i < player.tokens.length; i++) {
    if (player.tokens[i] === -1 && dice === 6) {
      animateMove(player, i, 0);
      moved = true;
      break;
    }
  }

  if (!moved) {
    // Move the first available token
    for (let i = 0; i < player.tokens.length; i++) {
      if (player.tokens[i] >= 0 && player.tokens[i] + dice < trackLength) {
        animateMove(player, i, player.tokens[i] + dice);
        moved = true;
        break;
      }
    }
  }

  if (!moved) {
    document.getElementById('status').innerText += " No move possible.";
    nextTurn(dice);
  }
}

function botMove(player, dice) {
  let moved = false;

  for (let i = 0; i < player.tokens.length; i++) {
    if (player.tokens[i] === -1 && dice === 6) {
      animateMove(player, i, 0);
      moved = true;
      break;
    }
  }

  if (!moved) {
    for (let i = 0; i < player.tokens.length; i++) {
      if (player.tokens[i] >= 0 && player.tokens[i] + dice < trackLength) {
        animateMove(player, i, player.tokens[i] + dice);
        moved = true;
        break;
      }
    }
  }

  if (!moved) {
    setTimeout(() => {
      nextTurn(dice);
    }, 500);
  }
}

function animateMove(player, tokenIndex, target) {
  const current = player.tokens[tokenIndex];
  let step = current + 1;
  const interval = setInterval(() => {
    if (step > target) {
      clearInterval(interval);
      if (checkWin(player)) return;
      nextTurn();
    } else {
      player.tokens[tokenIndex] = step;
      updateBoard();
      step++;
    }
  }, 300);
}

function nextTurn(dice) {
  if (dice === 6) {
    document.getElementById('status').innerText = `${players[currentPlayerIndex].name} rolled 6 and gets another turn.`;
    if (players[currentPlayerIndex].id !== 'user') {
      setTimeout(rollDice, 1000);
    }
    return;
  }
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  const player = players[currentPlayerIndex];
  document.getElementById('status').innerText = `${player.name}'s turn.`;
  if (player.id !== 'user') {
    setTimeout(rollDice, 1000);
  }
}

function checkWin(player) {
  const allHome = player.tokens.every(pos => pos >= trackLength - 1);
  if (allHome) {
    document.getElementById('status').innerText = `${player.name} wins!`;
    document.getElementById('rollButton').disabled = true;
    return true;
  }
  return false;
}
