class Timer {
    constructor() {
        this.timer = 0;
        this.interval = null;
        this.paused = false;
    }

    start() {
        this.paused = false;

        chrome.browserAction.setBadgeBackgroundColor({color: "#7cd68a"});
        chrome.browserAction.setBadgeText({text: this.getMinutes().toString()});

        this.interval = setInterval(() => {
            this.timer++;

            const newMinute = this.timer / 60;

            if (Number.isInteger(newMinute)) {
                chrome.browserAction.setBadgeText({text: this.getMinutes().toString()});
            }
        }, 1000);
    }

    getMinutes() {
        return Math.floor(this.timer / 60);
    }

    pause() {
        clearInterval(this.interval);

        this.paused = true;
        chrome.browserAction.setBadgeBackgroundColor({color: "#d1d1d1"});
    }

    stop() {
        clearInterval(this.interval);

        this.timer = 0;
        this.interval = null;
        this.paused = false;
        chrome.browserAction.setBadgeText({text: ""});
    }
}

let timer = new Timer();

chrome.browserAction.onClicked.addListener(function () {
    if (timer.interval) {
        if (timer.paused) {
            startTimer();
        } else {
            pauseTimer();
        }
    } else {
        startTimer();
    }
});

function startTimer() {
    timer.start();

    chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
        title: "Pause timer",
        contexts: ["browser_action"],
        onclick: pauseTimer
    });

    chrome.contextMenus.create({
        title: "Stop timer",
        contexts: ["browser_action"],
        onclick: stopTimer
    });
}

function pauseTimer() {
    timer.pause();

    chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
        title: "Resume timer",
        contexts: ["browser_action"],
        onclick: resumeTimer
    });

    chrome.contextMenus.create({
        title: "Stop timer",
        contexts: ["browser_action"],
        onclick: stopTimer
    });
}

function resumeTimer() {
    timer.start();

    chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
        title: "Pause timer",
        contexts: ["browser_action"],
        onclick: pauseTimer
    });

    chrome.contextMenus.create({
        title: "Stop timer",
        contexts: ["browser_action"],
        onclick: stopTimer
    });
}

function stopTimer() {
    timer.stop();

    chrome.contextMenus.removeAll();

    chrome.contextMenus.create({
        title: "Start timer",
        contexts: ["browser_action"],
        onclick: startTimer
    });
}

chrome.contextMenus.create({
    title: "Start timer",
    contexts: ["browser_action"],
    onclick: startTimer
});
