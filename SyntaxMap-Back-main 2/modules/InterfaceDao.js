var ErrorObject = require('./error/ErrorObject.js')

class InterfaceDao {

	constructor () {
		
	}

	addCriteriaToQtext = function (qtext, key, value, name) {
		if (!value || !key) {
			return;
		}
		if (qtext.qtext.indexOf('WHERE') === -1)
			qtext.qtext += ' WHERE (';
		else
			qtext.qtext = qtext.qtext + ' AND ('
		let tab = value.split(',');
		tab.forEach((element, index) => {
			if (index > 0)
				qtext.qtext = qtext.qtext + ' OR'
			let qtextCpy = qtext.qtext.slice();
			let nb$ = (qtextCpy.match(/\$/g) || []).length;
			if (!name) {
				qtext.qtext = qtext.qtext + ' ' + key + ' = $' + (nb$ + 1).toString();
			} else {
				qtext.qtext = qtext.qtext + ' ' + name + ' = $' + (nb$ + 1).toString();
			}
			qtext.values.push(element);
		});
		qtext.qtext = qtext.qtext + ' )'
	}

	actq = function (qtext, key, value, name, t) {
		console.log('actq')
		console.log(t);
		if (!value || !key) {
			return qtext;
		}
		if (qtext.indexOf('WHERE') === -1)
			qtext += ' WHERE (';
		else
			qtext = qtext + ' AND ('
		let tab = value.split(',');
		tab.forEach((element, index) => {
			let el = ""
			if (t && t === "n") {
				el = Number(element)
				console.log("number")
			} else if (t && t === "b") { 
				el = (element === "true") ? true : false;
			} else {
				el = element;
			}
			if (index > 0)
				qtext = qtext + ' OR'
			if (!name) {
				qtext = qtext + ((t && t === "h") ? ` ${this.dv(el)} = any(avals(${key}))` : ` ${key} = ${this.dv(el)}` );
			} else {
				qtext = qtext + ((t && t === "h") ? ` ${this.dv(el)} = any(avals(${name}))` : ` ${name} = ${this.dv(el)}` );
			}
		});
		qtext = qtext + ' )'
		return qtext;
	}

	aotq(qtext, t_order, key) {
		qtext = qtext + ' order by '
		if (t_order === 'random')
			qtext = qtext + 'random()';
		else
			qtext = qtext + key + ' ' + t_order;
		return qtext;
	}

	altq(qtext, limit){
		qtext = qtext + ' limit ' + limit;
		return qtext;
	}

	actqfa(qtext, key, value, index){
		
		if (qtext.indexOf('WHERE') === -1)
			qtext += ' WHERE ';
		else
			qtext = qtext + ' AND '
		if (index < 0)
			qtext = qtext + key + ' @> ' + value;
		else
			qtext = qtext + key + '[' + index + '] = ' + value;
		console.log("actqfa = " + qtext);
		return qtext;
	}

	dv(value) {
		console.log(typeof value, " ", value)
		if (value === "DEFAULT")
			return value;
		else if (typeof value === "string") {
			return `'${value}'`;
		} else if (typeof value === "number") {
			return value;
		} else if (typeof value === "boolean") {
			return value;
		} else if (value === null) {
			return value;
		} else if (typeof value === "object") {
			return `'{${value}}'`;
		}
		return undefined;
	}

	ObjectToHstore(obj) {
		if (!obj || typeof obj != "object") {
			return (typeof obj === "string") ? undefined : obj;
		}
		let res = '';
		for (const [key, value] of Object.entries(obj)) {
			if (res.length != 0) {
				res = res + ', '
			}
			res = res + `"${key}" => "${value}"`
		}
		return res
	}

	HstoreToObject(hstore) {
		if (!hstore || typeof hstore!= "string") {
			return hstore;
		}
		let res = {};
		let array = hstore.split(', ')
		array.forEach(item => {
			let sep = item.split('=>');
			console.log(sep);
			res[sep[0].substring(1,sep[0].length-1)] = sep[1].substring(1,sep[1].length-1)
		})
		return res;
	}

	ErrorHandling(err, callback) {
		console.log("error received : ", err);
		console.log("error received : ", err.column);
		let error = null
		switch (err.code) {
			case '_1':
				error = new ErrorObject(404, `Not found : No item with ${err.id} as Id found.`)
				callback(error);
				break;
			case '_2':
					error = new ErrorObject(400, `Bad request : ${err.message}.`)
					callback(error);
					break;
			case '_3':
					error = new ErrorObject(404, `Not found : No item with ${err.email} as email found.`)
					callback(error);
					break;
			case '23502':
				error = new ErrorObject(400, `Error body request : The field ${err.column} can't be null.`)
				callback(error);
				break;
			case '42703':
				error = new ErrorObject(400, `Error body request : One field in the request body is missing.`)
				callback(error);
				break;
			case '22001':
				error = new ErrorObject(400, `Error body request : One string type field, in the request body, outruns the authorized number of characters.`)
				callback(error);
				break;
			case '23505':
				error = new ErrorObject(400, `Bad request : Unique key violation.`)
				callback(error);
				break;
			case '23503':
				error = new ErrorObject(400, `Bad request : Foreign key violation.`)
				callback(error);
				break;
			case '22007':
				error = new ErrorObject(400, `Bad request : Invalid date format.`)
				callback(error);
				break;
			case '22008':
				error = new ErrorObject(400, `Bad request : Invalid date format.`)
				callback(error);
				break;
			case '22003':
				error = new ErrorObject(400, `Bad request : A numeric value is out of range.`)
				callback(error);
				break;
			case '22P01':
				error = new ErrorObject(400, `Bad request : Floating point exception.`)
				callback(error);
				break;
			default:
				callback(new ErrorObject(500, `Server error : intern server error.`));
		}


		//callback(null);
	}

}

module.exports = InterfaceDao;
