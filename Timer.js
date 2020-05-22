import Observable from "./Observable.js";

const TimerStates = {
    Stopped: 0,
    Running: 1,
    Paused: 2
}
Object.freeze(TimerStates);

class Timer extends Observable {
    #state = TimerStates.Stopped

    #duration = 0
    #started = null
    #ended = null

    #interval = null

    constructor() {
        super([
            "StateChanged",
            "NewMinute"
        ]);
    }


    isRunning() {
        return this.#state === TimerStates.Running
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
        if (!this.isRunning()) {
            this.#started = new Date()
        }

        this.setState(TimerStates.Running)

        this.#interval = setInterval(() => this.tick(), 1000)
    }

    stop() {
        clearInterval(this.#interval)

        this.setState(TimerStates.Stopped)
        this.#ended = new Date()
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
        this.#duration = 0
        this.#started = null
        this.#ended = null

        this.#interval = null
    }

    export() {
        return {
            duration: this.#duration,
            started: this.#started,
            ended: this.#ended
        }
    }

    /**
     *
     */
    tick() {
        this.#duration++

        if (Number.isInteger(this.#duration / 60)) {
            this.broadcast("NewMinute");
        }
    }

    /**
     *
     * @return {number}
     */
    getDurationInMinutes() {
        return Math.floor(this.#duration / 60)
    }
}

export {
    Timer,
    TimerStates
}
