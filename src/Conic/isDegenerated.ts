// ### [Conic.prototype.isDegenerated()](http://mathlib.de/en/docs/Conic/isDegenerated)
// Determines if a conic is degenerated.
//
// *@return {boolean}*
isDegenerated() : boolean {
	return this.primal.rank() !== 3;
}