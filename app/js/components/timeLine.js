import uuid4 from "uuid4"

export default class TimeLine {
	constructor(parrentElement) {
		this.parrentElement = document.querySelector(parrentElement)
		this.posts = JSON.parse(localStorage.getItem("time-line-list")) || []

		this.callSendEventForForm = this.callSendEventForForm.bind(this)

		this.latitude = "не указано"
		this.longitude = "не указано"
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
		this.audio = this.mainForm.querySelector(".time-line__audio input")
		this.video = this.mainForm.querySelector(".time-line__video input")

		this.parrentElement.appendChild(this.timeLine)

		this.addEvent()

		this.renderPosts("all")
	}

	getGeolocation() {
		function resolveGeo(data) {
			this.latitude = data.coords.latitude

			this.longitude = data.coords.longitude
		}

		function rejectGeo() {
			if (this.latitude === "не указано" && this.longitude === "не указано") {
				this.createErrorPopup()
			}
		}

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(resolveGeo.bind(this), rejectGeo.bind(this))
		}
	}

	createErrorPopup() {
		this.popup = document.createElement("div")
		this.popup.classList.add("popup-error")

		this.popup.innerHTML = `
			<div class="popup-error__content">
				<h2 class="popup-error__title">Что-то пошло не так</h2>
				<p class="popup-error__text">К сожалению, нам не удалось определить ваше местоположение, пожалуйста, дайте разрешение на использование геолокации, либо введите кооординаты в ручную.</p>
				<h3 class="popup-error__subtitle">Широта и долгота через запятую</h3>
				<input class="popup-error__input" type="text" placeholder="51.50851, −0.12572" />
				<div class="popup-error__buttons">
					<button class="popup-error__buttons-close">Отмена</button>
					<button class="popup-error__buttons-ok">Ok</button>
				</div>
			</div>
		`

		document.querySelector("body").appendChild(this.popup)

		const input = this.popup.querySelector(".popup-error__input")

		input.addEventListener("input", () => {
			input.style.board = "1px solid #0000000"
		})

		this.popup.addEventListener("click", e => {
			if (e.target.closest(".popup-error__buttons-close")) {
				this.popup.remove()
				this.popup = null
			}

			if (e.target.closest(".popup-error__buttons-ok")) {
				if (this.validateGeolocation(input.value)) {
					this.popup.remove()
					this.popup = null

					this.createPost()
					this.sendTextArea.value = ""

					return
				}

				input.style.border = "2px solid #ff0000"

				throw new Error("Координаты неверного формата")
			}
		})
	}

	validateGeolocation(text) {
		let coords = text.replace(/\s/g, "")

		if (/^-?\d{1,3}\.\d+,-?\d{1,3}\.\d+$/.test(coords)) {
			coords = coords.split(",")
			this.latitude = +coords[0]
			this.longitude = +coords[1]

			return true
		}

		this.latitude = "не указано"
		this.longitude = "не указано"

		return false
	}

	createPost(type) {
		const id = uuid4()

		const wrapper = document.createElement("div")

		const date = this.dateFormat()

		const item = document.createElement("li")

		item.dataset.id = id

		item.innerHTML = `
            <span class="time-line__item-date">${date}</span>
            <p class="time-line__item-text">${this.sendTextArea.value}</p>
            <span class="time-line__item-coord">[${this.latitude}, ${this.longitude}]</span>
        `

		item.classList.add("time-line__item")

		wrapper.appendChild(item)

		this.posts.push({
			id,
			type,
			element: wrapper.innerHTML
		})

		localStorage.setItem("time-line-list", JSON.stringify(this.posts))

		this.renderPosts()
	}

	renderPosts(all = null) {
		if (!all) {
			this.timeLineList.insertAdjacentHTML("afterbegin", this.posts[this.posts.length - 1].element)
			return
		}

		if (this.posts.length !== 0) {
			this.posts.forEach(post => this.timeLineList.insertAdjacentHTML("afterbegin", post.element))
		}
	}

	addEvent() {
		this.mainForm.addEventListener("submit", e => {
			e.preventDefault()

			if (this.latitude === "не указано" && this.longitude === "не указано") {
				this.getGeolocation()
			} else {
				this.createPost()
				this.sendTextArea.value = ""
			}
		})

		this.sendTextArea.addEventListener("keydown", this.callSendEventForForm)

		this.sendTextArea.addEventListener("keyup", e => {
			if (e.key === "Shift") {
				this.sendTextArea.addEventListener("keydown", this.callSendEventForForm)
			}
		})

		document.querySelector(".time-line__audio").addEventListener("click", () => {
			if (!this.popup) {
				this.audio.click()
			}
		})

		document.querySelector(".time-line__video").addEventListener("click", () => {
			if (!this.popup) {
				this.video.click()
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
