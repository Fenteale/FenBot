const Discord = require('discord.js');
const client = new Discord.Client({partials: ['REACTION', 'USER', 'GUILD_MEMBER']});
const path = require('path');
var fs = require('fs');

var god = fs.readFileSync(path.join(__dirname, "admin.txt"), {encoding:'utf8', flag:'r'} ).trim()

var pollMsgs = [];

var foxRole = [];

client.on('ready', () => {	
	var pollMsgsStr = [];
	if(fs.existsSync(path.join(__dirname, 'messageCache.txt'))) {
		const mCache = fs.readFileSync(path.join(__dirname, 'messageCache.txt'), 'UTF-8');

		const lines = mCache.split(/\r?\n/);
		lines.forEach(line => {
			const parts = line.split(' ');
			pollMsgsStr.push({mid:parts[0],cid:parts[1]});
		});
	}

	client.guilds.cache.forEach(g => {
		console.log(g.name)
		g.roles.fetch().then(r => {
			r.cache.forEach(rr => {
			if(rr.name == 'Fox')
				foxRole[g] = rr;
			});
		});
		pollMsgsStr.forEach(p => {
			const chan = g.channels.resolve(p.cid);
			if(chan)
				chan.messages.fetch(p.mid).then(m => pollMsgs.push(m));
		})
	});
	console.log(pollMsgs);
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
					msg.channel.send('FOX' + msg.author.id);
					msg.react('🦊');
					//msg.channel.send(msg.author);
					break;
				case 'listChannels':
					msg.channel.startTyping();
					var fullResponse = "";
					msg.guild.channels.cache.forEach(c => {
						if(c.type == "text")
							fullResponse += c.name + "\n";
					});
					msg.channel.send(fullResponse);
					msg.channel.stopTyping(true);
					break;
				case 'startPoll':
					if(msg.author.id != god) {
						msg.channel.send('You are not a fennec fox.');
						break;
					}
					if(!msgParts[2]) {
						msg.channel.send('Please input a channel name.');
						break;
					}
					var cToSend;
					msg.guild.channels.cache.forEach(c => {
						if(c.type == "text")
							if(c.name == msgParts[2])
								cToSend = c;
					});
					cToSend.send('Test').then(s => {
						pollMsgs.push(s);
						fs.writeFileSync(path.join(__dirname, "messageCache.txt"), s.id + ' ' + msg.channel.id + '\n', {flag:'a+'})
					});
					
					break;
				case 'printPoll':
					msg.channel.send(pollMsgs);
					break;
				default:
					msg.channel.send('Unrecognized command.');
					break;
			}
		}
	}
});

client.on('messageReactionAdd', async (rct, usr) => {
	if(usr.partial) await usr.fetch();
	if(pollMsgs.includes(rct.message))
	{
		if(rct.emoji.name = 'fox') {
			const u = rct.message.guild.members.resolve(usr);
			if(u) {
				u.roles.add(foxRole[rct.message.guild]);
				console.log("Added role Fox to " + u.user.username);
			}
		}
	}
	else
	{
		console.log("Message reaction not found " + rct.message.id);
		console.log({mid:rct.message.id, cid:rct.message.channel.id})
		console.log(pollMsgs);
	}
});

client.on('messageReactionRemove', async (rct, usr) => {
	if(usr.partial) await usr.fetch(); //crashing here.  Why???
	if(pollMsgs.includes(rct.message))
	{
		if(rct.emoji.name = 'fox') {
			var u = rct.message.guild.members.resolve(usr);
			if(u) {
				u.roles.remove(foxRole[rct.message.guild]);
				console.log("Removed role Fox from " + u.user.username);
			}
		}
	}
});

client.login(fs.readFileSync(path.join(__dirname, "token.txt"), {encoding:'utf8', flag:'r'} ).trim());