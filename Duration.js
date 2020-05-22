class Duration {
    constructor() {
        this.seconds = 0
        this.started = null
        this.stopped = null
    }

    get minutes() {
        return Math.floor(this.seconds / 60)
    }

    static fromJSON(entry) {
        let duration = new Duration();
        duration.seconds = Number(entry.seconds)
        duration.started = new Date(entry.started)
        duration.stopped = new Date(entry.stopped)

        return duration
    }

    start() {
        this.started = new Date()
    }

    stop() {
        this.stopped = new Date()
    }

    increment() {
        this.seconds++;
    }

    reset() {
        this.duration = 0
        this.started = null
        this.stopped = null
    }

    export() {
        return {
            seconds: this.seconds,
            started: this.started,
            stopped: this.stopped
        }
    }
}

export default Duration
