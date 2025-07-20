function getSyntaxe(str) {
	// Handle undefined or null input
	if (str === undefined || str === null) {
		return "";
	}
	
	// Convert to string if not already a string
	if (typeof str !== 'string') {
		str = String(str);
	}
	
	var tmp = "";
	for (var i = 0; i < str.length; i++) {
		if (str[i] == '\'')
			tmp += '\'';
		tmp += str[i];
	}
	return tmp;
}

module.exports = getSyntaxe