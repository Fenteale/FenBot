const fs = require('fs');
const path = require('path');
const {google} = require('googleapis');
const gal = require('google-auth-library');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

//set GOOGLE_APPLICATION_CREDENTIALS to equal path to service account credentials
//set GCLOUD_PROJECT to be the id of the google project
var sheets;
var googleAuth;
var sid = fs.readFileSync(path.join(__dirname, "..", "respreadsheet.txt"), {encoding:'utf8', flag:'r'} ).trim();

module.exports.getAuthToken = async () => {
	if(!sheets) sheets = google.sheets('v4');
	const auth = new gal.GoogleAuth({
		scopes: SCOPES
	});
	const authToken = await auth.getClient();
	googleAuth = authToken;
	return authToken;
}

async function getSpreadSheet({spreadsheetId, auth}) {
	const res = await sheets.spreadsheets.get({
		spreadsheetId,
		auth,
	});
	return res;
}

async function updateSpreadSheet({spreadsheetId, auth}) {
	const res = await sheets.spreadsheets.values.update({
		spreadsheetId,
		auth,
	});
	return res;
}

async function getSpreadSheetValues({spreadsheetId, auth, sheetName}) {
	const s = await getSpreadSheet({spreadsheetId, auth});
	var sD = s.data.sheets; //.sheets;
	var found = false;
	sD.forEach(se => {
		if(se.properties.title == sheetName)
			found = true;
	});
	if(!found)
		return undefined;
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId,
		auth,
		range: sheetName + '!A1:D1000'
	});
	return res;
}

module.exports.run = async (client, msg, args) => {
	if(msg.author.id != client.god) {
		msg.channel.send('You are not a fennec fox.');
		return;
	}
	switch (args[0]) {
		case 'get':
			console.log('Request for spreadsheet data. ', args[1], ' ', args[2]);
			if(!args[1] || !args[2]) {
				msg.channel.send('\"get\" requires two parameters.  First is the sheet name, second is the value.');
				break;
			}
			var rangeToPass = args[1];// + '!A1:D1000';
			const response = await getSpreadSheetValues({spreadsheetId: sid, auth: client.gAuth, sheetName: rangeToPass});
			if(response == undefined) {
				msg.channel.send('Sheet name \"' + args[1] + '\" does not exist.');
				break;
			}
			//msg.channel.send('output for getSpreadSheet ```\n' + JSON.stringify(response.data, null, 2) + '```');
			//console.log('output for getSpreadSheet ', JSON.stringify(response.data, null, 2));
			var iOfData = 0;
			var shouldSkip = false;
			response.data.values.forEach(v => {
				if(!shouldSkip) {
					var vParts = v[0].split('(');
					if(vParts[0] == args[2])
						shouldSkip = true;
					else
						iOfData ++;
				}
			});
			if(!shouldSkip) {
				msg.channel.send('Function name \"' + args[2] + '\" not found in \"' + args[1] + '\" sheet.');
				break;
			}
			var msgToSend = '**FUNCTION SIGNATURE**\n';
			msgToSend += '```cpp\n' + response.data.values[iOfData][0] + '```';
			if(response.data.values[iOfData][1] != '') {
				msgToSend += '\n**NOTES**\n';
				msgToSend += '```\n' + response.data.values[iOfData][1] + '```';
			}
			if(response.data.values[iOfData][2] != '') {
				msgToSend += '\n**ASSOCIATED FILE**\n';
				msgToSend += '```\n' + response.data.values[iOfData][2] + '```';
			}
			msgToSend += '\n**STATUS**\n';
			msgToSend += '```\n' + response.data.values[iOfData][3] + '```';
			msg.channel.send(msgToSend);
			break;
		case 'set':
			console.log('Request for writing spreadsheet data from', msg.author.username, args.join(' '));
			if(!args[1] || !args[2] || !args[3] || !args[4]) {
				msg.channel.send('\"get\" requires four parameters.  First is the sheet name, second is the value, third is the field to edit, last is the new value.');
				break;
			}
			var rangeToPass = args[1];// + '!A1:D1000';
			const response2 = await getSpreadSheetValues({spreadsheetId: sid, auth: client.gAuth, sheetName: rangeToPass});
			if(response2 == undefined) {
				msg.channel.send('Sheet name \"' + args[1] + '\" does not exist.');
				break;
			}
			args[4] = args.slice(4, args.length).join(' ');
			var goodP = true;
			var colLet = '';
			switch(args[3].toLowerCase()) {
				case 'notes':
					colLet='B';
					break;
				case 'file':
					colLet='C';
					break;
				case 'status':
					colLet='D';
					switch(args[4].toLowerCase()) {
						case 'needs check':
						case 'in progress':
						case 'completed':
						case 'not started':
						case 'ignored':
							args[4] = args[4].toUpperCase();
							break;
						default:
							goodP = false;
							break;
					}
					break;
				default:
					goodP = false;
					break;
			}
			if(!goodP)
			{
				msg.channel.send('Invalid parameters.');
				break;
			}

			var iOfData = 0;
			var shouldSkip = false;
			response2.data.values.forEach(v => {
				if(!shouldSkip) {
					var vParts = v[0].split('(');
					if(vParts[0] == args[2])
						shouldSkip = true;
					else
						iOfData ++;
				}
			});
			if(!shouldSkip) {
				msg.channel.send('Function name \"' + args[2] + '\" not found in \"' + args[1] + '\" sheet.');
				break;
			}
			response2.data.values[iOfData][3] = args[3];
			var req = {
				spreadsheetId: sid,
				range: args[1] + '!'+ colLet + String(iOfData+1),
				valueInputOption: 'USER_ENTERED',
				resource: {
					values: [[args[4]]]
				},
				auth: client.gAuth
			}
			await sheets.spreadsheets.values.update(req);
			msg.channel.send('Entry Updated');
			break;
		default:
			msg.channel.send('Unknown command for RE sheet.');
			break;
	}
	
}

module.exports.help = {
	name: 're',
	usage: 're <test>',
	info: 'Commands to interact with the RE Progress Google Sheet.'
};