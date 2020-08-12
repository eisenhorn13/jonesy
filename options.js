import Statistics from "./Statistics.js"
import Settings from "./Settings.js"
import Chart from "./Chart.js";

let settings
let statistics

document.addEventListener('DOMContentLoaded', run)

async function run() {
    settings = await Settings.createFromStorageData()

    document.getElementById('save').addEventListener('click', saveOptions)
    document.getElementById('clearStatistics').addEventListener('click', clearStatistics)
    document.getElementById('exportStatisticsButton').addEventListener('click', onClickExportStatisticsButton)
    document.getElementById('importStatisticsButton').addEventListener('click', onClickImportStatisticsButton)
    document.getElementById('importStatisticsSubmit').addEventListener('click', onClickImportStatisticsSubmit)
    document.getElementById('breaksEnable').addEventListener('click', toggleSubsEnabled)

    document.getElementById('breaksEnable').checked = settings.breaksEnable
    document.getElementById('breaksEvery').value = settings.breaksEvery
    document.getElementById('breaksNotify').checked = settings.breaksNotify
    document.getElementById('breaksSound').checked = settings.breaksSound
    document.getElementById('breaksPausesTimer').checked = settings.breaksPausesTimer

    toggleSubsEnabled()

    await updateStatistics()

    function toggleSubsEnabled() {
        const checkbox = document.getElementById('breaksEnable')
        const breaksEvery = document.getElementById('breaksEvery')
        const breaksNotify = document.getElementById('breaksNotify')
        const breaksSound = document.getElementById('breaksSound')
        const breaksPausesTimer = document.getElementById('breaksPausesTimer')

        if (checkbox.checked) {
            breaksEvery.disabled = false
            breaksNotify.disabled = false
            breaksSound.disabled = false
            breaksPausesTimer.disabled = false

            breaksEvery.parentNode.classList.remove("disabled")
            breaksNotify.parentNode.classList.remove("disabled")
            breaksSound.parentNode.classList.remove("disabled")
            breaksPausesTimer.parentNode.classList.remove("disabled")
        } else {
            breaksEvery.disabled = true
            breaksNotify.disabled = true
            breaksSound.disabled = true
            breaksPausesTimer.disabled = true

            breaksEvery.parentNode.classList.add("disabled")
            breaksNotify.parentNode.classList.add("disabled")
            breaksSound.parentNode.classList.add("disabled")
            breaksPausesTimer.parentNode.classList.add("disabled")
        }
    }

    function saveOptions() {
        settings.breaksEnable = document.getElementById('breaksEnable').checked
        settings.breaksEvery = parseInt(document.getElementById('breaksEvery').value, 10)
        settings.breaksNotify = document.getElementById('breaksNotify').checked
        settings.breaksSound = document.getElementById('breaksSound').checked
        settings.breaksPausesTimer = document.getElementById('breaksPausesTimer').checked

        settings
            .save()
            .then(() => showStatus('Options saved.'))
    }

    async function clearStatistics() {
        if (confirm('Really remove all statistics?')) {
            statistics
                .clear()
                .finally(() => {
                    document.getElementById('statisticsExportField').style.display = 'none'
                    updateStatistics()
                    showStatus("Statistics removed")
                })
        }
    }

    async function onClickExportStatisticsButton() {
        const statisticsExport = document.getElementById('exportStatistics')
        const statisticsExportField = document.getElementById('exportStatisticsField')

        if (statisticsExport.style.display !== 'block') {
            statistics = await Statistics.createFromStorageData()
            statisticsExportField.innerText = statistics.toJSON()
            statisticsExport.style.display = 'block'
        } else {
            statisticsExport.style.display = 'none'
        }
    }

    function onClickImportStatisticsButton() {
        const importStatistics = document.getElementById('importStatistics')
        const importStatisticsField = document.getElementById('importStatisticsField')

        if (importStatistics.style.display !== 'block') {
            importStatisticsField.value = ''
            importStatistics.style.display = 'block'
        } else {
            importStatistics.style.display = 'none'
        }
    }

    function onClickImportStatisticsSubmit() {
        const importStatisticsField = document.getElementById('importStatisticsField')

        try {
            const data = JSON.parse(importStatisticsField.value)

            validateImportStatistics(data)

            statistics = Statistics.fromJSON(data)
            statistics.save()

            document.getElementById('importStatistics').style.display = 'none'
            showStatus("Statistics imported")
        } catch (e) {
            console.log(e)
            if (e instanceof SyntaxError) {
                alert('Not valid JSON')
            } else if (e instanceof Error) {
                alert(e.message)
            }
        }
    }

    function validateImportStatistics(json) {
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

    async function updateStatistics() {
        statistics = await Statistics.createFromStorageData()

        let tracks = 0
        let duration = 0

        statistics.today().forEach((entry) => {
            tracks++
            duration += entry.seconds
        })

        let container = document.getElementById('statistics')
        container.innerHTML = ""
        container.insertAdjacentHTML("beforeend", "<div id='today'>Today: " + tracks + " tracks / " + (duration / 60).toFixed(2) + " min total</div>")

        const chartElement = document.getElementById('chart')
        const chart = new Chart(chartElement, statistics, 600, 150)
        chart.draw()
    }

    function showStatus(text) {
        const status = document.getElementById('status')
        status.textContent = text
        status.style.display = 'block'

        setTimeout(function () {
            status.textContent = ''
            status.style.display = 'none'
        }, 1000)
    }
}
