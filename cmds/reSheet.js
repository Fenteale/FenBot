const fs = require('fs');
const {google} = require('googleapis');
const gal = require('google-auth-library');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

//set GOOGLE_APPLICATION_CREDENTIALS to equal path to service account credentials
//set GCLOUD_PROJECT to be the id of the google project
var sheets;

module.exports.getAuthToken = async () => {
	if(!sheets) sheets = google.sheets('v4');
	const auth = new gal.GoogleAuth({
		scopes: SCOPES
	});
	const authToken = await auth.getClient();
	return authToken;
}

async function getSpreadSheet({spreadsheetId, auth}) {
	const res = await sheets.spreadsheets.get({
		spreadsheetId,
		auth,
	});
	return res;
}

async function getSpreadSheetValues({spreadsheetId, auth, sheetName}) {
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId,
		auth,
		range: sheetName
	});
	return res;
}

module.exports.run = async (client, msg, args) => {
	if(msg.author.id != client.god) {
		msg.channel.send('You are not a fennec fox.');
		return;
	}
	const response = await getSpreadSheetValues({spreadsheetId: '1mRTiCerVY85vG6w2vWQ3wdUN5LJYB4xpzE6_O6khUJI', auth: client.gAuth, sheetName: 'Sheet1'});
	msg.channel.send('output for getSpreadSheet ```\n' + JSON.stringify(response.data, null, 2) + '```');
	console.log('output for getSpreadSheet ', JSON.stringify(response.data, null, 2));
	console.log(response.data.values[0][0]);
}

module.exports.help = {
	name: 're',
	usage: 're <test>',
	info: 'Commands to interact with the RE Progress Google Sheet.'
};