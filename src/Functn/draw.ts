// ### [Functn.prototype.draw()](http://mathlib.de/en/docs/Functn/draw)
// Draws the function on the screen
//
// *@param {screen}* The screen to draw the function onto.  
// *@param {object}* [options] Optional drawing options.  
// *@returns {functn}*
functnPrototype.draw = function(screen, options:any = {}) : number {
	var functn = this;
	if (Array.isArray(screen)) {
		screen.forEach(function (x) {
			x.path(functn, options);
		});
	}
	else {
		screen.path(functn, options);
	}

	return this;
};