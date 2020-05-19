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

        if (this.started === null) {
            this.started = new Date();
        }

        chrome.browserAction.setBadgeBackgroundColor({color: "#7cd68a"});
        chrome.browserAction.setBadgeText({text: this.getMinutes().toString()});

        this.interval = setInterval(() => this.tick(), 1000);
    }

    tick() {
        this.timer++;

        const newMinute = this.timer / 60;

        if (Number.isInteger(newMinute)) {
            chrome.browserAction.setBadgeText({text: this.getMinutes().toString()});

            chrome.storage.local.get({
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

        this.save(() => this.reset());
    }

    save(callback) {
        chrome.storage.local.get({
            statistics: null
        }, (items) => {
            let storedData;
            if (items.statistics === null) {
                storedData = {};
            } else {
                storedData = JSON.parse(items.statistics);
            }
            const mergedData = this.mergeCurrentTimerToStorageData(storedData);

            chrome.storage.local.set({
                statistics: JSON.stringify(mergedData)
            }, function () {
                callback();
            });
        });
    }

    mergeCurrentTimerToStorageData(storedData) {
        const year = this.started.getFullYear();
        const month = this.started.getMonth();
        const date = this.started.getDate();

        if (storedData[year] === undefined) {
            storedData[year] = {};
        }

        if (storedData[year][month] === undefined) {
            storedData[year][month] = {};
        }

        if (storedData[year][month][date] === undefined) {
            storedData[year][month][date] = [];
        }

        storedData[year][month][date].push(this.toJSON());

        return storedData;
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
