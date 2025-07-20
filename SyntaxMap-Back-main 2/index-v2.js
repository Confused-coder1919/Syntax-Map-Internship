const fs = require('fs');

module.exports = (app) => {
    fs.readdirSync(`./routes-v2/`).forEach((file) => {
		require(`./routes-v2/${file}`)(app);
	});
}
