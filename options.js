import Statistics from "./Statistics.js"
import Settings from "./Settings.js"

let settings
let statistics

document.addEventListener('DOMContentLoaded', run)

async function run() {
    settings = await Settings.createFromStorageData()

    document.getElementById('save').addEventListener('click', saveOptions)
    document.getElementById('clearStatistics').addEventListener('click', clearStatistics)
    document.getElementById('breaksEnable').addEventListener('click', toggleSubsEnabled)

    document.getElementById('breaksEnable').checked = settings.breaksEnable
    document.getElementById('breaksEvery').value = settings.breaksEvery
    document.getElementById('breaksNotify').checked = settings.breaksNotify
    document.getElementById('breaksSound').checked = settings.breaksSound

    toggleSubsEnabled()

    await updateStatistics()

    function toggleSubsEnabled() {
        const checkbox = document.getElementById('breaksEnable')
        const breaksEvery = document.getElementById('breaksEvery')
        const breaksNotify = document.getElementById('breaksNotify')
        const breaksSound = document.getElementById('breaksSound')

        if (checkbox.checked) {
            breaksEvery.disabled = false
            breaksNotify.disabled = false
            breaksSound.disabled = false

            breaksEvery.parentNode.classList.remove("disabled")
            breaksNotify.parentNode.classList.remove("disabled")
            breaksSound.parentNode.classList.remove("disabled")
        } else {
            breaksEvery.disabled = true
            breaksNotify.disabled = true
            breaksSound.disabled = true

            breaksEvery.parentNode.classList.add("disabled")
            breaksNotify.parentNode.classList.add("disabled")
            breaksSound.parentNode.classList.add("disabled")
        }
    }

    function saveOptions() {
        settings.breaksEnable = document.getElementById('breaksEnable').checked
        settings.breaksEvery = parseInt(document.getElementById('breaksEvery').value, 10)
        settings.breaksNotify = document.getElementById('breaksNotify').checked
        settings.breaksSound = document.getElementById('breaksSound').checked

        settings
            .save()
            .then(() => showStatus('Options saved.'))
    }

    async function clearStatistics() {
        statistics
            .clear()
            .finally(() => {
                updateStatistics()
                showStatus("Statistics removed")
            })
    }

    async function updateStatistics() {
        statistics = await Statistics.createFromStorageData()

        const today = new Date()
        let tracks = 0;
        let duration = 0;
        statistics.data.forEach((entry) => {
            if (
                entry.started.getDate() === today.getDate() &&
                entry.started.getMonth() === today.getMonth() &&
                entry.started.getFullYear() === today.getFullYear()
            ) {
                tracks++
                duration += entry.seconds
            }
        })

        let container = document.getElementById('statistics')
        container.innerHTML = ""
        container.insertAdjacentHTML("beforeend", "<p>Today " + tracks + " tracks</p>")
        let min = (duration / 60).toFixed(1)
        container.insertAdjacentHTML("beforeend", "<p>Duration: " + min + " min</p>")
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
