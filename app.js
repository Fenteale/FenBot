const Discord = require('discord.js');
const client = new Discord.Client();
const path = require('path');
var fs = require('fs');

client.on('ready', () => {
	console.log('Logged in as ' + client.user.tag + '!');
});

client.on('message', msg => {
	var msgParts = msg.content.split(" ");
	if(msgParts[0] === '.fennec') {
		if(msgParts.length >= 2)
		{
			switch(msgParts[1]) {
				case 'small':
					msg.channel.send('fox');
					break;
				case 'large':
					msg.channel.send('FOX');
					break;
				default:
					msg.channel.send('Unrecognized command.');
					break;
			}
		}
	}
});

client.login(fs.readFileSync(path.join(__dirname, "token.txt"), {encoding:'utf8', flag:'r'} ).trim());