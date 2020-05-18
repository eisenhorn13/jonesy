class Timer {
    constructor() {
        this.timer = 0;
        this.interval = null;
        this.paused = false;

        this.started = null;
        this.ended = null;
    }

    start() {
        this.paused = false;
        this.started = new Date();

        chrome.browserAction.setBadgeBackgroundColor({color: "#7cd68a"});
        chrome.browserAction.setBadgeText({text: this.getMinutes().toString()});

        this.interval = setInterval(() => this.tick(), 1000);
    }

    tick() {
        this.timer++;

        const newMinute = this.timer / 60;

        if (Number.isInteger(newMinute)) {
            chrome.browserAction.setBadgeText({text: this.getMinutes().toString()});

            chrome.storage.sync.get({
                breaksEnable: false,
                breaksEvery: 1,
                breaksNotify: true,
                breaksSound: true
            }, (items) => {
                if (items.breaksEnable && Number.isInteger(newMinute / items.breaksEvery)) {
                    if (items.breaksNotify) {
                        const opts = {
                            type: "basic",
                            iconUrl: chrome.extension.getURL("/clock-128x128.png"),
                            title: "Jonesy timer",
                            message: items.breaksEvery + " minutes passed. It`s time to take a break."
                        };

                        chrome.notifications.create("", opts);
                    }

                    if (items.breaksSound) {
                        const sound = new Audio(chrome.runtime.getURL("/sound.mp3"));
                        sound.play();
                    }
                }
            });
        }
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

        this.ended = new Date();

        this.reset();
    }

    reset() {
        this.timer = 0;
        this.interval = null;
        this.paused = false;
        this.started = null;

        chrome.browserAction.setBadgeText({text: ""});
    }

    toJSON() {
        return {
            started: this.started.toJSON(),
            ended: this.ended.toJSON(),
            seconds: this.timer
        };
    }
}

let timer;

timer = new Timer();

chrome.contextMenus.create({
    title: "Start timer",
    contexts: ["browser_action"],
    onclick: startTimer
});

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
