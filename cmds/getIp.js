var http = require('http');

module.exports.run = async (client, msg, args) => {
	if(msg.author.id != client.god) {
		msg.channel.send('You are not a fennec fox.');
		return;
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
}

module.exports.help = {
	name: 'getIP',
	usage: 'getIP',
	info: 'Has the bot print the public IP of the server its running on.  Only usable by admin.'
};