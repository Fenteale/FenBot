var fs = require('fs');
const path = require('path');

module.exports.run = async (client, msg, args) => {
	if(msg.author.id != client.god) {
		msg.channel.send('You are not a fennec fox.');
		return;
	}
	if(!args[0]) {
		msg.channel.send('Please input a channel name.');
		return;
	}
	var cToSend;
	msg.guild.channels.cache.forEach(c => {
		if(c.type == "text")
			if(c.name == args[0])
				cToSend = c;
	});
	cToSend.send('React to this message to add the pronoun roll to your user.  Unreact to remove.\n :gun: : @They/Them/Their, :knife: : @He/Him/His :crossed_swords: : @She/Her').then(s => {
	//cToSend.send('This is a test poll').then(s => {
		s.react('🔫');
		s.react('🔪');
		s.react('⚔️');
		client.pollMsgs.push(s);
		fs.writeFileSync(path.join(__dirname, "..", "messageCache.txt"), s.id + ' ' + msg.channel.id + '\n', {flag:'a+'})
	});
}

module.exports.help = {
	name: 'startPoll',
	usage: 'startPoll <channel name>',
	info: 'Start a pronoun roll poll in the desired channel.'
};