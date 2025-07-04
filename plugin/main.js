let timer = null;
let elapsedSeconds = 0;
const timerEl = document.getElementById('timer');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const refreshBtn = document.getElementById('refreshBtn');
const projectPlayBtn = document.getElementById('projectPlayBtn');

function formatTime(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function updateDisplay() {
    timerEl.textContent = formatTime(elapsedSeconds);
}

function startTimer() {
    if (timer) return;
    timer = setInterval(() => {
        elapsedSeconds++;
        updateDisplay();
    }, 1000);
}

function pauseTimer() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
}

function resetTimer() {
    pauseTimer();
    elapsedSeconds = 0;
    updateDisplay();
}

playBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
refreshBtn.addEventListener('click', resetTimer);
projectPlayBtn.addEventListener('click', startTimer);

updateDisplay();
