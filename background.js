import Timer from "./Timer.js";
import Statistics from "./Statistics.js";
import Settings from "./Settings.js";

async function run() {
    let timer = new Timer(await Settings.syncFromStorage());

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

        chrome.browserAction.setBadgeBackgroundColor({color: "#7cd68a"});
        chrome.browserAction.setBadgeText({text: timer.getMinutes().toString()});

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

        chrome.browserAction.setBadgeBackgroundColor({color: "#d1d1d1"});

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

    async function stopTimer() {
        timer.stop();

        let statistics = await Statistics.syncFromStorage();
        statistics.add(timer);

        timer.reset();

        chrome.browserAction.setBadgeText({text: ""});

        chrome.contextMenus.removeAll();

        chrome.contextMenus.create({
            title: "Start timer",
            contexts: ["browser_action"],
            onclick: startTimer
        });
    }
}

run().catch(function (error) {
    console.error(error);
});
