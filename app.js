//Fenbot entry source: app.js
//Huge thanks to Bryson and his bot https://github.com/brysondev/brysonBot2.0
//for letting me borrow some code

const Discord = require('discord.js');
const client = new Discord.Client({partials: ['REACTION', 'USER', 'GUILD_MEMBER']});
const path = require('path');
var fs = require('fs');

var god = fs.readFileSync(path.join(__dirname, "admin.txt"), {encoding:'utf8', flag:'r'} ).trim()

client.pollMsgs = [];

var tRole = [];
var fRole = [];
var mRole = [];

var prefix = '.john';

client.commands = new Discord.Collection();
client.god = god;

fs.readdir('./cmds/', (err, files) => {
	if (err) console.error(err);

	let jsFile = files.filter((x) => x.split('.').pop() === 'js');
	if (jsFile.length <= 0) {
		console.log('No commands in cmds!');
		return;
	}

	console.log(`Loading ${jsFile.length} cmds... `);

	jsFile.forEach((f, i) => {
		let props = require(`./cmds/${f}`);
		client.commands.set(props.help.name, props);
	});
});

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
					case 'They/Them':
						tRole[g] = rr;
						break;
					case 'He/His':
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
				chan.messages.fetch(p.mid).then(m => client.pollMsgs.push(m));
		})
	});
	console.log('Logged in as ' + client.user.tag + '!');

});

client.on('message', async (msg) => {
	var msgParts = msg.content.split(" ");
	if(msgParts[0] === prefix) {
		if(msgParts.length >= 2)
		{
			let cmd = client.commands.get( msgParts[1] );
			if (cmd) cmd.run(client, msg, msgParts.slice(2));
			else msg.channel.send('Unrecognized command.');
		}
	}
	else if((msgParts[0] === '<:funnyman:783147621093998613>') && (msg.author != client.user) )
		msg.channel.send('<:funnyman:783147621093998613>');
		
});

client.on('messageReactionAdd', async (rct, usr) => {
	if(usr.partial) await usr.fetch();
	if(client.pollMsgs.includes(rct.message))
	{
		const u = rct.message.guild.members.resolve(usr);
		if(u && usr != client.user) {
			switch(rct.emoji.name) {
				case '🔫':
					u.roles.add(tRole[rct.message.guild]);
					console.log("Added role They/Them to " + u.user.username);
					break;
				case '🔪':
					u.roles.add(mRole[rct.message.guild]);
					console.log("Added role He/Him to " + u.user.username);
					break;
				case '⚔️':
					u.roles.add(fRole[rct.message.guild]);
					console.log("Added role She/Her to " + u.user.username);
					break;
				default:
					console.log('WTF ', rct.emoji.name);
			}
		}
	}
});

client.on('messageReactionRemove', async (rct, usr) => {
	if(usr.partial) await usr.fetch();
	if(client.pollMsgs.includes(rct.message))
	{
		const u = rct.message.guild.members.resolve(usr);
		if(u && usr != client.user) {
			switch(rct.emoji.name) {
				case '🔫':
					u.roles.remove(tRole[rct.message.guild]);
					console.log("Removed role They/Them to " + u.user.username);
					break;
				case '🔪':
					u.roles.remove(mRole[rct.message.guild]);
					console.log("Removed role He/Him to " + u.user.username);
					break;
				case '⚔️':
					u.roles.remove(fRole[rct.message.guild]);
					console.log("Removed role She/Her to " + u.user.username);
					break;
			}
		}
	}
});

client.login(fs.readFileSync(path.join(__dirname, "token.txt"), {encoding:'utf8', flag:'r'} ).trim());