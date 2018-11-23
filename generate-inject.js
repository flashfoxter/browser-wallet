var fs = require('fs');
var content = JSON.stringify(fs.readFileSync(__dirname + '/inject_out.js', 'utf-8'));
fs.writeFileSync('inject.js',"var content = " + content + ";\nmodule.exports = content;");
