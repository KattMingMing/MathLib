// ### [Rational.prototype.reduce()](http://mathlib.de/en/docs/Rational/reduce)
// Reduces the rational number
//
// *@return {Rational}*
reduce() : Rational {
	var gcd = MathLib.sign(this.denominator) * MathLib.gcd([this.numerator, this.denominator]);
	return new MathLib.Rational(this.numerator / gcd, this.denominator / gcd);
}