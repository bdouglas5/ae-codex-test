let timer = null;
let elapsedSeconds = 0;
let sessionSeconds = 0;
let idleTimeout = 2 * 60 * 1000; // 2 minutes default
let idleTimer = null;
let pausedByIdle = false;
let currentProject = '';
let sessionAlert = 90 * 60; // 90 minutes default

const timerEl = document.getElementById('timer');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const refreshBtn = document.getElementById('refreshBtn');
const idleInput = document.getElementById('idleInput');
const sessionInput = document.getElementById('sessionInput');
const exportBtn = document.getElementById('exportBtn');
const projectNameEl = document.getElementById('projectName');

function parseTime(str) {
    const parts = str.split(':').map(p => parseInt(p, 10));
    if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0)) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return null;
}

function getProjectName() {
    try {
        if (app.project) {
            if (app.project.file && app.project.file.name) {
                return app.project.file.name;
            }
            if (app.project.name) {
                return app.project.name;
            }
        }
    } catch (e) {
        // not running in host app or project unsaved
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
        sessionSeconds++;
        if (sessionSeconds >= sessionAlert) {
            alert('Time to take a break!');
            sessionSeconds = 0;
        }
        updateDisplay();
    }, 1000);
    pausedByIdle = false;
}

function pauseTimer(byIdle = false) {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    pausedByIdle = byIdle;
    sessionSeconds = 0;
}

function resumeTimer() {
    if (!timer) {
        startTimer();
    }
}

function resetTimer() {
    pauseTimer();
    elapsedSeconds = 0;
    sessionSeconds = 0;
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
        if (currentProject && currentProject !== 'Untitled') {
            saveCurrentTime();
        }
        currentProject = name;
        projectNameEl.textContent = currentProject === 'Untitled' ? 'Unsaved Project' : currentProject;
        loadCurrentProject();
        if (currentProject === 'Untitled') {
            pauseTimer();
        } else {
            startTimer();
        }
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

function exportCsv() {
    const rows = ['Project,Total Time (HH:MM:SS)'];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(STORAGE_PREFIX)) {
            const project = key.slice(STORAGE_PREFIX.length);
            const secs = parseInt(localStorage.getItem(key), 10) || 0;
            rows.push(`${project},${formatTime(secs)}`);
        }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'time-tracking.csv';
    a.click();
    URL.revokeObjectURL(url);
}

playBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', () => pauseTimer(false));
refreshBtn.addEventListener('click', resetTimer);
timerEl.addEventListener('click', () => {
    const input = prompt('Set time (HH:MM:SS)', formatTime(elapsedSeconds));
    if (!input) return;
    const secs = parseTime(input.trim());
    if (secs !== null) {
        elapsedSeconds = secs;
        sessionSeconds = 0;
        updateDisplay();
    }
});
exportBtn.addEventListener('click', exportCsv);

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

sessionInput.addEventListener('change', () => {
    const val = parseInt(sessionInput.value, 10);
    if (!isNaN(val) && val > 0) {
        sessionAlert = val * 60;
    }
});

window.addEventListener('beforeunload', saveCurrentTime);

function init() {
    idleInput.value = idleTimeout / 60000;
    sessionInput.value = sessionAlert / 60;
    checkProjectChange();
    resetIdle();
    setInterval(checkProjectChange, 2000);
}

document.addEventListener('DOMContentLoaded', init);
