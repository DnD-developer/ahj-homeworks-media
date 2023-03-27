import validateGeolocation from "../services/service"

test.each([
	["51.50851, -0.12572", true],
	["51.50851, -0.12572 ", true],
	["[51.50851, -0.12572]", true]
])("test %s format coord", (coord, expected) => {
	console.log(coord)
	const result = validateGeolocation(coord)

	expect(result).toEqual([51.50851, -0.12572])
})
