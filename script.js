class WhackAMoleGame {
  constructor() {
    this.score = 0;
    this.gameActive = false;
    this.paused = false;
    this.remainingTime = 30.00;
    this.timerInterval = null;

    // DOM Elements
    this.scoreEl = document.getElementById('score');
    this.startStopButton = document.getElementById('start-stop-button');
    this.resumeButton = document.getElementById('resume-button');
    this.endButton = document.getElementById('end-button');
    this.holes = document.querySelectorAll('.hole');
    this.endMessage = document.getElementById('end-message');
    this.finalScoreEl = document.getElementById('final-score');

    this.timerDisplay = document.createElement('div');
    this.timerDisplay.id = 'timer';
    this.timerDisplay.textContent = 'Time Left: 30.00s';
    document.getElementById('control-panel').appendChild(this.timerDisplay);

    this.keyMap = {
      'Q': 'hole1',
      'W': 'hole2',
      'E': 'hole3',
      'A': 'hole4',
      'S': 'hole5',
      'D': 'hole6'
    };

    // Initialize Event Listeners
    this.addEventListeners();
  }

  startGame() {
    this.resetGame();
    this.gameActive = true;
    this.paused = false;
    this.startStopButton.textContent = "Stop Playing (space)";
    this.endMessage.style.display = 'none';
    this.showMainButton();
    this.startTimer();
    this.activateNextMole();
  }

  pauseGame() {
    this.gameActive = false;
    this.paused = true;
    clearInterval(this.timerInterval);

    this.startStopButton.style.display = 'none';
    this.resumeButton.style.display = 'inline-block';
    this.endButton.style.display = 'inline-block';
  }

  resumeGame() {
    this.gameActive = true;
    this.paused = false;
    this.startTimer();
    this.showMainButton();
    this.startStopButton.textContent = "Stop Playing (space)";
  }

  endGame() {
    this.gameActive = false;
    this.paused = false;
    clearInterval(this.timerInterval);
    this.deactivateAllHoles();

    this.finalScoreEl.textContent = this.score;
    this.endMessage.style.display = 'block';

    this.showMainButton();
    this.startStopButton.textContent = "Start Playing (space)";
  }

  resetGame() {
    this.score = 0;
    this.remainingTime = 30.00;
    this.scoreEl.textContent = this.score;
    this.timerDisplay.textContent = 'Time Left: 30.00s';
  }

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime -= 0.01;
        this.remainingTime = Math.max(this.remainingTime, 0);
        this.timerDisplay.textContent = `Time Left: ${this.remainingTime.toFixed(2)}s`;
      } else {
        clearInterval(this.timerInterval);
        this.endGame();
      }
    }, 10);
  }

  activateNextMole() {
    if (!this.gameActive) return;
    this.deactivateAllHoles();
    const randomIndex = Math.floor(Math.random() * this.holes.length);
    this.activateHole(this.holes[randomIndex]);
  }

  activateHole(hole) {
    this.deactivateAllHoles();

    hole.classList.add('active');
    const moleImg = document.createElement('img');
    moleImg.src = 'face.jpg';
    moleImg.alt = 'Mole';
    moleImg.draggable = false;
    moleImg.classList.add('mole-image');
    hole.appendChild(moleImg);
  }

  deactivateAllHoles() {
    this.holes.forEach(hole => {
        hole.classList.remove('active');
        // Only remove the mole image, not the score indicator
        const moleImg = hole.querySelector('.mole-image');
        if (moleImg) hole.removeChild(moleImg);
        // Remove score indicator logic from here since it has its own timeout
    });
}

  showMainButton() {
    this.startStopButton.style.display = 'inline-block';
    this.resumeButton.style.display = 'none';
    this.endButton.style.display = 'none';
  }

  hitMole(hole) {
    if (!hole.classList.contains('active')) return;

    this.score++;
    this.scoreEl.textContent = this.score;
    this.showScoreIndicator(hole, +1);  // Show indicator first
    setTimeout(() => {                   // Delay the deactivation
        this.deactivateAllHoles();
        this.activateNextMole();
    }, 100);  // Small delay to ensure indicator is visible
}

  missHole(hole) {
    this.score--;
    this.scoreEl.textContent = this.score;
    this.showScoreIndicator(hole, -1);
  }

  showScoreIndicator(hole, amount) {
    const indicator = document.createElement('div');
    indicator.classList.add('score-indicator');
    // Add positive/negative class based on the amount
    indicator.classList.add(amount > 0 ? 'positive' : 'negative');
    indicator.textContent = amount > 0 ? `+${amount}` : `${amount}`;
    hole.appendChild(indicator);
    setTimeout(() => {
        if (hole.contains(indicator)) hole.removeChild(indicator);
    }, 1000);
}

  addEventListeners() {
    document.addEventListener('keydown', (event) => this.handleKeyboard(event));
    this.holes.forEach(hole => {
      hole.addEventListener('click', (event) => this.handleMouseClick(event, hole));
    });

    this.startStopButton.addEventListener('click', () => {
      const btnText = this.startStopButton.textContent;
      if (!this.gameActive && !this.paused && btnText === "Start Playing (space)") {
        this.startGame();
      } else if (this.gameActive && !this.paused && btnText === "Stop Playing (space)") {
        this.pauseGame();
      }
    });

    this.resumeButton.addEventListener('click', () => this.resumeGame());
    this.endButton.addEventListener('click', () => this.endGame());
  }

  handleKeyboard(event) {
    const key = event.key.toUpperCase();
    if (key === ' ') {
      event.preventDefault();
      if (!this.gameActive && !this.paused) this.startGame();
      else if (this.gameActive && !this.paused) this.pauseGame();
      else if (!this.gameActive && this.paused) this.resumeGame();
      return;
    }
    if (key === 'ESCAPE' && this.paused) this.endGame();
    if (!this.gameActive || this.paused) return;

    const holeId = this.keyMap[key];
    if (!holeId) return;

    const hole = document.getElementById(holeId);
    if (!hole) return;

    if (hole.classList.contains('active')) this.hitMole(hole);
    else this.missHole(hole);
  }

  handleMouseClick(event, hole) {
    if (!this.gameActive || this.paused) return;
    const target = event.target;
    if (hole.classList.contains('active') && target.tagName === 'IMG') {
      this.hitMole(hole);
    } else {
      this.missHole(hole);
    }
  }
}

// Instantiate and initialize the game
const game = new WhackAMoleGame();