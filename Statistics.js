class Statistics {
    /**
     *
     * @param {Array.<Object>} data
     */
    constructor(data) {
        /**
         *
         * @type {Array.<Object>}
         */
        this.data = data
    }

    /**
     *
     * @param {Array.<Object>} json
     */
    static fromJSON(json) {
        json = json.map(entry => ({
            duration: Number(entry.duration),
            started: new Date(entry.started),
            ended: new Date(entry.ended)
        }))

        return new this(json)
    }

    /**
     *
     * @return {Promise<Statistics|boolean>}
     */
    static async createFromStorageData() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get({
                statistics: "[]"
            }, (items) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message)
                    reject(false)
                } else {
                    const json = JSON.parse(items.statistics)
                    resolve(this.fromJSON(json))
                }
            })
        })
    }

    /**
     *
     * @return {Object}
     */
    toJSON() {
        return JSON.stringify(this.data)
    }

    /**
     *
     * @return {Promise<boolean>}
     */
    async clear() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove("statistics", () => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message)
                    reject(false)
                } else {
                    resolve(true)
                }
            })
        })
    }

    add(data) {
        this.data.push(data)
    }

    /**
     *
     * @return {Promise<boolean>}
     */
    save() {
        return new Promise((resolve, reject) => {
            if (!this.data) {
                return resolve(true)
            }

            chrome.storage.local.set({
                statistics: this.toJSON()
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message)
                    reject(false)
                } else {
                    resolve(true)
                }
            })
        })
    }
}

export default Statistics
