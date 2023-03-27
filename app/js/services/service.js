export default function validateGeolocation(text) {
	let coords = text.replace(/[\s[\]]/g, "")

	if (/^-?\d{1,3}\.\d+,-?\d{1,3}\.\d+$/.test(coords)) {
		coords = coords.split(",")

		return [+coords[0], +coords[1]]
	}

	return [false, false]
}
