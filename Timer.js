import Settings from "./Settings.js"

const TimerStates = {
    Stopped: 0,
    Running: 1,
    Paused: 2
}
Object.freeze(TimerStates);

class Timer {
    /**
     *
     * @param {Settings} settings
     */
    constructor(settings) {
        this.state = TimerStates.Stopped

        this.duration = 0
        this.started = null
        this.ended = null

        this.interval = null

        this.settings = settings
    }

    start() {
        if (this.state !== TimerStates.Started) {
            this.started = new Date()
        }

        this.state = TimerStates.Running

        this.interval = setInterval(() => this.tick(), 1000)
    }

    stop() {
        this.state = TimerStates.Stopped
        this.ended = new Date()
        clearInterval(this.interval)
    }

    pause() {
        this.state = TimerStates.Paused
        clearInterval(this.interval)
    }

    resume() {
        this.state = TimerStates.Running
        this.interval = setInterval(() => this.tick(), 1000)
    }

    /**
     *
     */
    tick() {
        this.duration++

        const newMinute = this.duration / 60

        if (Number.isInteger(newMinute)) {
            // @todo move to event
            chrome.browserAction.setBadgeText({text: this.getDurationInMinutes()})

            if (
                this.settings.breaksEnable &&
                Number.isInteger(newMinute / this.settings.breaksEvery)
            ) {
                if (this.settings.breaksNotify) {
                    const opts = {
                        type: "basic",
                        iconUrl: chrome.extension.getURL("/assets/images/clock-128x128.png"),
                        title: "Jonesy timer",
                        message: this.settings.breaksEvery + " minutes passed. It`s time to take a break."
                    }

                    chrome.notifications.create("", opts)
                }

                if (this.settings.breaksSound) {
                    const sound = new Audio(chrome.runtime.getURL("/assets/sounds/sound.mp3"))
                    sound.play().catch(function (error) {
                        console.error(error)
                    })
                }
            }
        }
    }

    /**
     *
     * @return {string}
     */
    getDurationInMinutes() {
        return Math.floor(this.duration / 60).toString()
    }

    /**
     *
     * @return {string}
     */
    getStartDate() {
        const year = this.started.getFullYear()
        const month = ("0" + (this.started.getMonth() + 1)).slice(-2)
        const day = ("0" + this.started.getDate()).slice(-2)

        return year + '-' + month + '-' + day
    }
}

export {
    Timer,
    TimerStates
}
