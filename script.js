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

// Oyun Değişkenleri
let players = [];
  let questions = [];
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
  document.body.appendChild(toastDiv);

  function showToast(message, duration = 2500) {
    toastDiv.textContent = message;
    toastDiv.style.opacity = "1";
    setTimeout(() => {
      toastDiv.style.opacity = "0";
    }, duration);
  }

  // Yardım Modalı Fonksiyonları
  function openHelpModal() {
    helpModal.style.display = "block";
    document.body.style.overflow = "hidden"; // Scroll'u engelle
  }

  function closeHelpModal() {
    helpModal.style.display = "none";
    document.body.style.overflow = "auto"; // Scroll'u geri aç
  }

  function openScoresModal() {
    scoresModal.style.display = "block";
  }

  function closeScoresModal() {
    scoresModal.style.display = "none";
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
      // Doğru cevabı takip etmek için data attribute ekle
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

          // Butonları devre dışı bırak
          answerButtons.forEach(btn => btn.disabled = true);

          // Sıradaki oyuncuya geç
          if (currentPlayerIndex < players.length - 1) {
            currentPlayerIndex++;
            setTimeout(() => {
              showCurrentTurn();
            }, 1500);
          } else {
            // Son oyuncuysa cevapları değerlendir
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

    // Oyuncunun cevabını kaydet
    const answer = selectedButton ? selectedButton.textContent : null;
    currentAnswers[currentPlayerIndex] = answer;

    // Oyuncunun butonlarını devre dışı bırak
    answerButtons.forEach(btn => btn.disabled = true);

    // Eğer son oyuncu değilsek sıradaki oyuncuya geç
    if (currentPlayerIndex < players.length - 1) {
      currentPlayerIndex++;
      setTimeout(() => {
        showCurrentTurn();
      }, 500);
      return;
    }

    // Son oyuncu cevap verdi, cevapları değerlendir ve göster
    evaluateAnswers();
  }

  // Tüm cevapları değerlendir ve sonuçları göster
  function evaluateAnswers() {
    const question = questions[currentQuestionIndex];
    const correctAnswer = question.dogru;

    // Butonlardan önceki işaretleri kaldır, ve disable yap
    answerButtons.forEach(btn => {
      btn.classList.remove("dogru", "yanlis");
      btn.disabled = true;
    });

    // Doğru cevabı işaretle
    answerButtons.forEach(btn => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("dogru");
      }
    });

    // Her oyuncunun cevabını değerlendir
    players.forEach((player, idx) => {
      const playerAnswer = currentAnswers[idx];
      if (playerAnswer === correctAnswer) {
        player.score++;
      }
    });

    updateScores();

    // Sonraki soruya geçmeden önce kısa bekleme
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

    // Ekranları değiştir
    settingsScreen.style.display = "none";
    gameScreen.style.display = "block";

    showCurrentTurn();
  }

  // Oyunu bitir
  function endGame() {
    gameRunning = false;
    
    // Kazananı bul
    const winner = players.reduce((prev, current) => 
      (prev.score > current.score) ? prev : current
    );
    
    // Beraberlik kontrolü
    const maxScore = Math.max(...players.map(p => p.score));
    const winners = players.filter(p => p.score === maxScore);
    
    // Oyun sonu ekranını göster
    if (winners.length === 1) {
      winnerInfoEl.innerHTML = `🏆 Kazanan: <strong>${winner.name}</strong> (${winner.score} puan)`;
    } else {
      winnerInfoEl.innerHTML = `🤝 Beraberlik! ${winners.map(w => w.name).join(", ")} (${maxScore} puan)`;
    }

    // Final skorları
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

  // Skoru kaydet
  function saveScore() {
    const gameData = {
      players: players,
      totalQuestions: questions.length,
      timeLimit: timeLimit,
      date: new Date().toISOString()
    };

    fetch('save_score.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showToast("Skor başarıyla kaydedildi! 🎉");
      } else {
        showToast("Skor kaydedilemedi: " + data.message);
      }
    })
    .catch(error => {
      showToast("Skor kaydedilemedi: " + error.message);
    });
  }

  // Skorları görüntüle
  function viewScores() {
    window.open('view_scores.php', '_blank');
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

  playAgainBtn.addEventListener("click", () => {
    gameOverScreen.style.display = "none";
    startGame();
  });
  saveScoreBtn.addEventListener("click", saveScore);
  viewScoresBtn.addEventListener("click", viewScores);
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

  // İlk yükleme
  updatePlayerInputs();
});
  