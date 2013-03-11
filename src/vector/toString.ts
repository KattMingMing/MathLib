// ### [Vector.prototype.toString()](http://mathlib.de/en/docs/vector/toString)
// Returns a string representation of the vector.
//
// *@returns {string}*
toString() : string {
	return '(' + this.reduce(function (old, cur) {
		return old + ', ' + MathLib.toString(cur);
	}) + ')';
}