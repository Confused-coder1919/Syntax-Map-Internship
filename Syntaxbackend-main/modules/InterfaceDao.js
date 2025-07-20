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
		console.log('actq');
		
		// Return early if key or value is missing
		if (!value || !key) {
			console.log('Warning: Missing key or value in actq');
			return qtext;
		}
		
		try {
			if (qtext.indexOf('WHERE') === -1)
				qtext += ' WHERE (';
			else
				qtext = qtext + ' AND (';
				
			// Convert value to string if it's not already, or handle as an array if multiple values
			let tab = [];
			if (typeof value === 'string') {
				tab = value.split(',');
			} else if (Array.isArray(value)) {
				tab = value.map(v => String(v));
			} else if (value !== null && value !== undefined) {
				// Handle boolean, number, or other non-string values
				tab = [String(value)];
			}
			
			if (!tab.length) {
				console.log('Warning: Empty value array in actq');
				qtext += ')';
				return qtext;
			}
			
			tab.forEach((element, index) => {
				let el = "";
				if (t && t === "n") {
					el = Number(element);
					console.log("number");
				} else if (t && t === "b") { 
					el = (element === "true") ? true : false;
				} else {
					el = element;
				}
				if (index > 0)
					qtext = qtext + ' OR';
				
				// Make sure key and name are defined to prevent 'column undefined' errors
				const safeKey = key || '';
				const safeName = name || '';
				
				if (!name) {
					qtext = qtext + ((t && t === "h") ? ` ${this.dv(el)} = any(avals(${safeKey}))` : ` ${safeKey} = ${this.dv(el)}` );
				} else {
					qtext = qtext + ((t && t === "h") ? ` ${this.dv(el)} = any(avals(${safeName}))` : ` ${safeName} = ${this.dv(el)}` );
				}
			});
			qtext = qtext + ' )';
			return qtext;
		} catch (error) {
			console.error('Error in actq method:', error);
			// Return the original query text to prevent completely breaking the query
			return qtext;
		}
	}

	aotq(qtext, t_order, key) {
		qtext = qtext + ' order by ';
		if (t_order === 'random')
			qtext = qtext + 'random()';
		else
			qtext = qtext + key + ' ' + t_order;
		return qtext;
	}

	altq(qtext, limit) {
		qtext = qtext + ' limit ' + limit;
		return qtext;
	}

	actqfa(qtext, key, value, index) {
		if (!qtext || !key || value === undefined) {
			console.log("Warning: Missing parameters in actqfa");
			return qtext || '';
		}
		
		if (qtext.indexOf('WHERE') === -1)
			qtext += ' WHERE ';
		else
			qtext = qtext + ' AND ';
		
		const safeKey = key || '';
		const safeValue = this.dv(value); // Use dv to properly format the value
		
		if (index < 0)
			qtext = qtext + safeKey + ' @> ' + safeValue;
		else
			qtext = qtext + safeKey + '[' + index + '] = ' + safeValue;
		
		console.log("actqfa = " + qtext);
		return qtext;
	}

	dv(value) {
		// Remove console.log to reduce noise in logs
		if (value === undefined) {
			return "NULL"; // Return NULL for undefined values
		} else if (value === "DEFAULT") {
			return value;
		} else if (typeof value === "string") {
			// Escape single quotes to prevent SQL injection
			return `'${value.replace(/'/g, "''")}'`;
		} else if (typeof value === "number") {
			return isNaN(value) ? "NULL" : value; // Handle NaN values
		} else if (typeof value === "boolean") {
			return value;
		} else if (value === null) {
			return "NULL";
		} else if (typeof value === "object") {
			if (Array.isArray(value)) {
				return `ARRAY[${value.map(item => this.dv(item)).join(',')}]`;
			}
			try {
				// Try to convert object to string safely
				return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
			} catch (e) {
				console.error("Error stringifying object in dv method:", e);
				return "NULL";
			}
		}
		return "NULL"; // Default to NULL for any other unhandled types
	}

	ObjectToHstore(obj) {
		if (!obj || typeof obj != "object") {
			return (typeof obj === "string") ? undefined : obj;
		}
		let res = '';
		for (const [key, value] of Object.entries(obj)) {
			if (res.length != 0) {
				res = res + ', ';
			}
			res = res + `"${key}" => "${value}"`;
		}
		return res;
	}

	HstoreToObject(hstore) {
		if (!hstore || typeof hstore != "string") {
			return hstore;
		}
		let res = {};
		let array = hstore.split(', ');
		array.forEach(item => {
			let sep = item.split('=>');
			console.log(sep);
			res[sep[0].substring(1,sep[0].length-1)] = sep[1].substring(1,sep[1].length-1);
		});
		return res;
	}

	ErrorHandling(err, callback) {
		console.log("error received : ", err);
		console.log("error received column: ", err.column);
		let error = null;
		
		// Create appropriate error object based on error code
		switch (err.code) {
			case '_1':
				error = new ErrorObject(404, `Not found : No item with ${err.id} as Id found.`);
				break;
			case '_2':
				error = new ErrorObject(400, `Bad request : ${err.message}.`);
				break;
			case '_3':
				error = new ErrorObject(404, `Not found : No item with ${err.email} as email found.`);
				break;
			case '_999':
				error = new ErrorObject(500, `Server error : ${err.message || 'Unknown processing error'}.`);
				break;
			case '23502':
				error = new ErrorObject(400, `Error body request : The field ${err.column} can't be null.`);
				break;
			case '42703':
				error = new ErrorObject(400, `Error body request : One field in the request body is missing.`);
				break;
			case '22001':
				error = new ErrorObject(400, `Error body request : One string type field, in the request body, outruns the authorized number of characters.`);
				break;
			case '23505':
				error = new ErrorObject(400, `Bad request : Unique key violation.`);
				break;
			case '23503':
				error = new ErrorObject(400, `Bad request : Foreign key violation.`);
				break;
			case '22007':
				error = new ErrorObject(400, `Bad request : Invalid date format.`);
				break;
			case '22008':
				error = new ErrorObject(400, `Bad request : Invalid date format.`);
				break;
			case '22003':
				error = new ErrorObject(400, `Bad request : A numeric value is out of range.`);
				break;
			case '22P01':
				error = new ErrorObject(400, `Bad request : Floating point exception.`);
				break;
			default:
				error = new ErrorObject(500, `Server error : intern server error.`);
		}

		// Ensure we're not sending undefined or null to the callback
		// This will ensure that the frontend receives a well-formed JSON response
		if (error) {
			callback(error);
		} else {
			// If for some reason we don't have an error object, send an empty response object
			// This ensures the frontend gets valid JSON to parse
			callback({ error: true, message: "Unknown error occurred" });
		}
	}

}

module.exports = InterfaceDao;
