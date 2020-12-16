const fs = require('fs');
const {google} = require('googleapis');
const gal = require('google-auth-library');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

//set GOOGLE_APPLICATION_CREDENTIALS to equal path to service account credentials
//set GCLOUD_PROJECT to be the id of the google project
var sheets;

async function getAuthToken() {
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
  
  
module.exports = {
	getAuthToken,
	getSpreadSheet,
	getSpreadSheetValues
}