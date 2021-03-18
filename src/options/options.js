import Statistics from "../Statistics.js"
import Settings from "../Settings.js"
import Chart from "../Chart.js";

document.addEventListener('DOMContentLoaded', async () => {
    const settings = await Settings.createFromStorageData()

    new OptionsSection(settings)
    const statisticsSection = new StatisticsSection()
    await statisticsSection.refreshStatistics()
})

class OptionsSection {
    #settings

    /**
     *
     * @param {Settings} settings
     */
    constructor(settings) {
        this.#settings = settings

        this.populateFields()
        this.toggleSubsAvailability(document.getElementById('breaksEnable'))
        this.bindEvents()
    }

    /**
     *
     */
    bindEvents() {
        document.getElementById('save').addEventListener('click', () => this.onClickSave())
        document.getElementById('breaksEnable').addEventListener('click', (e) => {
            this.toggleSubsAvailability(e.currentTarget)
        })
    }

    /**
     *
     */
    populateFields() {
        Object.keys(this.#settings).forEach((key) => {
            const element = document.getElementById(key)
            switch (typeof this.#settings[key]) {
                case "boolean":
                    element.checked = this.#settings[key]
                    break
                case "number":
                    element.value = this.#settings[key].toString()
                    break
            }
        })
    }

    /**
     *
     */
    collectValues() {
        Object.keys(this.#settings).forEach((key) => {
            const element = document.getElementById(key)
            switch (typeof this.#settings[key]) {
                case "boolean":
                    this.#settings[key] = element.checked
                    break
                case "number":
                    this.#settings[key] = Math.abs(Number(element.value))
                    break
            }
        });
    }

    /**
     *
     */
    onClickSave() {
        this.collectValues()

        this.#settings
            .save()
            .then(() => showNotification('👌 Options saved'))
    }

    /**
     *
     */
    toggleSubsAvailability(rootCheckboxElement) {
        const children = rootCheckboxElement.parentNode.parentNode.getElementsByClassName('field')

        for (let item of children) {
            if (rootCheckboxElement.checked) {
                item.classList.remove("disabled")
                item.getElementsByTagName('input')[0].disabled = false
            } else {
                item.classList.add("disabled")
                item.getElementsByTagName('input')[0].disabled = true
            }
        }
    }
}

class StatisticsSection {
    #statistics

    constructor() {
        this.bindEvents()
    }

    bindEvents() {
        document.getElementById('clearStatistics').addEventListener('click', () => this.onClickClearStatistics())
        document.getElementById('exportStatisticsButton').addEventListener('click', () => this.onClickExportStatisticsButton())
        document.getElementById('importStatisticsButton').addEventListener('click', this.onClickImportStatisticsButton)
        document.getElementById('importStatisticsSubmit').addEventListener('click', () => this.onClickImportStatisticsSubmit())
    }

    /**
     *
     * @return {undefined}
     */
    async refreshStatistics() {
        this.#statistics = await Statistics.createFromStorageData()

        this.updateTodayStats()
        this.updateChart()
    }

    updateTodayStats() {
        let tracks = 0
        let duration = 0

        this.#statistics.today().forEach((entry) => {
            tracks++
            duration += entry.seconds
        })

        let container = document.getElementById('statistics')
        container.innerHTML = ""
        container.insertAdjacentHTML("beforeend", "<div id='today'>Today: " + tracks + " tracks / " + (duration / 60).toFixed(2) + " min total</div>")
    }

    updateChart() {
        const chartElement = document.getElementById('chart')
        const chart = new Chart(chartElement, this.#statistics, 600, 150)
        chart.draw()
    }

    /**
     *
     * @return {Promise<void>}
     */
    async onClickClearStatistics() {
        if (confirm('Really remove all statistics?')) {
            this.#statistics
                .clear()
                .finally(() => {
                    document.getElementById('exportStatistics').style.display = 'none'
                    document.getElementById('importStatistics').style.display = 'none'
                    this.refreshStatistics()
                    showNotification("Statistics removed")
                })
        }
    }

    /**
     *
     * @return {Promise<void>}
     */
    async onClickExportStatisticsButton() {
        document.getElementById('importStatistics').style.display = 'none'

        const statisticsExport = document.getElementById('exportStatistics')
        const statisticsExportField = document.getElementById('exportStatisticsField')

        if (statisticsExport.style.display !== 'block') {
            await this.refreshStatistics()
            statisticsExportField.innerText = this.#statistics.toJSON()
            statisticsExport.style.display = 'block'
        } else {
            statisticsExport.style.display = 'none'
        }
    }

    /**
     *
     */
    onClickImportStatisticsButton() {
        document.getElementById('exportStatistics').style.display = 'none'

        const importStatistics = document.getElementById('importStatistics')
        const importStatisticsField = document.getElementById('importStatisticsField')

        if (importStatistics.style.display !== 'block') {
            importStatisticsField.value = ''
            importStatistics.style.display = 'block'
        } else {
            importStatistics.style.display = 'none'
        }
    }

    /**
     *
     */
    onClickImportStatisticsSubmit() {
        const importStatisticsField = document.getElementById('importStatisticsField')

        try {
            const data = JSON.parse(importStatisticsField.value)

            this.validateImportStatistics(data)

            this.#statistics = Statistics.createFromJSON(data)
            this.#statistics.save()

            document.getElementById('importStatistics').style.display = 'none'
            showNotification("👌 Statistics imported")

            this.refreshStatistics()
        } catch (e) {
            console.log(e)
            if (e instanceof SyntaxError) {
                alert('Not valid JSON')
            } else if (e instanceof Error) {
                alert(e.message)
            }
        }
    }

    /**
     *
     * @param json
     */
    validateImportStatistics(json) {
        if (json.length === 0) {
            throw new Error('Empty data')
        }

        Object.keys(json).forEach(key => {
            if (
                json[key].seconds === undefined ||
                json[key].started === undefined ||
                json[key].stopped === undefined
            ) {
                throw new Error('Wrong data format')
            }
        })
    }
}

/**
 *
 * @param text
 */
function showNotification(text) {
    const status = document.getElementById('status')
    status.textContent = text
    status.style.display = 'block'

    setTimeout(function () {
        status.textContent = ''
        status.style.display = 'none'
    }, 1000)
}
