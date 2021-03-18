class Observable {
    #observers = []
    #events = []

    /**
     *
     * @param {Array} events
     */
    constructor(events) {
        this.#events = events
    }


    /**
     *
     * @param event
     * @param fn
     */
    subscribe(event, fn) {
        if (!this.#events.includes(event)) {
            throw new Error("Wrong observable event passed")
        }

        this.#observers.push({
            event: event,
            fn: fn
        })
    }

    /**
     *
     */
    broadcast(event) {
        if (!this.#events.includes(event)) {
            throw new Error("Wrong observable event passed")
        }

        this.#observers.forEach(subscriber => {
            if (subscriber.event === event) {
                subscriber.fn(this)
            }
        })
    }
}

export default Observable
