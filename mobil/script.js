// PWA ve Service Worker Setup
let deferredPrompt;
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');
const dismissBtn = document.getElementById('dismissBtn');
const offlineIndicator = document.getElementById('offlineIndicator');

// Service Worker kaydı
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('Service Worker kayıtlı:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker kaydı başarısız:', error);
      });
  });
}

// PWA Install Banner
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Banner'ı göster
  setTimeout(() => {
    installBanner.classList.add('show');
  }, 3000);
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA yüklendi');
      showToast('Uygulama ana ekrana eklendi! 🎉');
    }
    
    deferredPrompt = null;
    installBanner.classList.remove('show');
  }
});

dismissBtn.addEventListener('click', () => {
  installBanner.classList.remove('show');
  localStorage.setItem('installBannerDismissed', 'true');
});

// Eğer daha önce dismiss edilmişse banner'ı gösterme
if (localStorage.getItem('installBannerDismissed') === 'true') {
  installBanner.style.display = 'none';
}

// Online/Offline durumu
function updateOnlineStatus() {
  if (navigator.onLine) {
    offlineIndicator.textContent = '🟢 Çevrimiçi';
    offlineIndicator.className = 'offline-indicator online';
    offlineIndicator.style.display = 'none';
  } else {
    offlineIndicator.textContent = '🔴 Çevrimdışı';
    offlineIndicator.className = 'offline-indicator';
    offlineIndicator.style.display = 'block';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Ana oyun kodu
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elementleri
  const settingsScreen = document.getElementById("settingsScreen");
  const gameScreen = document.getElementById("gameScreen");
  const gameOverScreen = document.getElementById("gameOverScreen");
  
  const playerCountSelect = document.getElementById("playerCount");
  const playerInputs = [
    document.getElementById("player1"),
    document.getElementById("player2"),
    document.getElementById("player3"),
    document.getElementById("player4")
  ];
  const questionCountSelect = document.getElementById("questionCount");
  const timeSelect = document.getElementById("timeSelect");
  const startGameBtn = document.getElementById("startGameBtn");
  
  const restartBtn = document.getElementById("restartBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const backToSettingsBtn = document.getElementById("backToSettingsBtn");
  const scoreContainer = document.getElementById("scoreContainer");
  
  const turkishVerbEl = document.getElementById("turkish");
  const timeEl = document.getElementById("time");
  const turnInfoEl = document.getElementById("turnInfo");
  const answerButtons = document.querySelectorAll(".answer-card");
  
  const winnerInfoEl = document.getElementById("winnerInfo");
  const finalScoresEl = document.getElementById("finalScores");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const saveScoreBtn = document.getElementById("saveScoreBtn");
  const viewScoresBtn = document.getElementById("viewScoresBtn");
  const backToMenuBtn = document.getElementById("backToMenuBtn");

  // Yardım Modalı Elementleri
  const helpModal = document.getElementById("helpModal");
  const helpBtn = document.getElementById("helpBtn");
  const closeHelpBtn = document.getElementById("closeHelpBtn");
  const startGameFromHelpBtn = document.getElementById("startGameFromHelpBtn");

  // Skorları görüntüleme Modalı Elementleri
  const scoresModal = document.getElementById("scoresModal");
  const scoresBtn = document.getElementById("scoresBtn");
  const closeScoresBtn = document.getElementById("closeScoresBtn");
  const startGameFromScoresBtn = document.getElementById("startGameFromScoresBtn");
  const clearScoresBtn = document.getElementById("clearScoresBtn");
  const scoresContent = document.getElementById("scoresContent");

  // Oyun Değişkenleri
  let players = [];
  let questions = [];
  let tumSorular = [];
  let currentQuestionIndex = 0;
  let currentPlayerIndex = 0;
  let timeLimit = 15;
  let timerInterval = null;
  let timeLeft = 0;
  let gameRunning = false;
  let paused = false;
  let currentAnswers = [];
  let gameStartTime = null;

  // Oyuncu renkleri
  const playerColors = [
    { bg: "#d0eaff", text: "#1976d2" },
    { bg: "#ffd0d0", text: "#e91e63" },
    { bg: "#d0ffd6", text: "#4caf50" },
    { bg: "#f7dfff", text: "#ff5722" }
  ];

  // Toast mesaj div'i oluştur
  let toastDiv = document.createElement("div");
  toastDiv.id = "toastMessage";
  toastDiv.style.position = "fixed";
  toastDiv.style.bottom = "20px";
  toastDiv.style.left = "50%";
  toastDiv.style.transform = "translateX(-50%)";
  toastDiv.style.backgroundColor = "rgba(0,0,0,0.8)";
  toastDiv.style.color = "white";
  toastDiv.style.padding = "12px 24px";
  toastDiv.style.borderRadius = "6px";
  toastDiv.style.fontWeight = "700";
  toastDiv.style.fontSize = "1rem";
  toastDiv.style.opacity = "0";
  toastDiv.style.transition = "opacity 0.5s ease";
  toastDiv.style.zIndex = "9999";
  toastDiv.style.pointerEvents = "none";
  toastDiv.style.userSelect = "none";
  document.body.appendChild(toastDiv);

  function showToast(message, duration = 2500) {
    toastDiv.textContent = message;
    toastDiv.style.opacity = "1";
    setTimeout(() => {
      toastDiv.style.opacity = "0";
    }, duration);
  }

  // Sorular JSON dosyasını yükle
  async function loadQuestions() {
    try {
      const response = await fetch('./sorular.json');
      tumSorular = await response.json();
      console.log('Sorular yüklendi:', tumSorular.length);
    } catch (error) {
      console.error('Sorular yüklenemedi:', error);
      // Fallback: localStorage'dan yükle
      const cached = localStorage.getItem('cachedQuestions');
      if (cached) {
        tumSorular = JSON.parse(cached);
        showToast('Sorular offline cache\'den yüklendi');
      } else {
        showToast('Sorular yüklenemedi! İnternet bağlantınızı kontrol edin.');
      }
    }
  }

  // Soruları cache'e kaydet
  function cacheQuestions() {
    localStorage.setItem('cachedQuestions', JSON.stringify(tumSorular));
  }

  // LocalStorage Skor Sistemi
  function saveScore() {
    const gameData = {
      players: players,
      totalQuestions: questions.length,
      timeLimit: timeLimit,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    // Mevcut skorları al
    let savedScores = JSON.parse(localStorage.getItem('almancaOyunSkorlari')) || [];
    
    // Her oyuncuyu ayrı bir skor olarak kaydet
    players.forEach(player => {
      savedScores.push({
        oyuncu_adi: player.name,
        skor: player.score,
        soru_sayisi: questions.length,
        oyun_tarihi: new Date().toISOString(),
        total_time: Math.round(player.totalTime),
        timestamp: Date.now()
      });
    });

    // En yüksek 50 skoru tut
    savedScores.sort((a, b) => b.skor - a.skor);
    savedScores = savedScores.slice(0, 50);

    localStorage.setItem('almancaOyunSkorlari', JSON.stringify(savedScores));
    showToast("Skorlar kaydedildi! 💾");
  }

  // Skorları göster
  function displayScores() {
    const savedScores = JSON.parse(localStorage.getItem('almancaOyunSkorlari')) || [];
    
    if (savedScores.length === 0) {
      scoresContent.innerHTML = `
        <div class="no-scores">
          <p>Henüz kaydedilmiş skor bulunmuyor.</p>
          <p>İlk oyununuzu oynayın ve skorunuzu kaydedin! 🎮</p>
        </div>
      `;
      return;
    }

    const scoresHtml = savedScores.slice(0, 10).map((score, index) => {
      const rank = index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`;
      const topClass = index < 3 ? 'top-three' : '';
      const date = new Date(score.oyun_tarihi).toLocaleDateString('tr-TR');
      
      return `
        <div class="score-item ${topClass}">
          <div class="rank">${rank}</div>
          <div class="player-info">
            <div class="player-name">${score.oyuncu_adi}</div>
            <div class="game-info">
              ${score.soru_sayisi} soru • ${date}
            </div>
          </div>
          <div class="score-value">
            ${score.skor} puan
          </div>
        </div>
      `;
    }).join('');

    scoresContent.innerHTML = `<div class="scores-list">${scoresHtml}</div>`;
  }

  // Skorları temizle
  function clearScores() {
    if (confirm('Tüm skorları silmek istediğinizden emin misiniz?')) {
      localStorage.removeItem('almancaOyunSkorlari');
      displayScores();
      showToast('Tüm skorlar silindi! 🗑️');
    }
  }

  // Yardım Modalı Fonksiyonları
  function openHelpModal() {
    helpModal.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function closeHelpModal() {
    helpModal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  function openScoresModal() {
    displayScores();
    scoresModal.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function closeScoresModal() {
    scoresModal.style.display = "none";
    document.body.style.overflow = "auto";
  }

  // Modal dışına tıklandığında kapat
  window.addEventListener("click", (event) => {
    if (event.target === helpModal) {
      closeHelpModal();
    }
    if (event.target === scoresModal) {
      closeScoresModal();
    }
  });

  // ESC tuşu ile modal kapat
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (helpModal.style.display === "block") {
        closeHelpModal();
      }
      if (scoresModal.style.display === "block") {
        closeScoresModal();
      }
    }
  });

  // Oyuncu sayısı değiştiğinde input alanlarını güncelle
  function updatePlayerInputs() {
    const count = parseInt(playerCountSelect.value);
    playerInputs.forEach((input, index) => {
      input.parentElement.style.display = index < count ? "block" : "none";
    });
  }

  // Oyuncuları oluştur
  function createPlayers() {
    const count = parseInt(playerCountSelect.value);
    players = [];
    
    for (let i = 0; i < count; i++) {
      const name = playerInputs[i].value.trim() || `Oyuncu ${i + 1}`;
      players.push({
        name: name,
        color: playerColors[i],
        score: 0,
        totalTime: 0
      });
    }
  }

  // Skor kartlarını oluştur
  function createScoreCards() {
    scoreContainer.innerHTML = "";
    players.forEach((player, index) => {
      const scoreCard = document.createElement("div");
      scoreCard.className = "oyuncu";
      scoreCard.style.backgroundColor = player.color.bg;
      scoreCard.style.color = player.color.text;
      scoreCard.innerHTML = `${player.name} Skor: <span id="score-${index}">0</span>`;
      scoreContainer.appendChild(scoreCard);
    });
  }

  // Skorları güncelle
  function updateScores() {
    players.forEach((player, index) => {
      const scoreEl = document.getElementById(`score-${index}`);
      if (scoreEl) {
        scoreEl.textContent = player.score;
      }
    });
  }

  // Karıştırma fonksiyonu
  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  // Yeni soruyu ve oyuncuyu göster
  function showCurrentTurn() {
    const question = questions[currentQuestionIndex];
    turkishVerbEl.textContent = question.turkce;
    turnInfoEl.innerHTML = `<span style="color:${players[currentPlayerIndex].color.text}; font-weight:bold;">${players[currentPlayerIndex].name}</span> sıra sende, doğru Almanca fiili seç!`;

    // Seçenekleri karıştır ve göster
    const shuffledOptions = shuffle([...question.secenekler]);
    answerButtons.forEach((btn, i) => {
      btn.disabled = false;
      btn.className = "answer-card";
      btn.textContent = shuffledOptions[i];
      btn.dataset.answer = shuffledOptions[i];
    });

    // Zamanlayıcıyı sıfırla ve başlat
    timeLeft = timeLimit;
    updateTimeDisplay();
    startTimer();
  }

  // Zamanlayıcıyı başlat
  function startTimer() {
    clearInterval(timerInterval);
    const startTime = Date.now();

    timerInterval = setInterval(() => {
      if (!paused) {
        timeLeft--;
        updateTimeDisplay();

        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          const endTime = Date.now();
          players[currentPlayerIndex].totalTime += (endTime - startTime) / 1000;

          showToast(`${players[currentPlayerIndex].name} zamanını kaybetti! Cevap vermedi, sıradaki oyuncuya geçiliyor.`);
          currentAnswers[currentPlayerIndex] = null;

          answerButtons.forEach(btn => btn.disabled = true);

          if (currentPlayerIndex < players.length - 1) {
            currentPlayerIndex++;
            setTimeout(() => {
              showCurrentTurn();
            }, 1500);
          } else {
            setTimeout(() => {
              evaluateAnswers();
            }, 1500);
          }
        }
      }
    }, 1000);
  }

  // Zaman rengini ayarla
  function updateTimeDisplay() {
    timeEl.textContent = timeLeft;
    if (timeLeft <= 5) {
      timeEl.style.color = "red";
    } else {
      timeEl.style.color = "green";
    }
  }

  // Cevap verildiğinde
  function handleAnswer(selectedButton) {
    if (!gameRunning || paused) return;

    clearInterval(timerInterval);
    const endTime = Date.now();
    players[currentPlayerIndex].totalTime += (endTime - gameStartTime) / 1000;

    const answer = selectedButton ? selectedButton.textContent : null;
    currentAnswers[currentPlayerIndex] = answer;

    answerButtons.forEach(btn => btn.disabled = true);

    if (currentPlayerIndex < players.length - 1) {
      currentPlayerIndex++;
      setTimeout(() => {
        showCurrentTurn();
      }, 500);
      return;
    }

    evaluateAnswers();
  }

  // Tüm cevapları değerlendir ve sonuçları göster
  function evaluateAnswers() {
    const question = questions[currentQuestionIndex];
    const correctAnswer = question.dogru;

    answerButtons.forEach(btn => {
      btn.classList.remove("dogru", "yanlis");
      btn.disabled = true;
    });

    answerButtons.forEach(btn => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("dogru");
      }
    });

    players.forEach((player, idx) => {
      const playerAnswer = currentAnswers[idx];
      if (playerAnswer === correctAnswer) {
        player.score++;
      }
    });

    updateScores();

    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
      }
      currentPlayerIndex = 0;
      currentAnswers = [];
      showCurrentTurn();
    }, 2500);
  }

  // Oyunu başlat
  function startGame() {
    if (tumSorular.length === 0) {
      showToast('Sorular henüz yüklenmedi. Lütfen bekleyin...');
      return;
    }

    createPlayers();
    createScoreCards();
    
    const count = parseInt(questionCountSelect.value);
    timeLimit = parseInt(timeSelect.value);

    if (count === 0) {
      questions = shuffle(tumSorular);
    } else {
      questions = shuffle(tumSorular).slice(0, count);
    }

    currentQuestionIndex = 0;
    currentPlayerIndex = 0;
    players.forEach(p => {
      p.score = 0;
      p.totalTime = 0;
    });
    updateScores();

    gameRunning = true;
    paused = false;
    gameStartTime = Date.now();
    pauseBtn.textContent = "⏸️ Duraklat";

    currentAnswers = [];

    settingsScreen.style.display = "none";
    gameScreen.style.display = "block";

    showCurrentTurn();
  }

  // Oyunu bitir
  function endGame() {
    gameRunning = false;
    
    const winner = players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );
    
    const maxScore = Math.max(...players.map(p => p.score));
    const winners = players.filter(p => p.score === maxScore);
    
    if (winners.length === 1) {
      winnerInfoEl.innerHTML = `🏆 Kazanan: <strong>${winner.name}</strong> (${winner.score} puan)`;
    } else {
      winnerInfoEl.innerHTML = `🤝 Beraberlik! ${winners.map(w => w.name).join(", ")} (${maxScore} puan)`;
    }

    finalScoresEl.innerHTML = "";
    players.sort((a, b) => b.score - a.score).forEach((player, index) => {
      const scoreItem = document.createElement("div");
      scoreItem.className = "final-score-item";
      scoreItem.innerHTML = `
        <span>${index + 1}. ${player.name}</span>
        <span>${player.score} puan (${Math.round(player.totalTime)}s)</span>
      `;
      finalScoresEl.appendChild(scoreItem);
    });

    gameOverScreen.style.display = "flex";
  }

  // Duraklat / devam ettir
  function togglePause() {
    if (!gameRunning) return;

    paused = !paused;
    pauseBtn.textContent = paused ? "▶ Devam Et" : "⏸️ Duraklat";

    if (!paused) {
      startTimer();
    } else {
      clearInterval(timerInterval);
    }
  }

  // Event listener'lar
  playerCountSelect.addEventListener("change", updatePlayerInputs);
  startGameBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", () => {
    if (gameRunning) {
      startGame();
    }
  });
  pauseBtn.addEventListener("click", togglePause);
  backToSettingsBtn.addEventListener("click", () => {
    gameScreen.style.display = "none";
    settingsScreen.style.display = "block";
  });

  // Yardım Modalı Event Listener'ları
  helpBtn.addEventListener("click", openHelpModal);
  closeHelpBtn.addEventListener("click", closeHelpModal);
  startGameFromHelpBtn.addEventListener("click", () => {
    closeHelpModal();
    startGame();
  });

  // Skor Modalı Event Listener'ları
  scoresBtn.addEventListener("click", openScoresModal);
  closeScoresBtn.addEventListener("click", closeScoresModal);
  startGameFromScoresBtn.addEventListener("click", () => {
    closeScoresModal();
    startGame();
  });
  clearScoresBtn.addEventListener("click", clearScores);

  playAgainBtn.addEventListener("click", () => {
    gameOverScreen.style.display = "none";
    startGame();
  });
  saveScoreBtn.addEventListener("click", saveScore);
  viewScoresBtn.addEventListener("click", openScoresModal);
  backToMenuBtn.addEventListener("click", () => {
    gameOverScreen.style.display = "none";
    gameScreen.style.display = "none";
    settingsScreen.style.display = "block";
  });

  answerButtons.forEach(btn =>
    btn.addEventListener("click", e => {
      if (!gameRunning || paused) return;
      handleAnswer(e.target);
    })
  );

  // URL parametrelerini kontrol et (hızlı oyun için)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('quick') === 'true') {
    // Hızlı oyun ayarları
    questionCountSelect.value = '10';
    timeSelect.value = '15';
    showToast('Hızlı oyun modu aktif! 🚀');
  }

  // İlk yükleme
  updatePlayerInputs();
  loadQuestions().then(() => {
    cacheQuestions();
  });
}); 