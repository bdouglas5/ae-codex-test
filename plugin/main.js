let timer = null;
let elapsedSeconds = 0;
let idleTimeout = 2 * 60 * 1000; // 2 minutes default
let idleTimer = null;
let pausedByIdle = false;
let currentProject = '';

const timerEl = document.getElementById('timer');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const refreshBtn = document.getElementById('refreshBtn');
const idleInput = document.getElementById('idleInput');
const projectNameEl = document.getElementById('projectName');

function getProjectName() {
    try {
        if (app.project && app.project.file) {
            return app.project.file.name;
        }
    } catch (e) {
        // not running in AE or project unsaved
    }
    return 'Untitled';
}

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
    pausedByIdle = false;
}

function pauseTimer(byIdle = false) {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    pausedByIdle = byIdle;
}

function resumeTimer() {
    if (!timer) {
        startTimer();
    }
}

function resetTimer() {
    pauseTimer();
    elapsedSeconds = 0;
    updateDisplay();
}

function saveCurrentTime() {
    if (currentProject) {
        saveTime(currentProject, elapsedSeconds);
    }
}

function loadCurrentProject() {
    elapsedSeconds = loadTime(currentProject);
    updateDisplay();
}

function checkProjectChange() {
    const name = getProjectName();
    if (name !== currentProject) {
        if (currentProject) {
            saveCurrentTime();
        }
        currentProject = name;
        projectNameEl.textContent = currentProject;
        loadCurrentProject();
    }
}

function handleIdle() {
    pauseTimer(true);
}

function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(handleIdle, idleTimeout);
    if (pausedByIdle) {
        resumeTimer();
    }
}

playBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', () => pauseTimer(false));
refreshBtn.addEventListener('click', resetTimer);

['mousemove', 'keydown', 'focus'].forEach(evt => {
    window.addEventListener(evt, resetIdle);
});

idleInput.addEventListener('change', () => {
    const val = parseInt(idleInput.value, 10);
    if (!isNaN(val) && val > 0) {
        idleTimeout = val * 60 * 1000;
    }
    resetIdle();
});

window.addEventListener('beforeunload', saveCurrentTime);

function init() {
    idleInput.value = idleTimeout / 60000;
    checkProjectChange();
    startTimer();
    resetIdle();
    setInterval(checkProjectChange, 2000);
}

document.addEventListener('DOMContentLoaded', init);
