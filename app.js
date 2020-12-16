const Discord = require('discord.js');
const client = new Discord.Client({partials: ['REACTION', 'USER', 'GUILD_MEMBER']});
const path = require('path');
var fs = require('fs');
var http = require('http');
var re = require('./reSheet');

var god = fs.readFileSync(path.join(__dirname, "admin.txt"), {encoding:'utf8', flag:'r'} ).trim()

var pollMsgs = [];

var tRole = [];
var fRole = [];
var mRole = [];
var gAuth;

client.on('ready', async () => {	
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
				switch(rr.name){
					case 'They/Them/Their':
						tRole[g] = rr;
						break;
					case 'He/Him/His':
						mRole[g] = rr;
						break;
					case 'She/Her':
						fRole[g] = rr;
				}
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

	gAuth = await re.getAuthToken();
	if(gAuth) console.log('Signed into google API.');
});

client.on('message', async (msg) => {
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
				case 'source':
					msg.channel.send('https://github.com/Fenteale/FenBot');
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
					cToSend.send('React to this message to add the pronoun roll to your user.  Unreact to remove.\n :gun: : @They/Them/Their, :knife: : @He/Him/His :crossed_swords: : @She/Her').then(s => {
						s.react(':gun:');
						s.react(':knife:');
						s.react(':crossed_swords:');
						pollMsgs.push(s);
						fs.writeFileSync(path.join(__dirname, "messageCache.txt"), s.id + ' ' + msg.channel.id + '\n', {flag:'a+'})
					});
					
					break;
				case 'printPoll':
					msg.channel.send(pollMsgs);
					break;
				case 'getIp':
					if(msg.author.id != god) {
						msg.channel.send('You are not a fennec fox.');
						break;
					}
					var data = '';
					var request = http.request({host: 'ifconfig.me', path: '/'}, function (res) {
						res.on('data', function (chunk) {
							data += chunk;
						});
						res.on('end', function () {
							console.log(data);
							msg.channel.send('Ip is: ' + data);
						});
					});
					request.on('error', function (e) {
						console.log(e.message);
					});
					request.end();
					
					break;
				case 'spreadsheetTest':
					if(msg.author.id != god) {
						msg.channel.send('You are not a fennec fox.');
						break;
					}
					const response = await re.getSpreadSheetValues({spreadsheetId: '1mRTiCerVY85vG6w2vWQ3wdUN5LJYB4xpzE6_O6khUJI', auth: gAuth, sheetName: 'Sheet1'});
					msg.channel.send('output for getSpreadSheet ```\n' + JSON.stringify(response.data, null, 2) + '```');
					console.log('output for getSpreadSheet ', JSON.stringify(response.data, null, 2));
					break;
				default:
					msg.channel.send('Unrecognized command.');
					break;
			}
		}
	}
	else if(msgParts[0] === ':funnyman:')
		msg.channel.send(':funnyman:');
});

client.on('messageReactionAdd', async (rct, usr) => {
	if(usr.partial) await usr.fetch();
	if(pollMsgs.includes(rct.message))
	{
		const u = rct.message.guild.members.resolve(usr);
		if(u) {
			switch(rct.emoji.name) {
				case 'gun':
					u.roles.add(tRole[rct.message.guild]);
					console.log("Added role They/Them to " + u.user.username);
					break;
				case 'knife':
					u.roles.add(mRole[rct.message.guild]);
					console.log("Added role He/Him to " + u.user.username);
					break;
				case 'crossed_swords':
					u.roles.add(fRole[rct.message.guild]);
					console.log("Added role She/Her to " + u.user.username);
					break;
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
	if(usr.partial) await usr.fetch();
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