module('Matrix');
test('init', 2, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  equal(m.rows, 3, 'Testing the number of rows');
  equal(m.cols, 3, 'Testing the number of cols');
});



// Properties
test('.constructor', 1, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  equal(m.constructor, MathLib.matrix, 'Testing .constructor');
});


test('.type', 1, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  equal(m.type, 'matrix', 'Testing .type');
});



// Methods
test('.adjugate()', 1, function () {
  var c = MathLib.complex,
      m = MathLib.matrix([[-3, 2, -5], [-1, 0, -3], [3, -4, 1]]),
      res = MathLib.matrix([[-12, 18, -6], [-8, 12, -4], [4, -6, 2]]);

  deepEqual(m.adjugate(), res, 'Adjoint matrix of a complex 2x3 matrix');
});


test('.adjoint()', 1, function () {
  var c = MathLib.complex,
      m = MathLib.matrix([[c([3, 1]), 5, c([0, -2])], [c([2, -2]), c([0, 1]), c([-7, -13])]]),
      res = MathLib.matrix([[c([3, -1]), c([2, 2])], [5, c([0, -1])], [c([0, 2]), c([-7, 13])]]);

  deepEqual(m.adjoint(), res, 'Adjoint matrix of a complex 2x3 matrix');
});


test('.cholesky()', 1, function () {
  var m = MathLib.matrix([[25, 15, -5], [15, 18, 0], [-5, 0, 11]]),
      res = MathLib.matrix([[5, 0, 0], [3, 3, 0], [-1, 1, 3]]);

  deepEqual(m.cholesky(), res, 'Cholesky decomposition of a 3x3 matrix');
});


test('.determinant()', 3, function () {
  var m = MathLib.matrix([[0, 1, 2], [3, 2, 1], [1, 1, 0]]),
      n = MathLib.matrix([[42]]),
      p = MathLib.matrix([[0, 1, 2], [3, 2, 1]]);

  equal(m.determinant(), 3, 'Determinant of a 3x3 matrix');
  equal(n.determinant(), 42, 'Determinant of 1x1 matrix');
  equal(p.determinant(), undefined, 'Determinant of 2x3 matrix should be undefined');
});


test('.gershgorin()', 2, function () {
  var c = MathLib.complex,
      m = MathLib.matrix([[1,2,3], [4,5,6], [7,8,9]]),
      n = MathLib.matrix([[c([1,4]),2,3], [c([2,3]),c([4,2]),6], [7,c([0,5]),9]]),
      resm = [MathLib.circle([1,0,1], 5), MathLib.circle([5,0,1], 10), MathLib.circle([9,0,1], 9)],
      resn = [MathLib.circle([1,4,1], 5), MathLib.circle([4,2,1], 10), MathLib.circle([9,0,1], 9)];

  deepEqual(m.gershgorin(), resm, 'Gershgorin circles of a 3x3 matrix');
  deepEqual(m.gershgorin(), resn, 'Gershgorin circles of a complex 3x3 matrix');
});


test('.givens()', 9, function () {
  var m = MathLib.matrix([[3, 5], [0, 2], [0, 0], [4, 5]]),
      n = MathLib.matrix([[6, 5, 0], [5, 1, 4], [0, 4, 3]]),
      o = MathLib.matrix([[0, 1, 6], [3, 5, 7], [4, 9, 2]]),
      QRm = m.givens(),
      Qm = QRm[0],
      Rm = QRm[1],
      Q1 = MathLib.matrix([[3/5, 4/(5*Math.sqrt(5)), 0, -8/(5*Math.sqrt(5))], [0, 2/Math.sqrt(5), 0, 1/Math.sqrt(5)], [0, 0, 1, 0], [4/5, -3/(5*Math.sqrt(5)), 0, 6/(5*Math.sqrt(5))]]),
      R1 = MathLib.matrix([[5, 7], [0, 2.23606797749979], [0, 0], [0, 0]]),

      QRn = n.givens(),
      Qn = QRn[0],
      Rn = QRn[1],
      Q2 = MathLib.matrix([[0.768221279597376, -0.332654179360071, -0.546970988744419], [0.640184399664480 , 0.399185015232086 , 0.656365186493303], [0, -0.854395997514289, 0.519622439307198]]),
      R2 = MathLib.matrix([[7.810249675906652, 4.481290797651358, 2.560737598657919], [0, -4.681669871625427, -0.966447931614524], [0, 0, 4.184328063894809]]),

      QRo = o.givens(),
      Qo = QRo[0],
      Ro = QRo[1],
      Q3 = MathLib.matrix([[0, -0.581238193719096, -0.813733471206735], [0.6, 0.650986776965388, -0.464990554975277], [0.8, -0.488240082724041, 0.348742916231458]]),
      R3 = MathLib.matrix([[5, 10.2, 5.8], [0, -1.720465053408526, 0.09299811099505462], [0, 0, -7.439848879604435]]);
  
  ok(Qm.isEqual(Q1), 'Q is original matrix');
  ok(Rm.isEqual(R1), 'R is original matrix');
  ok(Qm.times(Rm).isEqual(m), 'Q*R is original matrix');
  ok(Qn.isEqual(Q2), 'Q is original matrix');
  ok(Rn.isEqual(R2), 'R is original matrix');
  ok(Qn.times(Rn).isEqual(n), 'Q*R is original matrix');
  ok(Qo.isEqual(Q3), 'Q is original matrix');
  ok(Ro.isEqual(R3), 'R is original matrix');
  ok(Qo.times(Ro).isEqual(o), 'Q*R is original matrix');
});


test('.isBandMatrix()', 2, function () {
  var m = MathLib.matrix([[2,1,3,0],[1,2,1,3],[0,1,2,1],[0,0,1,2]]);

  equal(m.isBandMatrix(1,2), true, 'band matrix');
  equal(m.isBandMatrix(1,1), false, 'upper bandwidth to small');
});

test('.isDiag()', 2, function () {
  var c = MathLib.complex(0, 0),
      m = MathLib.matrix([[1, 0, 0], [0, 5, 0], [0, 0, 9]]),
      n = MathLib.matrix([[1, 4, 7], [2, 5, 8], [2, 5, 8]]);
  equal(m.isDiag(), true, 'square matrix');
  equal(n.isDiag(), false, 'non square matrix');
});


test('.isIdentity()', 2, function () {
  var m = MathLib.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]),
      n = MathLib.matrix([[1, 4, 7], [2, 5, 8], [2, 5, 8]]);
  equal(m.isIdentity(), true, '.isIdentity() on identity matrix');
  equal(n.isIdentity(), false, '.isIdentity() on non identity matrix');
});


test('.isInvertible()', 2, function () {
  var m = MathLib.matrix([[1, 4, 7], [2, 5, 8], [2, 5, 2]]),
      n = MathLib.matrix([[1, 4, 7], [2, 5, 8], [3, 9, 15]]);
  equal(m.isInvertible(), true, '.isInvertible(), invertible matrix');
  equal(n.isInvertible(), false, '.isInvertible(), singular matrix');
});


test('.isLower()', 4, function () {
  var m = MathLib.matrix([[1, 0, 0], [4, 5, 0], [3, 0, 9]]),
      n = MathLib.matrix([[1, 4, 7], [2, 5, 8], [3, 5, 6]]),
      o = MathLib.matrix([[1, 0, 0], [4, 5, 0]]),
      p = MathLib.matrix([[1, 0, 0], [4, 5, 0], [4, 0, 6], [4, 3, 2]]);
  equal(m.isLower(), true, 'upper matrix');
  equal(n.isLower(), false, 'non upper matrix');
  equal(o.isLower(), true, 'upper matrix');
  equal(p.isLower(), true, 'upper matrix');
});


test('.isOrthogonal()', 2, function () {
  var m = MathLib.matrix([[0.8, -0.6], [0.6, 0.8]]),
      n = MathLib.matrix([[1, 4, 7], [2, 5, 8], [2, 5, 8]]);
  equal(m.isOrthogonal(), true, '.isOrthogonal() on orthogal matrix');
  equal(n.isOrthogonal(), false, '.isOrthogonal() on non orthogonal matrix');
});


test('.isPermutation()', 3, function () {
  var m = MathLib.matrix([[0, 1, 0], [1, 0, 0], [0, 0, 1]]),
      n = MathLib.matrix([[1, 4, 7], [2, 5, 8], [2, 3, 4]]),
      o = MathLib.matrix([[0, 1, 0], [1, 0, 0], [0, 0, 0]]);
  equal(m.isPermutation(), true, 'permutation matrix');
  equal(n.isPermutation(), false, 'non permutation matrix');
  equal(o.isPermutation(), false, 'zero line');
});


test('.isPosDefinite()', 2, function () {
  var m = MathLib.matrix([[2, -1, 0], [-1, 2, -1], [0, -1, 2]]),
      n = MathLib.matrix([[1, 2], [2, 1]]);
  equal(m.isPosDefinite(), true, 'positiv definite matrix');
  equal(n.isPosDefinite(), false, 'non positiv definite matrix');
});


test('.isSquare()', 2, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
      n = MathLib.matrix([[1, 4, 7], [2, 5, 8]]);
  equal(m.isSquare(), true, 'square matrix');
  equal(n.isSquare(), false, 'non square matrix');
});


test('.isSymmetric()', 2, function () {
  var c = MathLib.complex(4, 0),
      m = MathLib.matrix([[1, 7, c], [7, 0, 3], [4, 3, 1]]),
      n = MathLib.matrix([[0, 0, 0], [0, 1, c], [0, 0, 0]]);
  equal(m.isSymmetric(), true, 'symmetric matrix');
  equal(n.isSymmetric(), false, 'non symmetric matrix');
});


test('.isUpper()', 4, function () {
  var m = MathLib.matrix([[1, 2, 3], [0, 5, 6], [0, 0, 9]]),
      n = MathLib.matrix([[1, 4, 7], [2, 5, 8], [3, 5, 6]]),
      o = MathLib.matrix([[1, 4, 7], [0, 5, 8]]),
      p = MathLib.matrix([[1, 4, 7], [0, 5, 8], [0, 0, 6], [0, 0, 0]]);
  equal(m.isUpper(), true, 'upper matrix');
  equal(n.isUpper(), false, 'non upper matrix');
  equal(o.isUpper(), true, 'upper matrix');
  equal(p.isUpper(), true, 'upper matrix');
});


test('.isVector()', 2, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
      n = MathLib.matrix([[1, 2, 3]]);
  equal(m.isVector(), false, 'normal matrix');
  equal(n.isVector(), true, 'one row matrix');
});


test('.isZero()', 2, function () {
  var c = MathLib.complex(0, 0),
      m = MathLib.matrix([[0, 0, 0], [0, 0, c], [0, 0, 0]]),
      n = MathLib.matrix([[0, 0, 0], [0, 1, c], [0, 0, 0]]);
  equal(m.isZero(), true, 'zero matrix');
  equal(n.isZero(), false, 'non zero matrix');
});


test('.LU()', 2, function () {
  var m = MathLib.matrix([[1, 2, 3], [1, 1, 1], [3, 3, 1]]),
      n = MathLib.matrix([[1, 3, 5], [2, 4, 7], [1, 1, 0]]),
      res1 = MathLib.matrix([[1, 2, 3], [1, -1, -2], [3, 3, -2]]),
      res2 = MathLib.matrix([[2, 4, 7], [0.5, 1, 1.5], [0.5, -1, -2]]);

  deepEqual(m.LU(true), res1, 'LU decomposition');
  deepEqual(n.LU(), res2, 'LU decomposition');
});


test(".map()", 2, function () {
  var p = MathLib.matrix([[1, 2],[3, 4]]),
      q = MathLib.matrix([[2, 4], [6, 8]]),
      f = function (x) {
        return 2 * x;
      },
      res = p.map(f);

  deepEqual(res, q, ".map()");
  equal(res.type, 'matrix', ".type should be matrix");
});


test('.minus()', 2, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
      n = MathLib.matrix([[1, 4, 7], [2, 5, 8], [3, 6, 9]]),
      res = MathLib.matrix([[0, -2, -4], [2, 0, -2], [4, 2, 0]]),
      res1 = MathLib.matrix([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
  deepEqual(m.minus(n), res, 'subtracting two simple matrices');
  deepEqual(n.minus(n), res1, 'subtracting two simple matrices');
});


test('.negative()', 1, function () {
  var m = MathLib.matrix([[1, 4, 7], [2, 5, 8], [3, 6, 9]]),
      res = MathLib.matrix([[-1, -4, -7], [-2, -5, -8], [-3, -6, -9]]);
  deepEqual(m.negative(), res, 'negative of a simple matrix');
});


test('.plus()', 1, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
      n = MathLib.matrix([[1, 4, 7], [2, 5, 8], [3, 6, 9]]),
      res = MathLib.matrix([[2, 6, 10], [6, 10, 14], [10, 14, 18]]);
  deepEqual(m.plus(n), res, 'adding two simple matrices');
});


test('.rank()', 2, function () {
  var m = MathLib.matrix([[1, 2, 3], [0, 5, 4], [0, 10, 2]]),
      n = MathLib.matrix([[1, 2, 3], [0, 6, 4], [0, 3, 2]]);
  equal(m.rank(), 3, '.rank()');
  equal(n.rank(), 2, '.rank()');
});


test('.remove()', 3, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
      res1 = MathLib.matrix([[1, 2, 3], [7, 8, 9]]),
      res2 = MathLib.matrix([[1, 3], [4, 6], [7, 9]]),
      res3 = MathLib.matrix([[4], [7]]);

  deepEqual(m.remove(1), res1, 'removing the second row');
  deepEqual(m.remove(false, 1), res2, 'removing the second column');
  deepEqual(m.remove([0], [1, 2]), res3, 'removing the first row and the second and third col');
});


test('.rref()', 2, function () {
  var m = MathLib.matrix([[1, 2, -1, -4], [2, 3, -1, -11], [-2, 0, -3, 22]]),
      n = MathLib.matrix([[1, 2, 3], [1, 2, 4], [2, 4, 7]]);

  deepEqual(m.rref(), [[1, 0, 0, -8], [0, 1, 0, 1], [0, 0, 1, -2]], 'reduced row echelon form');
  deepEqual(n.rref(), [[1, 2, 0], [0, 0, 1], [0, 0, 0]], 'singular matrix');
});


test('.solve()', 4, function () {
  var A1 = MathLib.matrix([[1, 2, 3], [1, 1, 1], [3, 3, 1]]),
      b1 = MathLib.vector([2, 2, 0]),
      x1 = MathLib.vector([5, -6, 3]),
      A2 = MathLib.matrix([[1, 0, 3], [2, 1, 0], [0, 0, 1]]),
      b2 = MathLib.vector([10, 3, 3]),
      x2 = MathLib.vector([1, 1, 3]),
      c  = MathLib.complex,
      A3 = MathLib.matrix([[c([2, 3]), 0, 3], [2, c([-1, 5]), 0], [c([3, -4]), c([0, 1]), 1]]),
      b3 = MathLib.vector([c([5, 37]), c([5, 19]), c([21, 0])]),
      x3 = MathLib.vector([c([4, 2]), c([3, 0]), c([1, 7])]);

  ok(A1.solve(b1).isEqual(x1), 'Solving a system of linear equations');
  deepEqual(A1.times(x1), b1, 'Showing the solution is right');

  deepEqual(A2.solve(b2), x2, 'Solving a system of linear equations');

  ok(A3.solve(b3).isEqual(x3), 'Solving a complex system of linear equations');
});


test('.times()', 4, function () {
  var m = MathLib.matrix([[1, 2], [3, 4]]),
      n = MathLib.matrix([[0, 1], [0, 0]]),
      res = MathLib.matrix([[0, 1], [0, 3]]),

      c  = MathLib.complex,
      mc = MathLib.matrix([[c([2, 3]), 0, 3], [2, c([-1, 5]), 0], [c([3, -4]), c([0, 1]), 1]]),
      bc = MathLib.vector([c([4, 2]), 3, c([1, 7])]),
      resc = MathLib.vector([c([5, 37]), c([5, 19]), c([21, 0])]);

  deepEqual(m.times(3), MathLib.matrix([[3, 6], [9, 12]]), 'matrix scalar multiplication');
  deepEqual(m.times(c([0, 1])), MathLib.matrix([[c([0, 1]), c([0, 2])], [c([0, 3]), c([0, 4])]]), 'matrix scalar multiplication');
  deepEqual(m.times(n), res, 'multiplying two simple matrices');
  deepEqual(mc.times(bc), resc, 'complex matrix times complex vector');
});


test('.trace()', 2, function () {
  var c = MathLib.complex([3, 4]),
      m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
      n = MathLib.matrix([[1, 2], [3, c]]);
  equal(m.trace(), 15, 'trace of a simple matrix');
  deepEqual(n.trace().z, [4, 4], 'trace of a complex matrix');
});


test('.transpose()', 2, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
      n = MathLib.matrix([[1, 2, 3], [4, 5, 6]]);

  deepEqual(m.transpose(), MathLib.matrix([[1, 4, 7], [2, 5, 8], [3, 6, 9]]), 'transpose a square matrix');
  deepEqual(n.transpose(), MathLib.matrix([[1, 4], [2, 5], [3, 6]]), 'transpose of a rectangular matrix');
});


test('.toArray()', 4, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]),
      a = m.toArray();

  deepEqual(a, [[1, 2, 3], [4, 5, 6], [7, 8, 9]], '.toArray()');
  equal(Object.prototype.toString.call(a), '[object Array]', '.toArray()');
  equal(a.type, undefined, 'get sure that it is not a Mathlib object');
  a[0][0] = 42;
  deepEqual(m, MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 'make sure the matrix hasn\'t changed');
});


test('.toColVectors()', 1, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  deepEqual(m.toColVectors(), [MathLib.vector([1, 4, 7]), MathLib.vector([2, 5, 8]), MathLib.vector([3, 6, 9])], '.toColVectors()');
});


test('.toComplex()', 1, function () {
  var m = MathLib.matrix([[1, -2], [2, 1]]);
  deepEqual(m.toComplex().z, [1, 2], 'convert a 2x2 matrix to a complex number');
});


test('.toContentMathML()', 1, function () {
  var m = MathLib.matrix([[1, 2], [3, 4]]);
  deepEqual(m.toContentMathML(), '<matrix><matrixrow><cn>1</cn><cn>2</cn></matrixrow><matrixrow><cn>3</cn><cn>4</cn></matrixrow></matrix>', '.toContentMathML()');
});


test('.toLaTeX()', 1, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  deepEqual(m.toLaTeX(), '\\begin{pmatrix}\n1 & 2 & 3\\\n4 & 5 & 6\\\n7 & 8 & 9\n\\end{pmatrix}', '.toLaTeX()');
});


test('.toMathML()', 1, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  deepEqual(m.toMathML(), '<mrow><mo> ( </mo><mtable><mtr><mtd><mn>1</mn></mtd><mtd><mn>2</mn></mtd><mtd><mn>3</mn></mtd></mtr><mtr><mtd><mn>4</mn></mtd><mtd><mn>5</mn></mtd><mtd><mn>6</mn></mtd></mtr><mtr><mtd><mn>7</mn></mtd><mtd><mn>8</mn></mtd><mtd><mn>9</mn></mtd></mtr></mtable><mo> ) </mo></mrow>', '.toMathML()');
});


test('.toRowVectors()', 1, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  deepEqual(m.toRowVectors(), [MathLib.vector([1, 2, 3]), MathLib.vector([4, 5, 6]), MathLib.vector([7, 8, 9])], '.toRowVectors()');
});


test('.toString()', 1, function () {
  var m = MathLib.matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  deepEqual(m.toString(), '1\t2\t3\n4\t5\t6\n7\t8\t9', '.toString()');
});



// Static methods
test('identity()', 1, function () {
  equal(MathLib.matrix.identity(4).isIdentity(), true, 'creating a identity matrix');
});


test('numbers()', 3, function () {
  var m = MathLib.matrix.numbers(3, 2, 2),
      n = MathLib.matrix.numbers(4, 2),
      o = MathLib.matrix.numbers(5);
  deepEqual(m, [[3, 3], [3, 3]], 'static number method');
  deepEqual(n, [[4, 4], [4, 4]], 'static number method');
  deepEqual(o, [[5]], 'static number method');
});
