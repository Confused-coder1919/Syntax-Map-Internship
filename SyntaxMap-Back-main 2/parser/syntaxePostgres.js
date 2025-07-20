function getSyntaxe(str) {
	var tmp = "";
	for (var i = 0; i < str.length; i++) {
		if (str[i] == '\'')
			tmp += '\'';
		tmp += str[i];
	}
	return tmp;
}

module.exports = getSyntaxe