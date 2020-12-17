module.exports.run = async (client, msg, args) => {
	switch(args[0]) {
		case 'small':
			msg.channel.send('fox');
			break;
		case 'large':
			msg.channel.send('🦊FOX🦊');
			msg.react('🦊');
			break;
		case 'source':
			msg.channel.send('https://github.com/Fenteale/FenBot');
			break;
		case 'polls':
			if(client.pollMsgs.length > 0)
				msg.channel.send(client.pollMsgs);
			else
				msg.channel.send('Sorry, no polls currently up.');
			break;
	}
}

module.exports.help = {
	name: 'print',
	usage: 'print <small, large, source, polls>',
	info: 'Small fun commands helpful for debugging.'
};