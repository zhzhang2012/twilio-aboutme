'use strict';

var express = require('express'),
    path = require('path'),
    xml2js = require('xml2js'),
    parseXML = xml2js.parseString,
    request = require('request'),
    bodyParser = require('body-parser'),
    AV = require('leanengine');

var app = express();

var APP_ID = process.env.LC_APP_ID || 'Hg2sgMSf0j9eyHY0b2A6BC7j'; // your app id
var APP_KEY = process.env.LC_APP_KEY || 'kinRpjKAngCaE9XUXDwGFEQ1'; // your app key
var MASTER_KEY = process.env.LC_APP_MASTER_KEY || 'a25zEvRHqxvM2CRLNgQaeBx0'; // your app master key

AV.initialize(APP_ID, APP_KEY, MASTER_KEY);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var _questions = [
    {
        content: "What college did I attend?",
        choices: [
            "Harvey Mudd College",
            "Caltech"
        ],
        answer: '1'
    },
    {
        content: "What's my favorite club in England Primer League?",
        choices: [
            "Manchester United",
            "Arsenal",
            "Manchester City"
        ],
        answer: '2'
    },
    {
        content: "What's my least favorite class?",
        choices: [
            "Math",
            "Computer Science",
            "Physics"
        ],
        answer: '3'
    },
    {
        content: "What's my favorite sport?",
        choices: [
            "Soccer",
            "Basketball",
            "Tennis"
        ],
        answer: '1'
    },
    {
        content: "What's my favorite club in Chinese Primer League?",
        choices: [
            "Beijing Guoan",
            "Guangzhou Monkey",
            "Shandong Donkey"
        ],
        answer: '1'
    }
];
var _curQuestion = 0;

app.post('/welcome', function (req, res) {
    var contact = {
        "+8613691382363": "my love",
        "+16513569218": "my love",
        "+8618610322136": "Tony"
    };

    var from = req.body.From;
    var Name = (typeof contact[from] == "undefined") ? "my friend" : contact[from];

    res.set('Content-Type', 'text/xml');
    res.send('<?xml version=\"1.0\" encoding=\"UTF-8\"?>' +
        '<Response><Gather numDigits="1" action="/choose" method="POST"><Say>' +
        'Hi ' + Name + '! Welcome to this simple program about me, Tony. ' +
        'If you want to answer a question about me, please press 1. ' +
        'If you don\'t, please say something directly to me by pressing 2. Thanks!' +
        '</Say></Gather></Response>');
});

app.post('/choose', function (req, res) {
    var digits = req.body.Digits;
    console.log(req.body.Digits);

    res.set('Content-Type', 'text/xml');
    var responseXML = '<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response>';
    if (digits == '1') {
        responseXML += '<Say>Thank you for taking the quiz. The question is ';
        _curQuestion = Math.floor(Math.random() * _questions.length);
        responseXML += _questions[_curQuestion].content;
        responseXML += ' Here are the choices: <Gather numDigits="1" action="/answer" method="POST">';
        for (var i = 1; i <= _questions[_curQuestion].choices.length; ++i) {
            responseXML += ("Please press " + i + " if you think the answer is " + _questions[_curQuestion].choices[i - 1]) + ". ";
        }
        responseXML += "</Gather></Say>";

    } else if (digits == '2') {
        responseXML += '<Say>Please say something to me after the tone.';
        responseXML += '<Record maxLength="60" action="/record" />';
    }
    res.send(responseXML + '</Response>');
});

app.post('/answer', function (req, res) {
    var digits = req.body.Digits;

    var responseXML = '<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response>';
    if (digits == _questions[_curQuestion].answer) {
        responseXML += '<Say>You got correct! Do you want to try another question? ';
        responseXML += '<Gather numDigits="1" action="/retry" method="POST">Please press 1 for yes ' +
            'and any other button for no</Gather></Say>'
    } else {
        responseXML += "<Say>It seems that the answer is incorrect. Do you want to start over? "
        responseXML += '<Gather numDigits="1" action="/retry" method="POST">Please press 1 for yes ' +
            'and any other button for no</Gather></Say>'
    }
    res.send(responseXML + '</Response>');
});

app.post('/retry', function (req, res) {
    var digits = req.body.Digits;

    var responseXML = '<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response>';
    if (digits == '1') {
        responseXML += '<Say>Thank you for taking the quiz. The question is ';
        _curQuestion = Math.floor(Math.random() * _questions.length);
        responseXML += _questions[_curQuestion].content;
        responseXML += 'Here are the choices: <Gather numDigits="1" action="/answer" method="POST">';
        for (var i = 1; i <= _questions[_curQuestion].choices.length; ++i) {
            responseXML += ("Please press " + i + " if you think the answer is " + _questions[_curQuestion].choices[i - 1]) + ". ";
        }
        responseXML += "</Gather></Say>";
    } else {
        responseXML += '<Say>Goodbye.</Say>';
    }
    res.send(responseXML + '</Response>');
});

app.post('/record', function (req, res) {
    var Record = AV.Object.extend('Records');
    var newRecord = new Record();

    res.set('Content-Type', 'text/xml');
    var responseXML = '<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response>';

    newRecord.set('url', req.body.requestUrl);
    newRecord.save(null, {
        success: function () {
            responseXML += "<Say>Thanks for telling me what you feel about me! Goodbye.</Say></Response>";
            res.send(responseXML);
        }, error: function () {
            responseXML += "<Say>Sorry an error occurred while recording your voice! Goodbye.</Say></Response>";
            res.send(responseXML);
        }
    })
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Node server listening on port: ", PORT);
});
