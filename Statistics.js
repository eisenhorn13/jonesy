class Statistics {
    /**
     *
     * @param {null|Object} data
     */
    constructor(data) {
        /**
         *
         * @type {null|Object}
         */
        this.data = data;
    }

    static async syncFromStorage() {
        return new Promise((resolve) => {
            chrome.storage.local.get({
                statistics: null
            }, (items) => {
                if (items.statistics) {
                    const json = JSON.parse(items.statistics);

                    if (json) {
                        resolve(new this(json));
                        return;
                    }
                }

                resolve(new this(null));
            });
        });
    }

    /**
     *
     * @param {Timer} timer
     * @return {*}
     */
    add(timer) {
        const year = timer.started.getFullYear();
        const month = timer.started.getMonth();
        const date = timer.started.getDate();

        if (this.data === null) {
            this.data = {};
        }

        if (this.data[year] === undefined) {
            this.data[year] = {};
        }

        if (this.data[year][month] === undefined) {
            this.data[year][month] = {};
        }

        if (this.data[year][month][date] === undefined) {
            this.data[year][month][date] = [];
        }

        this.data[year][month][date].push(timer.toJSON());

        this.syncToStorage();
    }

    syncToStorage() {
        if (!this.data) return;

        chrome.storage.local.set({
            statistics: this.export()
        });
    }

    import() {
    }

    export() {
        return JSON.stringify(this.data);
    }

    report() {
        let container = document.createElement("div");

        if (!this.data) return container;

        Object.keys(this.data).map((year) => {
            container.insertAdjacentHTML("beforeend", "<p>" + year + "</p>");

            Object.keys(this.data[year]).map((month) => {
                container.insertAdjacentHTML("beforeend", "<p>" + (parseInt(month, 10) + 1) + "</p>");

                Object.keys(this.data[year][month]).map((day) => {
                    let seconds = 0;
                    this.data[year][month][day].forEach((data) => {
                        seconds += data.seconds;
                    });

                    container.insertAdjacentHTML("beforeend", "<p>" + day + " / entries: " + this.data[year][month][day].length + " / min: " + Math.ceil(seconds / 60) + "</p>");
                });
            });
        });

        return container;
    }

    async clear() {
        return new Promise((resolve) => {
            chrome.storage.local.remove("statistics", () => {
                resolve();
            });
        });
    }
}

export default Statistics;
