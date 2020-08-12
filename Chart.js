export default class Chart {
    constructor(canvas, data, width, height) {
        this.canvas = canvas

        /**
         * @type Statistics
         */
        this.data = data

        this.width = width
        this.height = height

        this.canvas.style.width = this.width + "px"
        this.canvas.style.height = this.height + "px"

        this.ctx = this.canvas.getContext("2d")

        this.canvas.width = this.width * window.devicePixelRatio
        this.canvas.height = this.height * window.devicePixelRatio

        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    /**
     * @param {number} month
     * @param {number} year
     * @return {number}
     */
    daysInMonth(month, year) {
        return new Date(year, month, 0).getDate()
    }

    /**
     *
     */
    draw() {
        const date = new Date()
        const daysInMonth = this.daysInMonth(date.getMonth(), date.getFullYear())

        const cellWidth = this.width / daysInMonth
        const cellPadding = 1

        let dailyTotal = new Array(daysInMonth).fill(0)
        this.data.month(date.getMonth(), date.getFullYear()).forEach((entry) => {
            dailyTotal[entry.started.getDate() - 1] += entry.seconds
        })

        const dailyMax = Math.max(...dailyTotal)

        let currentX = 0
        dailyTotal.forEach((seconds, day) => {
            const color = (day + 1 === date.getDate()) ? "#ff0000" : "#000"
            this.text(
                (day + 1).toString(),
                currentX + (cellWidth / 2),
                this.height - 16,
                color
            )

            const height = Math.round((this.height - 20) * seconds / dailyMax)
            this.rectangle(
                currentX + cellPadding,
                this.height - 20 - height,
                cellWidth - cellPadding,
                height,
                "#403131"
            )

            currentX += cellWidth
        })
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {string} color
     */
    rectangle(x, y, width, height, color) {
        this.ctx.save()
        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, width, height)
        this.ctx.restore()
    }

    /**
     * @param {string} text
     * @param {number} x
     * @param {number} y
     * @param {string} color
     */
    text(text, x, y, color = "#000") {
        this.ctx.font = "12px sans-serif"
        this.ctx.fillStyle = color
        this.ctx.textBaseline = "top"
        this.ctx.textAlign = "center"
        this.ctx.fillText(text, x, y)
    }

}
