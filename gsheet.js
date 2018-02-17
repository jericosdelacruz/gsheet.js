'use strict';
const google = require('googleapis');
const sheets = google.sheets('v4');
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET
);



module.exports.save = (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false; 
    
    const timestamp = new Date().getTime();
    
    var data = event.body;
    if(typeof event.body !== 'object'){
      data = JSON.parse(event.body);
    }
  
    if (typeof data.text !== 'string') {
      console.error('Validation Failed');
      callback(null, {
        statusCode: 400,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the todo item.',
      });
      return;
    }

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    })

    oauth2Client.refreshAccessToken((err, tokens) => {
        if (err) return console.error(err)
        
        oauth2Client.setCredentials({
            access_token: tokens.access_token,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        })

        // The following call will create a spreadsheet and return an ID that can
        // be used with the API. Note that oAuth API can only be used to access
        // files it creates, not files already on a drive (unless you apply to
        // Google for additional privilages.)
        /*
        sheets.spreadsheets.create({ auth: oauth2Client }, (err, response) => {
        if (err) return console.error(err)
        console.log(`New Spreadsheet ID: ${response.spreadsheetId}`)
        })
        */
        
        sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
            range: 'Sheet1',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [
                [new Date().toISOString(), data.text, data.other_text]
                ],
            },
            auth: oauth2Client
        }, (err, response) => {
            if (err) return console.error(err)

            console.log(response);

            const result = {
                statusCode: 200,
                body: {'status':'success'},
            };
          
            callback(null, result);
        });

    });

};
