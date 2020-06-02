class Settings {
    /**
     *
     * @param {Object} options
     */
    constructor(options) {
        /**
         *
         * @type {boolean}
         */
        this.breaksEnable = options.breaksEnable
        /**
         *
         * @type {number}
         */
        this.breaksEvery = options.breaksEvery
        /**
         *
         * @type {boolean}
         */
        this.breaksNotify = options.breaksNotify
        /**
         *
         * @type {boolean}
         */
        this.breaksSound = options.breaksSound
    }

    /**
     *
     * @return {Promise<Settings>}
     */
    static async createFromStorageData() {
        return new Promise((resolve) => {
            chrome.storage.local.get({
                breaksEnable: false,
                breaksEvery: 1,
                breaksNotify: true,
                breaksSound: true
            }, (items) => {
                resolve(new this(items))
            })
        })
    }

    /**
     *
     * @return {Promise<Settings>}
     */
    async save() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({
                breaksEnable: this.breaksEnable,
                breaksEvery: this.breaksEvery,
                breaksNotify: this.breaksNotify,
                breaksSound: this.breaksSound
            }, function () {
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

export default Settings
