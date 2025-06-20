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
let gameActive = true; // Prevent double-clicking

const photo = document.getElementById('photo');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');

const btn1 = document.getElementById('btn-linkedin');
const btn2 = document.getElementById('btn-pornstar');

btn1.addEventListener('click', () => handleGuess('linkedin'));
btn2.addEventListener('click', () => handleGuess('pornstar'));

let timerInterval = null;
let timeRemaining = 15;

function fetchImage(retryCount = 0) {
  if (currentRound >= maxPerRound) {
    endGame();
    return;
  }

  // Prevent infinite loops if we run out of unique images
  if (retryCount >= 50) {
    console.warn('Too many retries fetching unique image, ending game');
    endGame();
    return;
  }

  feedback.textContent = 'Loading...';

  fetch('/api/get-random-image')
    .then(res => res.json())
    .then(data => {
      if (usedImages.has(data.imageUrl)) {
        // Skip duplicates by retrying with counter
        fetchImage(retryCount + 1);
        return;
      }

      photo.src = data.imageUrl;
      // Convert to lowercase to match button values
      correctFolder = data.actualFolder.toLowerCase();
      usedImages.add(data.imageUrl);
      currentRound++;
      feedback.textContent = '';
      gameActive = true; // Re-enable interactions
      startTimer(); // Start countdown after image is loaded

    })
    .catch(err => {
      feedback.textContent = 'Error loading image.';
      console.error(err);
      // Try again after a delay if there's an error
      setTimeout(() => fetchImage(retryCount + 1), 2000);
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
      gameActive = false; // Disable further clicks
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
  // Prevent double-clicking and ensure game is active
  if (!gameActive || !correctFolder) return;
  
  gameActive = false; // Disable further clicks
  clearInterval(timerInterval); // Stop timer on guess

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
  
  // Add visual urgency when time is running low
  if (timeRemaining <= 5) {
    timerElement.style.color = '#ff4444';
  } else {
    timerElement.style.color = '#ffa500';
  }
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${correctGuesses} / ${totalGuesses}`;
}

function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function showWrongIcon() {
  const wrongIcon = document.getElementById('wrong-icon');
  if (wrongIcon) {
    wrongIcon.classList.add('show');

    setTimeout(() => {
      wrongIcon.classList.remove('show');
    }, 1000);
  }
}

document.getElementById('restart-button').addEventListener('click', () => {
  // Reset game state
  usedImages.clear();
  currentRound = 0;
  correctGuesses = 0;
  totalGuesses = 0;
  correctFolder = '';
  gameActive = true;
  clearInterval(timerInterval); // Clear any running timer
  updateScore();

  // Hide game over and show splash
  document.getElementById('gameover-screen').style.display = 'none';
  document.getElementById('splash-screen').style.display = 'flex';
});

document.getElementById('share-button').addEventListener('click', () => {
  // Use current page URL instead of hardcoded value
  const url = window.location.href;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Game link copied to clipboard!');
      })
      .catch(err => {
        console.error('Clipboard copy failed:', err);
        fallbackCopyText(url);
      });
  } else {
    fallbackCopyText(url);
  }
});

// Fallback for browsers that don't support clipboard API
function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    alert('Game link copied to clipboard!');
  } catch (err) {
    console.error('Fallback copy failed:', err);
    alert(`Copy this link: ${text}`);
  }
  
  document.body.removeChild(textArea);
}

function endGame() {
  clearInterval(timerInterval); // Make sure timer is stopped
  gameActive = false;
  
  const finalScore = correctGuesses;
  const scoreText = `You got ${finalScore} out of ${maxPerRound} correct.`;

  let message = '';
  if (finalScore === maxPerRound) {
    message = "Perfect score! You really know your stuff!";
  } else if (finalScore >= Math.floor(maxPerRound * 0.8)) {
    message = "Pretty good!";
  } else if (finalScore >= Math.floor(maxPerRound * 0.6)) {
    message = "A little more practice!";
  } else if (finalScore >= Math.floor(maxPerRound * 0.2)) {
    message = "You're a dunce!";
  } else {
    message = "Were you even trying?";
  }

  document.getElementById('final-score').textContent = scoreText;
  document.getElementById('final-message').textContent = message;

  document.getElementById('gameover-screen').style.display = 'flex';
}