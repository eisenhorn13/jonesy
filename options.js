import Statistics from "./Statistics.js";
import Settings from "./Settings.js";

let settings;

document.addEventListener('DOMContentLoaded', run);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('clearStatistics').addEventListener('click', clearStatistics);
document.getElementById('exportStatistics').addEventListener('click', exportStatistics);
document.getElementById('breaksEnable').addEventListener('click', toggleSubsEnabled);

async function run() {
    settings = await Settings.syncFromStorage();

    document.getElementById('breaksEnable').checked = settings.breaksEnable;
    document.getElementById('breaksEvery').value = settings.breaksEvery;
    document.getElementById('breaksNotify').checked = settings.breaksNotify;
    document.getElementById('breaksSound').checked = settings.breaksSound;

    toggleSubsEnabled();

    await updateStatistics();
}

function toggleSubsEnabled() {
    const checkbox = document.getElementById('breaksEnable');
    const breaksEvery = document.getElementById('breaksEvery');
    const breaksNotify = document.getElementById('breaksNotify');
    const breaksSound = document.getElementById('breaksSound');

    if (checkbox.checked) {
        breaksEvery.disabled = false;
        breaksNotify.disabled = false;
        breaksSound.disabled = false;

        breaksEvery.parentNode.classList.remove("disabled");
        breaksNotify.parentNode.classList.remove("disabled");
        breaksSound.parentNode.classList.remove("disabled");
    } else {
        breaksEvery.disabled = true;
        breaksNotify.disabled = true;
        breaksSound.disabled = true;

        breaksEvery.parentNode.classList.add("disabled");
        breaksNotify.parentNode.classList.add("disabled");
        breaksSound.parentNode.classList.add("disabled");
    }
}

function saveOptions() {
    const breaksEnable = document.getElementById('breaksEnable').checked;
    const breaksEvery = document.getElementById('breaksEvery').value;
    const breaksNotify = document.getElementById('breaksNotify').checked;
    const breaksSound = document.getElementById('breaksSound').checked;

    chrome.storage.local.set({
        breaksEnable: breaksEnable,
        breaksEvery: parseInt(breaksEvery),
        breaksNotify: breaksNotify,
        breaksSound: breaksSound
    }, function () {
        showStatus('Options saved.');
    });
}

async function clearStatistics() {
    let statistics = await Statistics.syncFromStorage()
    statistics.clear()
        .finally(() => {
            updateStatistics();
        });
}

async function updateStatistics() {
    let statistics = await Statistics.syncFromStorage();
    let container = document.getElementById('statistics');

    container.innerHTML = "";
    container.appendChild(statistics.report());
}

async function exportStatistics() {
    let container = document.getElementById('statisticsRaw');
    let statistics = await Statistics.syncFromStorage();

    container.value = statistics.export();
    container.style.display = "block";
}

function showStatus(text) {
    const status = document.getElementById('status');
    status.textContent = text;
    status.style.display = 'block';

    setTimeout(function () {
        status.textContent = '';
        status.style.display = 'none';
    }, 1000);
}
