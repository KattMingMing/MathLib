// ### [Complex.prototype.sqrt()](http://mathlib.de/en/docs/Complex/sqrt)
// Takes the square root of a complex number
//
// *@return {Complex}*
sqrt() : Complex {
	return MathLib.Complex.polar(Math.sqrt(this.abs()), this.arg() / 2);
}