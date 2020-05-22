import Observable from "./Observable.js";
import Duration from "./Duration.js";

const TimerStates = {
    Stopped: 0,
    Running: 1,
    Paused: 2
}
Object.freeze(TimerStates);

class Timer extends Observable {
    #state = TimerStates.Stopped

    duration

    #interval = null

    constructor() {
        super([
            "StateChanged",
            "NewMinute"
        ]);
    }

    /**
     *
     * @param {TimerStates} state
     */
    setState(state) {
        this.#state = state
        this.broadcast("StateChanged")
    }

    getState() {
        return this.#state
    }

    start() {
        if (this.#state !== TimerStates.Running) {
            this.duration = new Duration()
            this.duration.start()
        }
        this.#interval = setInterval(() => this.tick(), 1000)
        this.setState(TimerStates.Running)
    }

    stop() {
        clearInterval(this.#interval)
        this.duration.stop();
        this.setState(TimerStates.Stopped)
    }

    pause() {
        clearInterval(this.#interval)
        this.setState(TimerStates.Paused)
    }

    resume() {
        this.#interval = setInterval(() => this.tick(), 1000)
        this.setState(TimerStates.Running)
    }

    reset() {
        this.duration = new Duration()
        this.#interval = null
    }

    /**
     *
     */
    tick() {
        this.duration.increment()

        if (Number.isInteger(this.duration.seconds / 60)) {
            this.broadcast("NewMinute");
        }
    }
}

export {
    Timer,
    TimerStates
}
