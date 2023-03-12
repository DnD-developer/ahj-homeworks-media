import uuid4 from "uuid4"

export default class TimeLine {
	constructor(parrentElement) {
		this.parrentElement = document.querySelector(parrentElement)
		this.posts = JSON.parse(localStorage.getItem("time-line-list")) || []

		this.callSendEventForForm = this.callSendEventForForm.bind(this)
	}

	init() {
		this.timeLine = document.createElement("div")
		this.timeLine.classList.add("time-line")

		this.timeLineList = document.createElement("ul")
		this.timeLineList.classList.add("time-line__list")

		this.timeLine.appendChild(this.timeLineList)

		this.timeLine.insertAdjacentHTML(
			"beforeend",
			`
                <form class="time-line__form" name="time-line__form" id="time-line__form">
                    <textarea class="time-line__textarea" name="time-line__textarea"></textarea>
                    <div class="time-line__audio">
                        <input name="time-line__audio" type="file" />
                        <span>
                            <i class="fa-solid fa-volume-low"></i>
                        </span>
                    </div>

                    <div class="time-line__video">
                        <input name="time-line__video" type="file" />
                        <span>
                            <i class="fa-solid fa-video"></i>
                        </span>
                    </div>
                </form>
            `
		)

		this.mainForm = this.timeLine.querySelector("#time-line__form")
		this.sendTextArea = this.mainForm.querySelector("textarea")

		this.parrentElement.appendChild(this.timeLine)

		this.coord = "51.50651, 0.235432"

		this.addEvent()

		this.renderPosts("all")
	}

	createPost(type) {
		const id = uuid4()

		const item = document.createElement("li")
		item.classList.add("time-line__item")
		item.dataset.id = id

		const date = this.dateFormat()

		item.innerHTML = `
            <span class="time-line__item-date">${date}</span>
            <p class="time-line__item-text">${this.sendTextArea.value}</p>
            <span class="time-line__item-coord">${this.coord}</span>
        `

		this.posts.push({
			id,
			type,
			element: item
		})

		localStorage.setItem("time-line-list", JSON.stringify(this.posts))

		this.renderPosts()
	}

	renderPosts(all = null) {
		if (!all) {
			this.timeLineList.insertAdjacentElement("afterbegin", this.posts[this.posts.length - 1].element)
			return
		}

		if (this.posts.length !== 0) {
			this.posts.forEach(post => this.timeLineList.insertAdjacentElement("afterbegin", post.element))
		}
	}

	addEvent() {
		this.mainForm.addEventListener("submit", e => {
			e.preventDefault()

			this.createPost()
		})

		this.sendTextArea.addEventListener("keydown", this.callSendEventForForm)

		this.sendTextArea.addEventListener("keyup", e => {
			if (e.key === "Shift") {
				this.sendTextArea.addEventListener("keydown", this.callSendEventForForm)
			}
		})
	}

	callSendEventForForm(e) {
		if (e.key === "Shift") {
			this.sendTextArea.removeEventListener("keydown", this.callSendEventForForm)
		}

		if (e.key === "Enter") {
			e.preventDefault()

			if (this.sendTextArea.value !== "") {
				this.mainForm.dispatchEvent(new MouseEvent("submit"))
			}
		}
	}

	dateFormat() {
		const date = new Date()

		function formatElementDate(type) {
			switch (type) {
				case "Date":
				case "Hours":
				case "Minutes":
					return date[`get${type}`]() < 10 ? `0${date[`get${type}`]()}` : `${date[`get${type}`]()}`
				case "Month":
					return date[`get${type}`]() < 10 ? `0${date[`get${type}`]() + 1}` : `${date[`get${type}`]() + 1}`
				case "Year":
					return `${date.getFullYear().toString()[2]}${date.getFullYear().toString()[3]}`
				default:
					return false
			}
		}

		const day = formatElementDate("Date")
		const month = formatElementDate("Month")
		const year = formatElementDate("Year")
		const hours = formatElementDate("Hours")
		const minutes = formatElementDate("Minutes")

		return `${day}.${month}.${year} ${hours}:${minutes}`
	}
}
