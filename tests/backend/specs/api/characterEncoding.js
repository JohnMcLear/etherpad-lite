/*
 * ACHTUNG: there is a copied & modified version of this file in
 * <basedir>/tests/container/spacs/api/pad.js
 *
 * TODO: unify those two files, and merge in a single one.
 */

const assert = require('assert');
const supertest = require(__dirname+'/../../../../src/node_modules/supertest');
const fs = require('fs');
const settings = require(__dirname+'/../../loadSettings').loadSettings();
const api = supertest('http://'+settings.ip+":"+settings.port);
const path = require('path');
const async = require(__dirname+'/../../../../src/node_modules/async');
var filePath = path.join(__dirname, '../../../../APIKEY.txt');
var apiKey = fs.readFileSync(filePath,  {encoding: 'utf-8'});
apiKey = apiKey.replace(/\n$/, "");
var apiVersion = "1.2.13";
var testPadId = makeid();

api.get(endPoint('deletePad')+"&padID="+testPadId)
	.expect('Content-Type', /json/)
	.end(function(e,r){
		console.log(1 + " is is fail", JSON.parse(r.res.text).code);
	})


// works
api.get(endPoint('createPad')+"&padID="+testPadId)
	.expect(function(res){
	//	console.log(res.body);
		if(res.body.code !== 0) throw new Error("Unable to create new Pad");
	})
	.expect('Content-Type', /json/)
	.end(function(e,r){
		console.log(1 + " is is fail -- createPad", JSON.parse(r.res.text).code);
	})


console.log(testPadId);

fs.readFile('./../tests/backend/specs/api/emojisLess.html', 'utf8', function(err, html) {

// 	html = encodeURIComponent(html);

	api.post(endPoint('setHTML'))
		.send({
			"padID" : testPadId,
			"html" : html
		})
		.expect(function(res){
console.log(res);
			if(res.body.code !== 0) throw new Error("Can't set HTML properly");
		})
		.expect('Content-Type', /json/)
		.end(function(e,r){
console.log(e);
			console.log(1 + " is is fail -- setHTML", JSON.parse(r.res.text).code);

			api.get(endPoint('getHTML')+"&padID="+testPadId)
				.expect(function(res){
			//		console.log(testPadId, res.body);
					if(res.body.data.html.length <= 1) throw new Error("Unable to get the HTML");
				})
				.expect('Content-Type', /json/)
				.end(function(e,r){
					console.log(r.res.text);
// 					console.log(1 + " is is fail -- getHTML", JSON.parse(r.res.text).code);
				})
			// end get HMTL
		})
	});












function endPoint(point, version){
  version = version || apiVersion;
  return '/api/'+1+'/'+point+'?apikey='+apiKey;
}

function makeid()
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 10; i++ ){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

