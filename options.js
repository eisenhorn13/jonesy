document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('breaksEnable').addEventListener('click', toggleSubsEnabled);

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

function restoreOptions() {
    chrome.storage.sync.get({
        breaksEnable: false,
        breaksEvery: 1,
        breaksNotify: true,
        breaksSound: true
    }, function (items) {
        document.getElementById('breaksEnable').checked = items.breaksEnable;
        document.getElementById('breaksEvery').value = items.breaksEvery;
        document.getElementById('breaksNotify').checked = items.breaksNotify;
        document.getElementById('breaksSound').checked = items.breaksSound;

        toggleSubsEnabled();
    });
}

function saveOptions() {
    const breaksEnable = document.getElementById('breaksEnable').checked;
    const breaksEvery = document.getElementById('breaksEvery').value;
    const breaksNotify = document.getElementById('breaksNotify').checked;
    const breaksSound = document.getElementById('breaksSound').checked;

    chrome.storage.sync.set({
        breaksEnable: breaksEnable,
        breaksEvery: parseInt(breaksEvery),
        breaksNotify: breaksNotify,
        breaksSound: breaksSound
    }, function () {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';

        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}
