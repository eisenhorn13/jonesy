class Settings {
    constructor(options) {
        this.breaksEnable = options.breaksEnable;
        this.breaksEvery = options.breaksEvery;
        this.breaksNotify = options.breaksNotify;
        this.breaksSound = options.breaksSound;
    }

    /**
     *
     * @return {Promise<Settings>}
     */
    static async syncFromStorage() {
        return new Promise((resolve) => {
            chrome.storage.local.get({
                breaksEnable: false,
                breaksEvery: 1,
                breaksNotify: true,
                breaksSound: true
            }, (items) => {
                resolve(new this(items));
            });
        });
    }
}

export default Settings;
