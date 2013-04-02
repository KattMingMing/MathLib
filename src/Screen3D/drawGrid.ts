// ### Screen3D.prototype.drawGrid
// Draws the grid.
//
// *@returns {Screen3D}*
drawGrid() {
	if (!this.grid) {
		return this;
	}

	var _this = this,
			gridDrawer = function (opts, rotX, rotY) {
				var size = 10,
						grid = new THREE.Object3D(),
						color = new THREE.Color(opts.color),
						i;

				if (opts.type === 'cartesian') {
					var tickX = 'x' in opts.tick ? opts.tick.x : opts.tick.y,
							tickY = 'z' in opts.tick ? opts.tick.z : opts.tick.y,
							lines = new THREE.Shape();

					for (i = -size; i <= size; i += tickX) {
						lines.moveTo(-size, i);
						lines.lineTo(size, i);
					}		

					for (i = -size; i <= size; i += tickY) {
						lines.moveTo(i, -size);
						lines.lineTo(i, size);
					}

					grid.add(new THREE.Line(lines.createPointsGeometry(), new THREE.LineBasicMaterial({color: color}), THREE.LinePieces));

					grid.rotation.x = rotX;
					grid.rotation.y = rotY;

					_this.scene.add(grid);
				}

				else if(opts.type === 'polar') {

					var circles = new THREE.Shape(),
							rays = new THREE.Shape(),
							line;


					for (i = 0; i <= size; i += opts.tick.r) {
						circles.moveTo(i, 0)
						circles.absarc(0, 0, i, 0, 2*Math.PI + 0.001, false);
					}
					grid.add(new THREE.Line(circles.createPointsGeometry(),
											new THREE.LineBasicMaterial({color: color})));

					for (i = 0; i <= 2*Math.PI; i += opts.angle) {
						rays.moveTo(0, 0);
						rays.lineTo(size*Math.cos(i), size*Math.sin(i));
					}

					grid.add(new THREE.Line(rays.createPointsGeometry(), new THREE.LineBasicMaterial({color: color})));

					grid.rotation.x = rotX;
					grid.rotation.y = rotY;

					_this.scene.add(grid);

				}
			};


	gridDrawer(this.grid.xy, 0, 0);
	gridDrawer(this.grid.xz, Math.PI/2, 0);
	gridDrawer(this.grid.yz, 0, Math.PI/2);

	return this;
}