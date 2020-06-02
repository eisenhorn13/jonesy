import Duration from "./Duration.js"

class Statistics {
    /**
     *
     * @param {Array.<Duration>} data
     */
    constructor(data) {
        /**
         *
         * @type {Array.<Duration>}
         */
        this.data = data
    }

    /**
     *
     * @param {Array.<Object>} json
     */
    static fromJSON(json) {
        json = json.map(entry => {
            return Duration.fromJSON(entry)
        })

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
        let data = this.data.map((entry) => {
            return entry.export()
        })

        return JSON.stringify(data)
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

    /**
     *
     * @param {Duration} duration
     */
    add(duration) {
        this.data.push(duration)
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
