import Settings from "./Settings.js";

class Timer {
    /**
     *
     * @param {Settings} settings
     */
    constructor(settings) {
        this.timer = 0;
        this.interval = null;
        this.paused = false;

        this.started = null;
        this.ended = null;

        this.settings = settings;
    }

    start() {
        this.paused = false;

        if (this.started === null) {
            this.started = new Date();
        }

        this.interval = setInterval(() => this.tick(), 1000);
    }

    tick() {
        this.timer++;

        const newMinute = this.timer / 60;

        if (Number.isInteger(newMinute)) {
            // @todo move to event
            chrome.browserAction.setBadgeText({text: this.getMinutes().toString()});

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
                    };

                    chrome.notifications.create("", opts);
                }

                if (this.settings.breaksSound) {
                    const sound = new Audio(chrome.runtime.getURL("/assets/sounds/sound.mp3"));
                    sound.play().catch(function (error) {
                        console.error(error);
                    });
                }
            }
        }
    }

    getMinutes() {
        return Math.floor(this.timer / 60);
    }

    pause() {
        clearInterval(this.interval);

        this.paused = true;
    }

    stop() {
        clearInterval(this.interval);

        this.ended = new Date();
    }

    reset() {
        this.timer = 0;
        this.interval = null;
        this.paused = false;
        this.started = null;
    }

    toJSON() {
        return {
            started: this.started.toJSON(),
            ended: this.ended.toJSON(),
            seconds: this.timer
        };
    }
}

export default Timer;
