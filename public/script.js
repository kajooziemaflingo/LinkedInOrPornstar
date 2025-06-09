// Splash screen logic
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  const startButton = document.getElementById('start-button');

  startButton.addEventListener('click', () => {
    splash.style.display = 'none';
    fetchImage(); // Start the game
  });
});

let usedImages = new Set();
let currentRound = 0;
const maxPerRound = 10;
let correctFolder = '';
let correctGuesses = 0;
let totalGuesses = 0;

const photo = document.getElementById('photo');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');

const btn1 = document.getElementById('btn-folder1');
const btn2 = document.getElementById('btn-folder2');

btn1.addEventListener('click', () => handleGuess('folder1'));
btn2.addEventListener('click', () => handleGuess('folder2'));

let timerInterval = null;
let timeRemaining = 15;


function fetchImage() {
  if (currentRound >= maxPerRound) {
    endGame();
    return;
  }

  feedback.textContent = 'Loading...';

  fetch('/api/get-random-image')
    .then(res => res.json())
    .then(data => {
      if (usedImages.has(data.imageUrl)) {
        // Skip duplicates by retrying
        fetchImage();
        return;
      }

      photo.src = data.imageUrl;
      correctFolder = data.actualFolder;
      usedImages.add(data.imageUrl);
      currentRound++;
      feedback.textContent = '';
	  startTimer(); // Start countdown after image is loaded

    })
    .catch(err => {
      feedback.textContent = 'Error loading image.';
      console.error(err);
    });
}

function startTimer() {
  clearInterval(timerInterval); // Reset any previous timer
  timeRemaining = 15;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      feedback.textContent = `⏱️ Time's up! It was from ${correctFolder.toUpperCase()}`;
      showWrongIcon();
      totalGuesses++;
      updateScore();

      setTimeout(() => {
        correctFolder = '';
        fetchImage();
      }, 1500);
    }
  }, 1000);
}


function handleGuess(userGuess) {
	clearInterval(timerInterval); // Stop timer on guess

if (!correctFolder) return;

  totalGuesses++;
  const isCorrect = userGuess === correctFolder;

  if (isCorrect) {
    correctGuesses++;
    feedback.textContent = `✅ Correct! It was from ${correctFolder.toUpperCase()}`;
    fireConfetti();
  } else {
    feedback.textContent = `❌ Incorrect. It was from ${correctFolder.toUpperCase()}`;
    showWrongIcon();
  }

  updateScore();

  setTimeout(() => {
    correctFolder = '';
    fetchImage();
  }, 1500);
}

function updateTimerDisplay() {
  const timerElement = document.getElementById('timer');
  timerElement.textContent = `⏳ ${timeRemaining}s`;
}


function updateScore() {
  scoreDisplay.textContent = `Score: ${correctGuesses} / ${totalGuesses}`;
}

// Initial image load - OBSOLETED!
//fetchImage();

function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function showWrongIcon() {
  const wrongIcon = document.getElementById('wrong-icon');
  wrongIcon.classList.add('show');

  setTimeout(() => {
    wrongIcon.classList.remove('show');
  }, 1000);
}

document.getElementById('restart-button').addEventListener('click', () => {
  // Reset game state
  usedImages.clear();
  currentRound = 0;
  correctGuesses = 0;
  totalGuesses = 0;
  updateScore();

  // Hide game over and show splash
  document.getElementById('gameover-screen').style.display = 'none';
  document.getElementById('splash-screen').style.display = 'flex';
});

document.getElementById('share-button').addEventListener('click', () => {
  const url = 'https://playthegame.com';
  navigator.clipboard.writeText(url)
    .then(() => {
      alert('Link copied to clipboard!');
    })
    .catch(err => {
      console.error('Clipboard copy failed:', err);
      alert('Failed to copy link.');
    });
});


function endGame() {
  const finalScore = correctGuesses;
  const scoreText = `You got ${finalScore} out of 10 correct.`;

  let message = '';
  if (finalScore === 10) {
    message = "You really know your stuff!";
  } else if (finalScore >= 8) {
    message = "Pretty good!";
  } else if (finalScore >= 6) {
    message = "A little more practice!";
  } else if (finalScore >= 2) {
    message = "You're a dunce!";
  } else {
    message = "Were you even trying?";
  }

  document.getElementById('final-score').textContent = scoreText;
  document.getElementById('final-message').textContent = message;

  document.getElementById('gameover-screen').style.display = 'flex';
}

