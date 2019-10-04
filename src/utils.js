/**
 * Returns a randome integer within a range.
 * @param {number} min - The minimum possible value.
 * @param {number} max - The maximum possible value.
 */ 
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Selects a random color from an array. Where is this used? Can this be deleted?
 * @param {array} colors - An array of possible colors.
 */ 
function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Compute the distance between two points on a plane.
 * @param {number} x1 - The x cordinate of the first point.
 * @param {number} y1 - The y cordinate of the first point.
 * @param {number} x2 - The x cordinate of the second point.
 * @param {number} y2 - The y cordinate of the second point.
 */ 
function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1
    const yDist = y2 - y1

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

module.exports = { randomIntFromRange, randomColor, distance }
