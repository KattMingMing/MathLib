// ### Point.prototype.isInside()
// Determines wether a point is inside a circle
//
// *@param {circle}*
// *@returns {boolean}*
isInside(a : Circle) : bool {
	if (a.type === 'circle') {
		return this.distanceTo(a.center) < a.radius;
	}
}