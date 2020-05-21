import {Timer, TimerStates} from "./Timer.js"
import Statistics from "./Statistics.js"
import Settings from "./Settings.js"

/**
 * @type Timer
 */
async function run() {
    let timer = new Timer(await Settings.createFromStorageData())

    updateMenu()
    updateBadge()

    chrome.browserAction.onClicked.addListener(() => {
        switch (timer.state) {
            case TimerStates.Stopped:
                startTimer()
                break
            case TimerStates.Running:
                pauseTimer()
                break
            case TimerStates.Paused:
                resumeTimer()
                break
        }
    })

    function updateMenu() {
        chrome.contextMenus.removeAll()

        switch (timer.state) {
            case TimerStates.Stopped:
                chrome.contextMenus.create({
                    title: "Start timer",
                    contexts: ["browser_action"],
                    onclick: startTimer
                })
                break
            case TimerStates.Running:
                chrome.contextMenus.create({
                    title: "Pause timer",
                    contexts: ["browser_action"],
                    onclick: pauseTimer
                })

                chrome.contextMenus.create({
                    title: "Stop timer",
                    contexts: ["browser_action"],
                    onclick: stopTimer
                })
                break
            case TimerStates.Paused:
                chrome.contextMenus.create({
                    title: "Resume timer",
                    contexts: ["browser_action"],
                    onclick: resumeTimer
                })

                chrome.contextMenus.create({
                    title: "Stop timer",
                    contexts: ["browser_action"],
                    onclick: stopTimer
                })
                break
        }
    }

    function updateBadge() {
        switch (timer.state) {
            case TimerStates.Stopped:
                chrome.browserAction.setBadgeText({text: ""})
                break
            case TimerStates.Running:
                chrome.browserAction.setTitle({title: ""});
                chrome.browserAction.setBadgeBackgroundColor({color: "#7cd68a"})
                chrome.browserAction.setBadgeText({text: timer.getDurationInMinutes()})
                break
            case TimerStates.Paused:
                chrome.browserAction.setBadgeBackgroundColor({color: "#d1d1d1"})
                break
        }
    }

    async function startTimer() {
        timer.start()
        updateMenu()
        updateBadge()
    }

    function resumeTimer() {
        timer.resume()
        updateMenu()
        updateBadge()
    }

    function pauseTimer() {
        timer.pause()
        updateMenu()
        updateBadge()
    }

    async function stopTimer() {
        timer.stop()

        let statistics = await Statistics.createFromStorageData()
        statistics.add(timer)
        await statistics.save()

        timer = new Timer(await Settings.createFromStorageData())

        updateMenu()
        updateBadge()
    }
}

run()
