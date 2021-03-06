import {Timer, TimerStates} from "../Timer.js"
import Statistics from "../Statistics.js"
import Settings from "../Settings.js"

async function run() {
    let timer = new Timer()
    timer.subscribe("StateChanged", (broadcastTimer) => updateMenu(broadcastTimer))
    timer.subscribe("StateChanged", (broadcastTimer) => updateBadge(broadcastTimer))
    timer.subscribe("NewMinute", (broadcastTimer) => updateBadge(broadcastTimer))
    timer.subscribe("NewMinute", (broadcastTimer) => notify(broadcastTimer))
    timer.broadcast("StateChanged")

    chrome.browserAction.onClicked.addListener(() => {
        switch (timer.getState()) {
            case TimerStates.Stopped:
                timer.start()
                break
            case TimerStates.Running:
                timer.pause()
                break
            case TimerStates.Paused:
                timer.resume()
                break
        }
    })

    chrome.commands.onCommand.addListener((command) => {
        if (command === "toggle-timer") {
            switch (timer.getState()) {
                case TimerStates.Stopped:
                    timer.start()
                    break
                case TimerStates.Running:
                    timer.pause()
                    break
                case TimerStates.Paused:
                    timer.resume()
                    break
            }
        }
    });

    /**
     *
     * @param {Timer} broadcastTimer
     */
    function updateMenu(broadcastTimer) {
        chrome.contextMenus.removeAll()

        switch (broadcastTimer.getState()) {
            case TimerStates.Stopped:
                createMenuItem("Start timer", () => broadcastTimer.start())
                break
            case TimerStates.Running:
                createMenuItem("Pause timer", () => broadcastTimer.pause())
                createMenuItem("Stop timer", async () => stopTimer(broadcastTimer))
                break
            case TimerStates.Paused:
                createMenuItem("Resume timer", () => broadcastTimer.resume())
                createMenuItem("Stop timer", async () => stopTimer(broadcastTimer))
        }
    }

    /**
     *
     * @param {Timer} broadcastTimer
     * @return {Promise<void>}
     */
    async function stopTimer(broadcastTimer) {
        broadcastTimer.stop()

        let statistics = await Statistics.createFromStorageData()
        statistics.add(broadcastTimer.duration)
        await statistics.save()

        broadcastTimer.reset()
    }

    function createMenuItem(title, fn) {
        chrome.contextMenus.create({
            title: title,
            contexts: ["browser_action"],
            onclick: fn
        })
    }

    /**
     *
     * @param {Timer} broadcastTimer
     */
    async function updateBadge(broadcastTimer) {
        switch (broadcastTimer.getState()) {
            case TimerStates.Stopped:
                chrome.browserAction.setBadgeText({text: ""})
                break
            case TimerStates.Running:
                chrome.browserAction.setTitle({title: ""})
                chrome.browserAction.setBadgeBackgroundColor({color: "#7cd68a"})

                let settings = await Settings.createFromStorageData()
                let badgeText
                if (settings.breaksIsACountdown) {
                    badgeText = (settings.breaksEvery - broadcastTimer.duration.minutes).toString()
                } else {
                    badgeText = broadcastTimer.duration.minutes.toString()
                }

                chrome.browserAction.setBadgeText({text: badgeText})
                break
            case TimerStates.Paused:
                chrome.browserAction.setBadgeBackgroundColor({color: "#d1d1d1"})
                break
        }
    }

    /**
     *
     * @param {Timer} broadcastTimer
     */
    async function notify(broadcastTimer) {
        // Update settings on the go
        let settings = await Settings.createFromStorageData()

        if (
            settings.breaksEnable &&
            Number.isInteger(broadcastTimer.duration.minutes / settings.breaksEvery)
        ) {
            if (settings.breaksPausesTimer) {
                timer.pause()
            }

            if (settings.breaksNotify) {
                const opts = {
                    type: "basic",
                    iconUrl: chrome.extension.getURL("/assets/images/clock-128x128.png"),
                    title: "Jonesy timer",
                    message: settings.breaksEvery + " minutes passed. It`s time to take a break."
                }

                chrome.notifications.create("", opts)
            }

            if (settings.breaksSound) {
                const sound = new Audio(chrome.runtime.getURL("/assets/sounds/sound.mp3"))
                sound.play().catch(function (error) {
                    console.error(error)
                })
            }
        }
    }
}

run()
