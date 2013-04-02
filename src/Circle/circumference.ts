// ### [Circle.prototype.circumference()](http://mathlib.de/en/docs/Circle/circumference)
// Calculates the circumference of the circle.
//
// *@param {number}* The circumference of the circle
circumference() : number {
	return 2 * this.radius * Math.PI;
}