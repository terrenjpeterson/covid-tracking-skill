'use strict';

const https = require('https');
var aws = require('aws-sdk');

exports.handler = (event, context, callback) => {
    console.log("Starting Session");
    const APIurl = 'https://covidtracking.com/api/states';

    https.get(APIurl, (res) => {
        console.log('API Call HTTP Code: ', res.statusCode); // this indicates if the HTTP request was valid

        var tempData = "";

        res.on('data', (d) => {
            tempData += d;
        });
                        
        // this is the logic that gets executed once a successful API call is completed
        res.on('end', (d) => {
            console.log('completed request');
            // now process data returned from the API call
            //var returnData = tempData.toString('utf8');
            var returnData = eval('(' + tempData.toString('utf8') + ')');

            // write out the first entry into the array - i.e. Alaska data
            console.log(JSON.stringify(returnData[0]));

            var s3 = new aws.S3();
            // convert the object to a string before storing
            var postData = JSON.stringify(returnData);

            const putParams = {Bucket : 'covidalexadata', Key : 'currData.json', Body: postData};

            // write to an S3 bucket
            s3.putObject(putParams, function(err, data) {
                if(err)
                    console.log('Error posting data' + err);
                else {
                    console.log('Successfully posted data');
                    //console.log('Successfully posted data' + putParams.Body);
                    callback(null, returnData);
               }
            });
        });
    }).on('error', (e) => {
        console.error(e);
    });
};
