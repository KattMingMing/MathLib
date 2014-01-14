/**
 * Adds a number to the current integer
 *
 * @return {Integer}
 */
plus(n) : Integer {
	var i, ii, temp,
			data = [],
			carry = 0,
			base = 1e7;
			
	if (n.type !== 'integer') {
		return MathLib.plus(MathLib.coerce(this, n));
	}
	else {
		if (this.sign === '-') {
			if (n.sign === '+') {
				this.sign = '+';
				return n.minus(this);
			}
		}
		else if (n.sign === '-') {
			n.sign = '+';
			return this.minus(n);
		}


		if (this.data.length !== n.data.length) {
			while (this.data.length < n.data.length) {
				this.data.push(0);
			}
			while (this.data.length > n.data.length) {
				n.data.push(0);
			}
		}


		for (i = 0, ii = this.data.length; i < ii; i++) {
			temp = this.data[i] + n.data[i] + carry;
		
			data[i] = temp % base;
			carry = Math.floor(temp / base);
		}
		
		if (carry !== 0) {
			data[i] = carry;
		}

		
		return new MathLib.Integer(data, {sign: this.sign});
	}
}