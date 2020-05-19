document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('clearData').addEventListener('click', clearData);
document.getElementById('breaksEnable').addEventListener('click', toggleSubsEnabled);

loadStatistics();

function loadStatistics() {
    const container = document.getElementById('statistics');

    chrome.storage.local.get({
        statistics: null
    }, (items) => {
        const statisticsRaw = items.statistics;

        if (!statisticsRaw) {
            container.textContent = 'No data';
        } else {
            const statistics = JSON.parse(statisticsRaw);

            Object.keys(statistics).map(function (year) {
                container.insertAdjacentHTML("beforeend", "<p>" + year + "</p>");

                Object.keys(statistics[year]).map(function (month) {
                    container.insertAdjacentHTML("beforeend", "<p>" + (parseInt(month, 10) + 1) + "</p>");

                    Object.keys(statistics[year][month]).map(function (day) {
                        let seconds = 0;
                        statistics[year][month][day].forEach(function (data) {
                            seconds += data.seconds;
                        });

                        container.insertAdjacentHTML("beforeend", "<p>" + day + " / entries: " + statistics[year][month][day].length + " / min: " + Math.ceil(seconds / 60) + "</p>");
                    });
                });
            });
        }
    });

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

function restoreOptions() {
    chrome.storage.local.get({
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

    chrome.storage.local.set({
        breaksEnable: breaksEnable,
        breaksEvery: parseInt(breaksEvery),
        breaksNotify: breaksNotify,
        breaksSound: breaksSound
    }, function () {
        showStatus('Options saved.');
    });
}

function clearData() {
    chrome.storage.local.remove("statistics", function () {
        showStatus('Data cleared.');
        loadStatistics();
    });
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
