const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('mobil'));

// Oyun verileri
let lobbies = new Map();
let players = new Map();

// Sorular yükleme
let questions = [];
try {
  const questionsFile = fs.readFileSync(path.join(__dirname, 'mobil', 'sorular.json'), 'utf8');
  questions = JSON.parse(questionsFile);
  console.log(`${questions.length} soru yüklendi`);
} catch (error) {
  console.error('Sorular yüklenemedi:', error);
}

// Lobby sınıfı
class Lobby {
  constructor(id, hostId, hostName, maxPlayers = 4) {
    this.id = id;
    this.hostId = hostId;
    this.maxPlayers = maxPlayers;
    this.players = [{
      id: hostId,
      name: hostName,
      ready: false,
      score: 0,
      totalTime: 0,
      isHost: true
    }];
    this.gameState = 'waiting'; // waiting, countdown, playing, finished
    this.gameSettings = {
      questionCount: 10,
      timeLimit: 15
    };
    this.currentQuestion = null;
    this.currentQuestionIndex = 0;
    this.currentPlayerIndex = 0;
    this.currentAnswers = [];
    this.questions = [];
    this.currentTimer = null; // Timer for current player
    this.createdAt = Date.now();
  }

  addPlayer(playerId, playerName) {
    if (this.players.length >= this.maxPlayers) {
      return { success: false, error: 'Lobby dolu' };
    }
    
    if (this.gameState !== 'waiting') {
      return { success: false, error: 'Oyun başlamış' };
    }

    this.players.push({
      id: playerId,
      name: playerName,
      ready: false,
      score: 0,
      totalTime: 0,
      isHost: false
    });

    return { success: true };
  }

  removePlayer(playerId) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    this.players.splice(playerIndex, 1);
    
    // Eğer host ayrıldıysa ve başka oyuncu varsa yeni host seç
    if (this.players.length > 0 && playerId === this.hostId) {
      this.hostId = this.players[0].id;
      this.players[0].isHost = true;
    }

    return true;
  }

  setPlayerReady(playerId, ready) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.ready = ready;
      return true;
    }
    return false;
  }

  canStartGame() {
    const playersCount = this.players.length;
    const allReady = this.players.every(p => p.ready);
    const validState = (this.gameState === 'waiting' || this.gameState === 'countdown');
    
    console.log(`🔍 Checking if can start game for lobby ${this.id}:`);
    console.log(`  - Players count: ${playersCount} (need >= 2)`);
    console.log(`  - All ready: ${allReady}`);
    console.log(`  - Game state: ${this.gameState} (need waiting or countdown)`);
    console.log(`  - Players ready status:`, this.players.map(p => `${p.name}: ${p.ready}`));
    
    const canStart = playersCount >= 2 && allReady && validState;
    console.log(`  - Can start: ${canStart}`);
    
    return canStart;
  }

  startGame() {
    if (!this.canStartGame()) return false;

    // Sorular seç ve karıştır
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    this.questions = shuffledQuestions.slice(0, this.gameSettings.questionCount);
    
    // Oyun durumunu sıfırla
    this.players.forEach(p => {
      p.score = 0;
      p.totalTime = 0;
    });

    this.currentQuestionIndex = 0;
    this.currentPlayerIndex = 0;
    this.currentAnswers = [];
    this.gameState = 'playing';
    
    return true;
  }

  getCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) return null;
    return this.questions[this.currentQuestionIndex];
  }

  submitAnswer(playerId, answer) {
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    this.currentAnswers[playerIndex] = answer;
    return true;
  }

  areAllAnswersSubmitted() {
    return this.currentAnswers.length === this.players.length &&
           this.currentAnswers.every(answer => answer !== undefined);
  }

  evaluateAnswers() {
    const question = this.getCurrentQuestion();
    if (!question) return [];

    const results = this.players.map((player, index) => {
      const answer = this.currentAnswers[index];
      const isCorrect = answer && answer === question.dogru;
      
      // Skor zaten proceedToNextPlayer'da güncellendi, burada sadece sonuçları dön

      return {
        playerId: player.id,
        playerName: player.name,
        answer: answer,
        isCorrect: isCorrect,
        score: player.score
      };
    });

    return results;
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    this.currentAnswers = [];
    this.currentPlayerIndex = 0;

    if (this.currentQuestionIndex >= this.questions.length) {
      this.gameState = 'finished';
      return false;
    }
    return true;
  }

  getWinner() {
    const maxScore = Math.max(...this.players.map(p => p.score));
    const winners = this.players.filter(p => p.score === maxScore);
    return { maxScore, winners };
  }

  toJSON() {
    return {
      id: this.id,
      hostId: this.hostId,
      maxPlayers: this.maxPlayers,
      currentPlayers: this.players.length,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        ready: p.ready,
        score: p.score,
        isHost: p.isHost
      })),
      gameState: this.gameState,
      gameSettings: this.gameSettings,
      createdAt: this.createdAt
    };
  }
}

// Socket bağlantıları
io.on('connection', (socket) => {
  console.log(`Yeni oyuncu bağlandı: ${socket.id}`);

  // Oyuncu bilgilerini kaydet
  socket.on('register', (playerName) => {
    players.set(socket.id, {
      id: socket.id,
      name: playerName,
      lobbyId: null
    });
    
    console.log(`${playerName} (${socket.id}) kaydoldu`);
    
    // Mevcut lobby listesini gönder
    socket.emit('lobbies_updated', Array.from(lobbies.values()).map(lobby => lobby.toJSON()));
  });

  // Yeni lobby oluştur
  socket.on('create_lobby', (data) => {
    const player = players.get(socket.id);
    if (!player) {
      socket.emit('error', 'Önce kayıt olmalısınız');
      return;
    }

    if (player.lobbyId) {
      socket.emit('error', 'Zaten bir lobby\'desiniz');
      return;
    }

    console.log(`🏗️ Creating lobby for ${player.name}:`);
    console.log(`  - Player ready before: ${player.ready}`);

    const lobbyId = uuidv4();
    const lobby = new Lobby(lobbyId, socket.id, player.name, data.maxPlayers || 4);
    
    console.log(`  - Host in lobby ready after creation: ${lobby.players[0].ready}`);
    console.log(`  - Lobby players:`, lobby.players.map(p => `${p.name}: ${p.ready}`));
    
    // Oyun ayarlarını güncelle
    if (data.gameSettings) {
      lobby.gameSettings = { ...lobby.gameSettings, ...data.gameSettings };
    }

    lobbies.set(lobbyId, lobby);
    player.lobbyId = lobbyId;

    socket.join(lobbyId);
    socket.emit('lobby_joined', lobby.toJSON());
    
    // Tüm oyunculara lobby listesini güncelle
    io.emit('lobbies_updated', Array.from(lobbies.values()).map(lobby => lobby.toJSON()));
    
    console.log(`${player.name} yeni lobby oluşturdu: ${lobbyId}`);
    
    // Lobby oluşturulduktan hemen sonra canStartGame kontrol et
    console.log('🔍 Checking game start immediately after lobby creation:');
    if (lobby.canStartGame()) {
      console.log('⚠️ WARNING: Game can start with single player! This is a bug!');
      startCountdown(lobby);
    } else {
      console.log('✅ Correctly cannot start game with single player');
    }
  });

  // Lobby'e katıl
  socket.on('join_lobby', (lobbyId) => {
    const player = players.get(socket.id);
    if (!player) {
      socket.emit('error', 'Önce kayıt olmalısınız');
      return;
    }

    if (player.lobbyId) {
      socket.emit('error', 'Zaten bir lobby\'desiniz');
      return;
    }

    const lobby = lobbies.get(lobbyId);
    if (!lobby) {
      socket.emit('error', 'Lobby bulunamadı');
      return;
    }

    const result = lobby.addPlayer(socket.id, player.name);
    if (!result.success) {
      socket.emit('error', result.error);
      return;
    }

    player.lobbyId = lobbyId;
    socket.join(lobbyId);
    
    // Katılan oyuncuya lobby_joined eventi gönder (ekran değişimi için)
    socket.emit('lobby_joined', lobby.toJSON());
    
    // Lobby'deki herkese güncellemeleri gönder
    io.to(lobbyId).emit('lobby_updated', lobby.toJSON());
    io.emit('lobbies_updated', Array.from(lobbies.values()).map(lobby => lobby.toJSON()));
    
    console.log(`${player.name} lobby'e katıldı: ${lobbyId}`);
  });

  // Lobby'den ayrıl
  socket.on('leave_lobby', () => {
    leaveLobby(socket.id);
  });

  // Hazır durumunu değiştir
  socket.on('toggle_ready', () => {
    const player = players.get(socket.id);
    if (!player || !player.lobbyId) return;

    const lobby = lobbies.get(player.lobbyId);
    if (!lobby) return;

    const lobbyPlayer = lobby.players.find(p => p.id === socket.id);
    if (!lobbyPlayer) return;

    lobbyPlayer.ready = !lobbyPlayer.ready;
    console.log(`🔄 ${player.name} ready status changed to: ${lobbyPlayer.ready} in lobby ${player.lobbyId}`);
    console.log(`👥 Lobby status: ${lobby.players.length} players, all ready: ${lobby.players.every(p => p.ready)}, gameState: ${lobby.gameState}`);
    
    io.to(player.lobbyId).emit('lobby_updated', lobby.toJSON());
    
    // Eğer herkes hazırsa countdown başlat
    console.log(`🔍 Checking if can start game...`);
    console.log(`  - Players count: ${lobby.players.length} (need >= 2)`);
    console.log(`  - All ready: ${lobby.players.every(p => p.ready)}`);
    console.log(`  - Game state: ${lobby.gameState} (need waiting or countdown)`);
    console.log(`  - Can start: ${lobby.canStartGame()}`);
    
    if (lobby.canStartGame()) {
      console.log(`✅ Starting countdown for lobby ${player.lobbyId}`);
      startCountdown(lobby);
    } else {
      console.log(`❌ Cannot start game yet for lobby ${player.lobbyId}`);
    }
  });

  // Oyun ayarlarını güncelle (sadece host)
  socket.on('update_game_settings', (settings) => {
    const player = players.get(socket.id);
    if (!player || !player.lobbyId) return;

    const lobby = lobbies.get(player.lobbyId);
    if (!lobby || lobby.hostId !== socket.id) return;

    console.log(`⚙️ ${player.name} updating game settings:`, settings);
    console.log(`  - Before: Players ready status:`, lobby.players.map(p => `${p.name}: ${p.ready}`));
    
    lobby.gameSettings = { ...lobby.gameSettings, ...settings };
    
    // Ayarlar değiştiğinde tüm oyuncuların ready durumunu sıfırla
    lobby.players.forEach(p => p.ready = false);
    console.log(`  - After reset: Players ready status:`, lobby.players.map(p => `${p.name}: ${p.ready}`));
    
    io.to(player.lobbyId).emit('lobby_updated', lobby.toJSON());
  });

  // Cevap gönder
  socket.on('submit_answer', (answer) => {
    const player = players.get(socket.id);
    if (!player || !player.lobbyId) return;

    const lobby = lobbies.get(player.lobbyId);
    if (!lobby || lobby.gameState !== 'playing') return;

    const playerIndex = lobby.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;

    // Sadece sıradaki oyuncu cevap verebilir
    if (playerIndex !== lobby.currentPlayerIndex) return;

    console.log(`💬 ${player.name} answered: ${answer} for question: ${lobby.getCurrentQuestion().turkce}`);
    
    // Timer'ı durdur
    if (lobby.currentTimer) {
      clearTimeout(lobby.currentTimer);
      lobby.currentTimer = null;
      console.log(`⏰ Timer stopped for ${player.name}`);
    }

    // Cevabı kaydet
    lobby.currentAnswers[playerIndex] = answer;
    
    // Cevabın doğru olup olmadığını kontrol et
    const question = lobby.getCurrentQuestion();
    const isCorrect = answer === question.dogru;
    
    if (isCorrect) {
      lobby.players[playerIndex].score++;
      console.log(`✅ ${player.name} answered correctly! Score: ${lobby.players[playerIndex].score}`);
    } else {
      console.log(`❌ ${player.name} answered incorrectly. Correct: ${question.dogru}, Given: ${answer}`);
    }

    // Sıradaki oyuncuya geç veya soru bitir
    proceedToNextPlayer(lobby);
  });

  // Bağlantı koptuğunda
  socket.on('disconnect', () => {
    console.log(`Oyuncu ayrıldı: ${socket.id}`);
    leaveLobby(socket.id);
    players.delete(socket.id);
  });
});

// Yardımcı fonksiyonlar
function leaveLobby(playerId) {
  const player = players.get(playerId);
  if (!player || !player.lobbyId) return;

  const lobby = lobbies.get(player.lobbyId);
  if (!lobby) return;

  lobby.removePlayer(playerId);
  player.lobbyId = null;

  if (lobby.players.length === 0) {
    // Lobby boş kaldı, sil
    lobbies.delete(lobby.id);
  } else {
    // Lobby'deki herkese güncelleme gönder
    io.to(lobby.id).emit('lobby_updated', lobby.toJSON());
  }

  // Tüm oyunculara lobby listesini güncelle
  io.emit('lobbies_updated', Array.from(lobbies.values()).map(lobby => lobby.toJSON()));
}

function startCountdown(lobby) {
  if (lobby.gameState !== 'waiting') return;

  console.log(`🚀 Starting countdown for lobby ${lobby.id}`);
  lobby.gameState = 'countdown';
  let countdown = 3;

  io.to(lobby.id).emit('game_countdown', countdown);

  const countdownInterval = setInterval(() => {
    countdown--;
    console.log(`⏰ Countdown: ${countdown} for lobby ${lobby.id}`);
    
    if (countdown > 0) {
      io.to(lobby.id).emit('game_countdown', countdown);
    } else {
      clearInterval(countdownInterval);
      console.log(`🎮 Countdown finished, attempting to start game for lobby ${lobby.id}`);
      console.log(`🔍 Lobby state: players=${lobby.players.length}, ready=${lobby.players.every(p => p.ready)}, gameState=${lobby.gameState}`);
      
      if (lobby.startGame()) {
        console.log(`✅ Game started successfully for lobby ${lobby.id}`);
        io.to(lobby.id).emit('game_started', lobby.toJSON());
        sendNextQuestion(lobby);
      } else {
        console.error(`❌ Failed to start game for lobby ${lobby.id}`);
        console.log(`❌ Lobby details:`, {
          playersCount: lobby.players.length,
          playersReady: lobby.players.map(p => ({name: p.name, ready: p.ready})),
          gameState: lobby.gameState
        });
      }
    }
  }, 1000);
}

function sendNextQuestion(lobby) {
  console.log(`📝 Sending next question for lobby ${lobby.id}`);
  const question = lobby.getCurrentQuestion();
  
  if (!question) {
    console.error(`❌ No question available for lobby ${lobby.id}`);
    return;
  }

  console.log(`❓ Question: "${question.turkce}" for lobby ${lobby.id}`);

  // Seçenekleri karıştır
  const shuffledOptions = [...question.secenekler].sort(() => Math.random() - 0.5);

  const questionData = {
    questionIndex: lobby.currentQuestionIndex,
    totalQuestions: lobby.questions.length,
    question: {
      turkce: question.turkce,
      options: shuffledOptions
    },
    currentPlayerIndex: lobby.currentPlayerIndex,
    currentPlayer: lobby.players[lobby.currentPlayerIndex],
    timeLimit: lobby.gameSettings.timeLimit
  };

  console.log(`🎯 Current player: ${questionData.currentPlayer.name} for lobby ${lobby.id}`);
  io.to(lobby.id).emit('new_question', questionData);
  console.log(`✅ Question sent to lobby ${lobby.id}`);
  
  // İlk oyuncu için timer başlat
  startPlayerTimer(lobby);
}

function proceedToNextPlayer(lobby) {
  console.log(`🔄 Proceeding to next player in lobby ${lobby.id}`);
  
  // Sıradaki oyuncuya geç
  lobby.currentPlayerIndex++;
  
  if (lobby.currentPlayerIndex >= lobby.players.length) {
    // Tüm oyuncular cevapladı, sonuçları göster
    console.log(`📊 All players answered for question ${lobby.currentQuestionIndex + 1}`);
    
    const results = lobby.evaluateAnswers();
    io.to(lobby.id).emit('question_results', {
      results: results,
      correctAnswer: lobby.getCurrentQuestion().dogru,
      scores: lobby.players.map(p => ({id: p.id, name: p.name, score: p.score}))
    });

    // 3 saniye sonra bir sonraki soruya geç
    setTimeout(() => {
      if (lobby.nextQuestion()) {
        sendNextQuestion(lobby);
      } else {
        endGame(lobby);
      }
    }, 3000);
    
  } else {
    // Sıradaki oyuncuya sıra bildir ve timer başlat
    console.log(`👉 Next player: ${lobby.players[lobby.currentPlayerIndex].name}`);
    
    io.to(lobby.id).emit('turn_changed', {
      currentPlayerIndex: lobby.currentPlayerIndex,
      currentPlayer: lobby.players[lobby.currentPlayerIndex],
      timeLimit: lobby.gameSettings.timeLimit
    });
    
    // Yeni oyuncu için timer başlat
    startPlayerTimer(lobby);
  }
}

function startPlayerTimer(lobby) {
  const currentPlayer = lobby.players[lobby.currentPlayerIndex];
  const timeLimit = lobby.gameSettings.timeLimit;
  
  console.log(`⏰ Starting timer for ${currentPlayer.name}: ${timeLimit} seconds`);
  
  // Mevcut timer'ı temizle
  if (lobby.currentTimer) {
    clearTimeout(lobby.currentTimer);
  }
  
  // Yeni timer başlat
  lobby.currentTimer = setTimeout(() => {
    console.log(`⏰ Timer expired for ${currentPlayer.name}`);
    
    // Cevap vermediği için 0 puan
    lobby.currentAnswers[lobby.currentPlayerIndex] = null;
    
    // Timeout mesajı gönder
    io.to(lobby.id).emit('player_timeout', {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      message: 'Zamanınız bitti!'
    });
    
    // Sıradaki oyuncuya geç
    proceedToNextPlayer(lobby);
    
  }, timeLimit * 1000);
}

function endGame(lobby) {
  const { maxScore, winners } = lobby.getWinner();
  
  io.to(lobby.id).emit('game_finished', {
    maxScore: maxScore,
    winners: winners,
    finalScores: lobby.players.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      totalTime: p.totalTime
    }))
  });

  // Lobby'i yeniden kullanıma hazırla
  lobby.gameState = 'waiting';
  lobby.players.forEach(p => {
    p.ready = false;
    p.score = 0;
    p.totalTime = 0;
  });
  
  setTimeout(() => {
    io.to(lobby.id).emit('lobby_updated', lobby.toJSON());
  }, 5000);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Multiplayer oyun sunucusu ${PORT} portunda çalışıyor`);
  console.log(`📱 http://localhost:${PORT} adresinden erişebilirsiniz`);
}); 