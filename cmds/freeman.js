var fs = require('fs');

const data = fs.readFileSync('johnfreeman.txt', 'UTF-8');

const lines = data.split(/\r?\n/);


module.exports.run = async (client, msg, args) => {
    

    randEntry = Math.floor(Math.random() * (lines.length - 1));

    msg.channel.send(lines[randEntry]);
	
}

module.exports.help = {
	name: 'freeman',
	usage: 'freeman',
	info: 'Spout a random john freeman line.'
};