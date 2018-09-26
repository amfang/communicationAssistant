
/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'),
  app = express(),
  vcapServices = require('vcap_services'),
  extend = require('util')._extend,
  watson = require('watson-developer-cloud');
var expressBrowserify = require('express-browserify');

// load environment properties from a .env file for local development
require('dotenv').load({silent: true});

// Bootstrap application settings
require('./config/express')(app);

// automatically compile and serve the front-end js
app.get('/js/index.js', expressBrowserify('src/index.js', {
  watch: process.env.NODE_ENV !== 'production'
}));

var username = '';
var password = '';

// For local development, replace username and password
var config = extend({
  version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
  username: process.env.STT_USERNAME || username,
  password: process.env.STT_PASSWORD || password,
  responseHeader: {'Access-Control-Allow-Origin': '*'}
}, vcapServices.getCredentials('speech_to_text'));

var authService = watson.authorization(config);

app.get('/', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.render('index', {
    ct: req._csrfToken,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID
  });
});

// Get token using your credentials
app.post('/api/token', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  authService.getToken({url: config.url}, function(err, token) {
    if (err)
      next(err);
    else
      res.send(token);
  });
});

// From language-translator-nodejs/app.js

var LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');

var translator = new LanguageTranslatorV3({
  // If unspecified here, the LANGUAGE_TRANSLATOR_USERNAME and LANGUAGE_TRANSLATOR_PASSWORD environment properties will be checked
  // LANGUAGE_TRANSLATOR_IAM_APIKEY if apikey is present
  // After that, the SDK will fall back to the ibm-cloud-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>'
  version: '2018-05-01',
  headers: {
    'X-Watson-Technology-Preview': '2018-05-01',
    'X-Watson-Learning-Opt-Out': true,
  },
});

/*
// render index page
app.get('/', function(req, res) {
  // If hide_header is found in the query string and is set to 1 or true,
  // the header should be hidden. Default is to show header
  res.render('index', {
    hideHeader: !!(req.query.hide_header == 'true' || req.query.hide_header == '1'),
  });
});
*/

app.get('/api/models', function(req, res, next) {
  console.log('/v3/models');
  translator.listModels({}, function(err, models) {
    if (err) return next(err);
    else res.json(models);
  });
});

app.post('/api/identify', function(req, res, next) {
  console.log('/v3/identify');
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('updated');
  translator.identify(req.body, function(err, models) {
    if (err) return next(err);
    else res.json(models);
  });
});

app.get('/api/identifiable_languages', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('/v3/identifiable_languages');
  translator.listIdentifiableLanguages({}, function(err, models) {
    console.log("models:" + models);
    if (err) return next(err);
    else res.json(models);
  });
});

app.post('/api/translate', function(req, res, next) {
  console.log('/v3/translate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  translator.translate(req.body, function(err, models) {
    if (err) return next(err);
    else res.json(models);
  });
});

const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

const textToSpeech = new TextToSpeechV1({
  // If unspecified here, the TEXT_TO_SPEECH_USERNAME and
  // TEXT_TO_SPEECH_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  // username: '<username>',
  // password: '<password>',
  // iam_apikey: '{BzxUNPOeCgLZJVSatOWk2krlSnYHg0kdTsEII3fLrGtK}',
  // url: '{https://gateway-wdc.watsonplatform.net/text-to-speech/api}'
});

/**
 * Pipe the synthesize method - 在watson-developer-cloud@2.42可以使用但3.9不能使用,3.9需要添加
 * synthesizeParams
 */
app.get('/api/synthesize', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('Get request: ', JSON.stringify(req.query));
  var synthesizeParams = {
    text: req.query.text,
    accept: 'audio/wav',
    voice: req.query.voice
  };
  const transcript = textToSpeech.synthesize(synthesizeParams);
  transcript.on('response', function(response) {
    if (req.query.download) {
      if (req.query.accept && req.query.accept === 'audio/wav') {
        response.headers['content-disposition'] = 'attachment; filename=transcript.wav';
      } else {
        response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
      }
    }
  });
  transcript.on('error', next);
  transcript.pipe(res);
});

// error-handler settings
require('./config/error-handler')(app);

module.exports = app;
