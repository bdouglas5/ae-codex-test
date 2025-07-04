const STORAGE_PREFIX = 'projectTime_';

function loadTime(project) {
    const val = localStorage.getItem(STORAGE_PREFIX + project);
    return val ? parseInt(val, 10) : 0;
}

function saveTime(project, seconds) {
    localStorage.setItem(STORAGE_PREFIX + project, String(seconds));
}
