// Multiplayer Almanca Oyunu - JavaScript
class MultiplayerGame {
  constructor() {
    this.socket = null;
    this.currentScreen = 'login';
    this.playerName = '';
    this.currentLobby = null;
    this.isHost = false;
    this.gameTimer = null;
    this.currentQuestion = null;
    this.isMyTurn = false;
    
    this.init();
  }

  init() {
    this.initElements();
    this.attachEventListeners();
    this.connectToServer();
  }

  initElements() {
    // Screens
    this.screens = {
      login: document.getElementById('loginScreen'),
      lobbyList: document.getElementById('lobbyListScreen'),
      lobby: document.getElementById('lobbyScreen'),
      game: document.getElementById('gameScreen'),
      results: document.getElementById('resultsScreen'),
      gameEnd: document.getElementById('gameEndScreen')
    };

    // Check if all screens are found
    Object.keys(this.screens).forEach(screenName => {
      if (!this.screens[screenName]) {
        console.error(`❌ Screen element not found: ${screenName}Screen`);
      }
    });

    // Login Screen
    this.playerNameInput = document.getElementById('playerName');
    this.loginBtn = document.getElementById('loginBtn');
    this.connectionStatus = document.getElementById('connectionStatus');

    // Lobby List Screen
    this.currentPlayerNameEl = document.getElementById('currentPlayerName');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.createLobbyBtn = document.getElementById('createLobbyBtn');
    this.refreshBtn = document.getElementById('refreshBtn');
    this.lobbiesList = document.getElementById('lobbiesList');
    this.noLobbies = document.getElementById('noLobbies');

    // Create Lobby Modal
    this.createLobbyModal = document.getElementById('createLobbyModal');
    this.closeCreateModal = document.getElementById('closeCreateModal');
    this.confirmCreateBtn = document.getElementById('confirmCreateBtn');
    this.maxPlayersSelect = document.getElementById('maxPlayersSelect');
    this.questionCountSelect = document.getElementById('questionCountSelect');
    this.timeLimitSelect = document.getElementById('timeLimitSelect');

    // Lobby Screen
    this.currentLobbyId = document.getElementById('currentLobbyId');
    this.leaveLobbyBtn = document.getElementById('leaveLobbyBtn');
    this.lobbyPlayerCount = document.getElementById('lobbyPlayerCount');
    this.lobbyQuestionCount = document.getElementById('lobbyQuestionCount');
    this.lobbyTimeLimit = document.getElementById('lobbyTimeLimit');
    this.playersGrid = document.getElementById('playersGrid');
    this.readyBtn = document.getElementById('readyBtn');
    this.gameCountdown = document.getElementById('gameCountdown');
    
    // Timer elementleri
    this.timerDisplay = document.querySelector('.timer-display');
    this.timerValue = document.getElementById('timeLeft');
    
    // ULTRA SAFE Timer sistemi
    this.myIndependentTimer = null;
    this.timerActive = false;
    this.currentTimeLeft = 0;
    
    // Backward compatibility
    this.currentTimer = null;
    this.allTimers = [];

    // Check lobby elements
    const lobbyElements = {
      'currentLobbyId': this.currentLobbyId,
      'leaveLobbyBtn': this.leaveLobbyBtn,
      'lobbyPlayerCount': this.lobbyPlayerCount,
      'lobbyQuestionCount': this.lobbyQuestionCount,
      'lobbyTimeLimit': this.lobbyTimeLimit,
      'playersGrid': this.playersGrid,
      'readyBtn': this.readyBtn,
      'gameCountdown': this.gameCountdown
    };

    Object.keys(lobbyElements).forEach(elementName => {
      if (!lobbyElements[elementName]) {
        console.error(`❌ Lobby element not found: ${elementName}`);
      }
    });

    // Game Screen
    this.questionProgress = document.getElementById('questionProgress');
    this.gameScores = document.getElementById('gameScores');
    this.turkishWord = document.getElementById('turkishWord');
    this.timeLeft = document.getElementById('timeLeft');
    this.turnInfo = document.getElementById('turnInfo');
    this.answersGrid = document.getElementById('answersGrid');
    this.waitingMessage = document.getElementById('waitingMessage');

    // Results Screen
    this.correctAnswer = document.getElementById('correctAnswer');
    this.playerResults = document.getElementById('playerResults');
    this.nextQuestionCountdown = document.getElementById('nextQuestionCountdown');

    // Game End Screen
    this.gameWinner = document.getElementById('gameWinner');
    this.finalScores = document.getElementById('finalScores');
    this.playAgainBtn = document.getElementById('playAgainBtn');
    this.backToLobbiesBtn = document.getElementById('backToLobbiesBtn');

    // Toast
    this.toast = document.getElementById('toast');
    this.toastMessage = document.getElementById('toastMessage');
  }

  attachEventListeners() {
    // Login
    this.loginBtn.addEventListener('click', () => this.login());
    this.playerNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.login();
    });

    // Lobby List
    this.logoutBtn.addEventListener('click', () => this.logout());
    this.createLobbyBtn.addEventListener('click', () => this.openCreateLobbyModal());
    this.refreshBtn.addEventListener('click', () => this.refreshLobbies());

    // Create Lobby Modal
    this.closeCreateModal.addEventListener('click', () => this.closeCreateLobbyModal());
    this.confirmCreateBtn.addEventListener('click', () => this.createLobby());

    // Lobby
    this.leaveLobbyBtn.addEventListener('click', () => this.leaveLobby());
    this.readyBtn.addEventListener('click', () => this.toggleReady());

    // Game
    this.answersGrid.addEventListener('click', (e) => {
      if (e.target.classList.contains('answer-option')) {
        this.selectAnswer(e.target);
      }
    });

    // Game End
    this.playAgainBtn.addEventListener('click', () => this.playAgain());
    this.backToLobbiesBtn.addEventListener('click', () => this.backToLobbies());

    // Modal close on outside click
    window.addEventListener('click', (e) => {
      if (e.target === this.createLobbyModal) {
        this.closeCreateLobbyModal();
      }
    });
  }

  connectToServer() {
    // Railway production server
    this.socket = io('https://almanca-multiplayer-oyun-production.up.railway.app');

    this.socket.on('connect', () => {
      console.log('Sunucuya bağlandı');
      this.updateConnectionStatus('🟢 Sunucuya bağlandı', 'connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Sunucudan bağlantı kesildi');
      this.updateConnectionStatus('🔴 Bağlantı kesildi', 'disconnected');
    });

    // Lobby olayları
    this.socket.on('lobbies_updated', (lobbies) => {
      this.updateLobbiesList(lobbies);
    });

    this.socket.on('lobby_joined', (lobby) => {
      console.log('🏛️ Lobby joined event received:', lobby);
      console.log('🔍 Current screen before:', this.currentScreen);
      console.log('👥 Lobby players:', lobby.players);
      console.log('🎮 Lobby game state:', lobby.gameState);
      
      this.currentLobby = lobby;
      this.isHost = lobby.hostId === this.socket.id;
      console.log('🎯 Is host:', this.isHost);
      
      // Host player'ın ready durumunu kontrol et
      const hostPlayer = lobby.players.find(p => p.id === lobby.hostId);
      console.log('👑 Host player:', hostPlayer);
      
      console.log('📱 Switching to lobby screen...');
      
      try {
        this.showScreen('lobby');
        console.log('✅ Screen switch completed');
      } catch (error) {
        console.error('❌ Error switching screen:', error);
      }
      
      console.log('🔍 Current screen after:', this.currentScreen);
      console.log('🔄 Updating lobby info...');
      
      try {
        this.updateLobbyInfo(lobby);
        console.log('✅ Lobby info updated');
      } catch (error) {
        console.error('❌ Error updating lobby info:', error);
      }
      
      this.showToast(`${lobby.id.slice(-6)} odasına katıldınız!`);
    });

    this.socket.on('lobby_updated', (lobby) => {
      this.currentLobby = lobby;
      this.updateLobbyInfo(lobby);
    });

    // Oyun olayları
    this.socket.on('game_countdown', (count) => {
      console.log('⏰ Game countdown event received:', count);
      this.showCountdown(count);
      console.log('✅ Countdown displayed:', count);
    });

    this.socket.on('game_started', (lobby) => {
      console.log('🎮 Game started event received:', lobby);
      console.log('🔍 Current screen before game start:', this.currentScreen);
      
      try {
        console.log('📱 Switching to game screen...');
        this.showScreen('game');
        console.log('✅ Game screen switch completed');
        
        console.log('🙈 Hiding countdown...');
        this.gameCountdown.style.display = 'none';
        
        console.log('🎉 Showing success toast...');
        this.showToast('Oyun başladı! 🎮');
        
        console.log('🔍 Current screen after game start:', this.currentScreen);
        
      } catch (error) {
        console.error('❌ Error in game_started handler:', error);
      }
    });

    this.socket.on('new_question', (data) => {
      console.log('❓ New question received:', data);
      this.showNewQuestion(data);
      
      // Her oyuncu kendi bağımsız timer'ını başlatır
      this.startIndependentTimer(data.timeLimit, data.currentPlayer.id === this.socket.id);
    });

    this.socket.on('turn_changed', (data) => {
      console.log('🔄 Turn changed:', data);
      this.updateTurn(data);
      
      // Her oyuncu kendi timer'ını bağımsız başlatır
      this.startIndependentTimer(data.timeLimit || 15, data.currentPlayer.id === this.socket.id);
    });

    this.socket.on('question_results', (data) => {
      console.log('📊 Question results received:', data);
      
      // Skorları güncelle
      if (data.scores && this.currentLobby) {
        data.scores.forEach(scoreData => {
          const player = this.currentLobby.players.find(p => p.id === scoreData.id);
          if (player) {
            player.score = scoreData.score;
          }
        });
        console.log('🎯 Scores updated in currentLobby:', this.currentLobby.players.map(p => `${p.name}: ${p.score}`));
        this.updateGameScores();
      }
      
      this.showQuestionResults(data);
    });

    this.socket.on('player_timeout', (data) => {
      console.log('⏰ Player timeout:', data);
      this.showToast(`${data.playerName}: ${data.message}`, 'warning');
    });

    this.socket.on('game_finished', (data) => {
      this.showGameEnd(data);
    });

    // Hata olayları
    this.socket.on('error', (message) => {
      this.showToast(message, 'error');
    });
  }

  // Login metodları
  login() {
    const name = this.playerNameInput.value.trim();
    if (!name) {
      this.showToast('Lütfen adınızı girin!', 'error');
      return;
    }

    if (name.length < 2 || name.length > 20) {
      this.showToast('Ad 2-20 karakter arasında olmalı!', 'error');
      return;
    }

    this.playerName = name;
    this.socket.emit('register', name);
    this.currentPlayerNameEl.textContent = name;
    this.showScreen('lobbyList');
    this.showToast(`Hoş geldin ${name}! 👋`);
  }

  logout() {
    this.socket.disconnect();
    this.playerName = '';
    this.currentLobby = null;
    this.isHost = false;
    this.showScreen('login');
    this.playerNameInput.value = '';
    this.connectToServer();
  }

  // Lobby List metodları
  updateLobbiesList(lobbies) {
    if (lobbies.length === 0) {
      this.lobbiesList.style.display = 'none';
      this.noLobbies.style.display = 'block';
      return;
    }

    this.lobbiesList.style.display = 'block';
    this.noLobbies.style.display = 'none';

    this.lobbiesList.innerHTML = '';
    lobbies.forEach(lobby => {
      const lobbyItem = this.createLobbyItem(lobby);
      this.lobbiesList.appendChild(lobbyItem);
    });
  }

  createLobbyItem(lobby) {
    const div = document.createElement('div');
    div.className = 'lobby-item';
    div.onclick = () => this.joinLobby(lobby.id);

    let statusClass = 'waiting';
    let statusText = 'Bekliyor';
    
    if (lobby.gameState === 'playing') {
      statusClass = 'playing';
      statusText = 'Oyunda';
    } else if (lobby.currentPlayers >= lobby.maxPlayers) {
      statusClass = 'full';
      statusText = 'Dolu';
    }

    div.innerHTML = `
      <div class="lobby-header-info">
        <div class="lobby-name">🏛️ Oda ${lobby.id.slice(-6)}</div>
        <div class="lobby-status ${statusClass}">${statusText}</div>
      </div>
      <div class="lobby-details">
        <div class="lobby-players">${lobby.currentPlayers}/${lobby.maxPlayers} oyuncu</div>
        <div>${lobby.gameSettings.questionCount} soru • ${lobby.gameSettings.timeLimit}s</div>
      </div>
    `;

    if (lobby.gameState === 'playing' || lobby.currentPlayers >= lobby.maxPlayers) {
      div.style.opacity = '0.6';
      div.style.cursor = 'not-allowed';
      div.onclick = null;
    }

    return div;
  }

  joinLobby(lobbyId) {
    console.log('🚪 Attempting to join lobby:', lobbyId);
    console.log('🔌 Socket connected:', this.socket.connected);
    this.socket.emit('join_lobby', lobbyId);
    console.log('📡 Join lobby event sent');
  }

  refreshLobbies() {
    // Sunucu otomatik olarak lobby listesini güncelleyecek
    this.showToast('Lobby listesi yenilendi 🔄');
  }

  // Create Lobby metodları
  openCreateLobbyModal() {
    this.createLobbyModal.style.display = 'block';
  }

  closeCreateLobbyModal() {
    this.createLobbyModal.style.display = 'none';
  }

  createLobby() {
    const maxPlayers = parseInt(this.maxPlayersSelect.value);
    const questionCount = parseInt(this.questionCountSelect.value);
    const timeLimit = parseInt(this.timeLimitSelect.value);

    this.socket.emit('create_lobby', {
      maxPlayers: maxPlayers,
      gameSettings: {
        questionCount: questionCount,
        timeLimit: timeLimit
      }
    });

    this.closeCreateLobbyModal();
  }

  // Lobby metodları
  updateLobbyInfo(lobby) {
    console.log('🔄 Updating lobby info:', lobby);
    
    if (!this.currentLobbyId) {
      console.error('❌ currentLobbyId element not found!');
      return;
    }
    
    this.currentLobbyId.textContent = lobby.id.slice(-6);
    this.lobbyPlayerCount.textContent = `${lobby.currentPlayers}/${lobby.maxPlayers}`;
    this.lobbyQuestionCount.textContent = lobby.gameSettings.questionCount;
    this.lobbyTimeLimit.textContent = `${lobby.gameSettings.timeLimit}s`;

    console.log('👥 Updating players grid...');
    this.updatePlayersGrid(lobby.players);
  }

  updatePlayersGrid(players) {
    console.log('👥 Updating players grid with players:', players);
    this.playersGrid.innerHTML = '';
    
    players.forEach(player => {
      const playerCard = document.createElement('div');
      playerCard.className = 'player-card';
      
      if (player.isHost) {
        playerCard.classList.add('host');
      }
      
      if (player.ready) {
        playerCard.classList.add('ready');
      }

      let statusText = player.isHost ? '👑 Host' : (player.ready ? '✅ Hazır' : '⏳ Bekliyor');
      let statusClass = player.isHost ? 'host' : (player.ready ? 'ready' : 'not-ready');

      playerCard.innerHTML = `
        <div class="player-name">${player.name}</div>
        <div class="player-status ${statusClass}">${statusText}</div>
        <div class="player-score">Skor: ${player.score}</div>
      `;

      this.playersGrid.appendChild(playerCard);
    });

    // Ready butonunu güncelle
    const currentPlayer = players.find(p => p.id === this.socket.id);
    console.log('🎯 Current player:', currentPlayer);
    console.log('🔌 Socket ID:', this.socket.id);
    
    if (currentPlayer) {
      if (currentPlayer.ready) {
        this.readyBtn.textContent = '✋ Hazır Değilim';
        this.readyBtn.classList.add('not-ready');
        console.log('✅ Ready button set to: Hazır Değilim');
      } else {
        this.readyBtn.textContent = '✅ Hazırım';
        this.readyBtn.classList.remove('not-ready');
        console.log('🔄 Ready button set to: Hazırım');
      }
      
      // Ready butonunu göster - force visibility
      this.readyBtn.style.display = 'block';
      this.readyBtn.style.visibility = 'visible';
      this.readyBtn.style.opacity = '1';
      console.log('👁️ Ready button made visible');
      console.log('🔍 Ready button styles:', {
        display: this.readyBtn.style.display,
        visibility: this.readyBtn.style.visibility,
        opacity: this.readyBtn.style.opacity
      });
      
    } else {
      console.error('❌ Current player not found in players list!');
      // Eğer oyuncu bulunamazsa butonu gizle
      this.readyBtn.style.display = 'none';
      console.log('🙈 Ready button hidden - player not found');
    }
  }

  toggleReady() {
    console.log('🔄 Toggle ready clicked!');
    console.log('🔍 Current lobby:', this.currentLobby);
    console.log('🔍 Is host:', this.isHost);
    console.log('🔍 Players in lobby:', this.currentLobby?.players?.length);
    this.socket.emit('toggle_ready');
  }

  leaveLobby() {
    this.socket.emit('leave_lobby');
    this.currentLobby = null;
    this.isHost = false;
    this.showScreen('lobbyList');
    this.showToast('Odadan ayrıldınız');
  }

  showCountdown(count) {
    console.log('⏰ ShowCountdown called with:', count);
    console.log('🔍 Countdown element:', this.gameCountdown);
    
    this.gameCountdown.style.display = 'block';
    this.gameCountdown.querySelector('.countdown-number').textContent = count;
    this.readyBtn.style.display = 'none';
    
    console.log('✅ Countdown UI updated:', count);
  }

  // ULTRA SAFE BAĞIMSIZ TIMER SİSTEMİ
  startIndependentTimer(timeLimit, isMyTurn) {
    console.log(`🚀 ULTRA SAFE Timer Start: ${timeLimit}s, isMyTurn: ${isMyTurn}, PlayerID: ${this.socket.id}`);
    
    // CRITICAL: Önceki tüm timer'ları kesinlikle durdur
    this.stopIndependentTimer();
    this.forceStopAllTimers();
    
    // Timer state'i sıfırla
    this.timerActive = false;
    this.currentTimeLeft = timeLimit;
    
    // Sadece sıradaki oyuncu için timer başlat
    if (isMyTurn) {
      this.timerActive = true;
      this.updateTimerDisplay(timeLimit);
      this.showTimer();
      console.log(`👁️ MY TURN - Timer visible for ${this.socket.id}`);
      
      // Safe timer başlat
      this.startSafeTimer(timeLimit);
    } else {
      this.hideTimer();
      console.log(`🙈 NOT MY TURN - Timer hidden for ${this.socket.id}`);
    }
  }

  // Güvenli timer başlatma
  startSafeTimer(initialTime) {
    let timeLeft = initialTime;
    
    this.myIndependentTimer = setInterval(() => {
      // Double safety check
      if (!this.timerActive || timeLeft <= 0) {
        console.log(`⚠️ Safety stop: active=${this.timerActive}, timeLeft=${timeLeft}`);
        this.stopIndependentTimer();
        return;
      }
      
      timeLeft--;
      this.currentTimeLeft = timeLeft;
      
      console.log(`⏰ SAFE Timer tick: ${timeLeft} for ${this.socket.id}`);
      
      // Display güncelle (sadece aktifse)
      if (this.timerActive && timeLeft >= 0) {
        this.updateTimerDisplay(timeLeft);
      }
      
      // Timer bittiğinde
      if (timeLeft <= 0) {
        console.log(`⏰ Timer finished safely for ${this.socket.id}`);
        this.stopIndependentTimer();
        this.hideTimer();
      }
      
    }, 1000);
    
    console.log(`⏰ SAFE Timer started: ID ${this.myIndependentTimer} for ${this.socket.id}`);
  }

  // Acil durum: Tüm timer'ları durdur
  forceStopAllTimers() {
    // Bu oyuncunun tüm timer'larını durdur
    for (let i = 1; i <= 1000; i++) {
      clearInterval(i);
    }
    
    this.timerActive = false;
    this.currentTimeLeft = 0;
    console.log(`🔥 FORCE STOP all timers for ${this.socket.id}`);
  }

  stopIndependentTimer() {
    console.log(`🛑 Stopping independent timer for ${this.socket.id}`);
    
    // Timer'ı durdur
    if (this.myIndependentTimer) {
      clearInterval(this.myIndependentTimer);
      console.log(`⏰ Timer stopped: ID ${this.myIndependentTimer} for ${this.socket.id}`);
      this.myIndependentTimer = null;
    }
    
    // Timer state'i temizle
    this.timerActive = false;
    this.currentTimeLeft = 0;
    
    console.log(`✅ Timer state cleaned for ${this.socket.id}`);
  }

  // Eski timer metodları (backward compatibility)
  startTimer(timeLimit) {
    this.startIndependentTimer(timeLimit, true);
  }

  stopTimer() {
    // Backward compatibility - bağımsız timer'ı durdur
    this.stopIndependentTimer();
    
    // Eski timer sistemi de temizle
    if (this.currentTimer) {
      clearInterval(this.currentTimer);
      console.log(`⏰ Legacy timer ${this.currentTimer} cleared`);
      this.currentTimer = null;
    }
    
    // Ek güvenlik: timer array'i de temizle
    if (this.allTimers) {
      this.allTimers.forEach(timer => clearInterval(timer));
      this.allTimers = [];
    }
    
    console.log('⏰ All timers stopped');
  }

  updateTimerDisplay(seconds) {
    // ULTRA SAFE display update
    if (!this.timerValue || !this.timerActive || seconds < 0) {
      console.log(`⚠️ Skipping timer update - invalid state: value=${!!this.timerValue}, active=${this.timerActive}, seconds=${seconds}`);
      return;
    }
    
    console.log(`⏰ SAFE display update: ${seconds} for ${this.socket.id}`);
    this.timerValue.textContent = Math.max(0, seconds); // Negatif değer asla gösterme
    
    // Son 5 saniyede kırmızı yap
    if (seconds <= 5 && seconds >= 0) {
      this.timerDisplay.classList.add('warning');
    } else {
      this.timerDisplay.classList.remove('warning');
    }
  }

  showTimer() {
    if (this.timerDisplay) {
      this.timerDisplay.style.display = 'block';
      console.log('👁️ Timer display shown');
    }
  }

  hideTimer() {
    if (this.timerDisplay) {
      this.timerDisplay.style.display = 'none';
      this.timerDisplay.classList.remove('warning');
      console.log('🙈 Timer display hidden');
    }
  }

  // Game metodları
  showNewQuestion(data) {
    this.currentQuestion = data;
    this.questionProgress.textContent = `Soru ${data.questionIndex + 1}/${data.totalQuestions}`;
    this.turkishWord.textContent = data.question.turkce;
    
    // Cevap seçeneklerini güncelle
    const answerButtons = this.answersGrid.querySelectorAll('.answer-option');
    answerButtons.forEach((btn, index) => {
      btn.textContent = data.question.options[index];
      btn.dataset.answer = data.question.options[index];
      btn.disabled = false;
      btn.classList.remove('selected');
    });

    // Skorları güncelle
    this.updateGameScores();

    // Turn bilgisini güncelle
    this.updateTurn(data);

    // Timer'ı başlat
    this.startGameTimer(data.timeLimit);

    this.showScreen('game');
  }

  updateTurn(data) {
    const currentPlayer = data.currentPlayer;
    this.isMyTurn = currentPlayer.id === this.socket.id;

    console.log(`🔄 Turn update: ${currentPlayer.name}, isMyTurn: ${this.isMyTurn}`);

    if (this.isMyTurn) {
      this.turnInfo.innerHTML = `<span class="current-player">SİRA SİZDE!</span>`;
    } else {
      this.turnInfo.innerHTML = `<span class="current-player">${currentPlayer.name}</span> düşünüyor...`;
    }

    // Eğer benim sıram değilse butonları devre dışı bırak
    const answerButtons = this.answersGrid.querySelectorAll('.answer-option');
    answerButtons.forEach(btn => {
      btn.disabled = !this.isMyTurn;
      btn.classList.remove('selected');
    });

    if (this.isMyTurn) {
      this.waitingMessage.style.display = 'none';
      this.answersGrid.style.display = 'grid';
      
      // Timer zaten startIndependentTimer ile kontrol ediliyor
      console.log('⏰ My turn - timer already managed independently');
    } else {
      this.waitingMessage.style.display = 'block';
      this.answersGrid.style.display = 'none';
      
      // Timer zaten startIndependentTimer ile kontrol ediliyor
      console.log('🙈 Not my turn - timer already managed independently');
    }
  }

  updateGameScores() {
    if (!this.currentLobby) return;

    this.gameScores.innerHTML = '';
    this.currentLobby.players.forEach(player => {
      const scoreItem = document.createElement('div');
      scoreItem.className = 'score-item';
      scoreItem.textContent = `${player.name}: ${player.score}`;
      this.gameScores.appendChild(scoreItem);
    });
  }

  startGameTimer(timeLimit) {
    let time = timeLimit;
    this.timeLeft.textContent = time;
    
    // Timer rengini sıfırla
    this.timeLeft.parentElement.className = 'timer-display';

    this.gameTimer = setInterval(() => {
      time--;
      this.timeLeft.textContent = time;

      // Renk değişimleri
      if (time <= 5) {
        this.timeLeft.parentElement.className = 'timer-display danger';
      } else if (time <= 10) {
        this.timeLeft.parentElement.className = 'timer-display warning';
      }

      if (time <= 0) {
        clearInterval(this.gameTimer);
        // Zaman doldu, otomatik geçiş sunucu tarafında yapılacak
      }
    }, 1000);
  }

  selectAnswer(button) {
    if (!this.isMyTurn) return;

    // Önceki seçimi temizle
    this.answersGrid.querySelectorAll('.answer-option').forEach(btn => {
      btn.classList.remove('selected');
    });

    // Yeni seçimi işaretle
    button.classList.add('selected');

    // Cevabı sunucuya gönder
    const answer = button.dataset.answer;
    console.log(`💬 Submitting answer: ${answer}`);
    this.socket.emit('submit_answer', answer);

    // ULTRA SAFE: Kendi timer'ımı kesinlikle durdur
    console.log(`💬 Answer submitted by ${this.socket.id}: ${answer}`);
    this.forceStopAllTimers();
    this.stopIndependentTimer();
    this.hideTimer();
    
    console.log(`✅ Answer submitted, timer FORCE STOPPED for ${this.socket.id}`);

    // Butonları devre dışı bırak
    this.answersGrid.querySelectorAll('.answer-option').forEach(btn => {
      btn.disabled = true;
    });

    this.showToast('Cevabınız kaydedildi! ✅');
  }

  showQuestionResults(data) {
    this.showScreen('results');
    
    // Doğru cevabı göster
    this.correctAnswer.querySelector('span').textContent = data.correctAnswer;

    // Oyuncu sonuçlarını göster
    this.playerResults.innerHTML = '';
    data.results.forEach(result => {
      const resultItem = document.createElement('div');
      resultItem.className = `result-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
      
      const icon = result.isCorrect ? '✅' : '❌';
      const answerText = result.answer || 'Cevap verilmedi';
      
      resultItem.innerHTML = `
        <div class="result-player">
          <span class="result-icon">${icon}</span>
          <span>${result.playerName}: ${answerText}</span>
        </div>
        <div class="result-score">${result.score} puan</div>
      `;
      
      this.playerResults.appendChild(resultItem);
    });

    // Sonraki soru countdown'u
    let countdown = 3;
    this.nextQuestionCountdown.textContent = countdown;
    
    const countdownInterval = setInterval(() => {
      countdown--;
      this.nextQuestionCountdown.textContent = countdown;
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }

  showGameEnd(data) {
    this.showScreen('gameEnd');

    // Kazananı göster
    if (data.winners.length === 1) {
      this.gameWinner.innerHTML = `Kazanan: <span>${data.winners[0].name}</span>`;
    } else {
      const winnerNames = data.winners.map(w => w.name).join(', ');
      this.gameWinner.innerHTML = `Beraberlik: <span>${winnerNames}</span>`;
    }

    // Final skorlarını göster
    this.finalScores.innerHTML = '';
    data.finalScores.sort((a, b) => b.score - a.score).forEach((player, index) => {
      const scoreItem = document.createElement('div');
      scoreItem.className = 'final-score-item';
      
      const position = index + 1;
      const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
      
      scoreItem.innerHTML = `
        <span>${medal} ${player.name}</span>
        <span>${player.score} puan</span>
      `;
      
      this.finalScores.appendChild(scoreItem);
    });
  }

  playAgain() {
    this.showScreen('lobby');
    this.showToast('Tekrar oynayabilmek için hazır olun! 🎮');
  }

  backToLobbies() {
    this.leaveLobby();
  }

  // Utility metodları
  showScreen(screenName) {
    console.log(`📺 ShowScreen called with: ${screenName}`);
    console.log('📺 Available screens:', Object.keys(this.screens));
    
    // Tüm ekranları gizle
    Object.values(this.screens).forEach(screen => {
      if (screen) {
        screen.style.display = 'none';
        console.log('🙈 Hidden screen:', screen.id);
      }
    });

    // Seçilen ekranı göster
    if (this.screens[screenName]) {
      console.log(`✅ Showing screen: ${screenName}`);
      console.log('🔍 Screen element:', this.screens[screenName]);
      console.log('🔍 Screen display before:', this.screens[screenName].style.display);
      
      this.screens[screenName].style.display = 'flex';
      this.currentScreen = screenName;
      
      console.log('🔍 Screen display after:', this.screens[screenName].style.display);
      
      // Double-check ile DOM'u force et
      setTimeout(() => {
        if (this.screens[screenName].style.display !== 'flex') {
          console.warn('⚠️ Screen display not set properly, forcing...');
          this.screens[screenName].style.display = 'flex';
          this.screens[screenName].style.visibility = 'visible';
          this.screens[screenName].style.opacity = '1';
        }
      }, 100);
      
    } else {
      console.error(`❌ Screen not found: ${screenName}`);
      console.log('❌ All available screens:', Object.keys(this.screens));
    }
  }

  updateConnectionStatus(message, status) {
    this.connectionStatus.textContent = message;
    this.connectionStatus.className = `connection-status ${status}`;
  }

  showToast(message, type = 'info') {
    this.toastMessage.textContent = message;
    this.toast.classList.add('show');
    
    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 3000);
  }
}

// Sayfa yüklendiğinde oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
  window.multiplayerGame = new MultiplayerGame();
  
  // Debug: Global fonksiyonlar
  window.debugShowLobby = () => {
    console.log('🔧 Manual lobby screen show triggered');
    window.multiplayerGame.showScreen('lobby');
  };
  
  window.debugShowGame = () => {
    console.log('🔧 Manual game screen show triggered');
    window.multiplayerGame.showScreen('game');
  };
  
  window.debugForceGameStart = () => {
    console.log('🔧 Manual game start triggered');
    window.multiplayerGame.showScreen('game');
    window.multiplayerGame.gameCountdown.style.display = 'none';
  };
  
  window.debugShowScreens = () => {
    console.log('📺 All screens:', Object.keys(window.multiplayerGame.screens));
    Object.keys(window.multiplayerGame.screens).forEach(screenName => {
      const screen = window.multiplayerGame.screens[screenName];
      console.log(`${screenName}:`, screen ? `exists (display: ${screen.style.display})` : 'NOT FOUND');
    });
  };
}); 