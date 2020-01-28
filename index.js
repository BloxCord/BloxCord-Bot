const express = require('express');
const settings = require('./settings');
const Raven = require('raven');
const Polaris = require('./polaris');
const keepalive = require('express-glitch-keepalive');
const app = express();

// Setup Raven Configuration
Raven.config(settings.sentry, {
	captureUnhandledRejections: true,
	autoBreadcrumbs: true,
	sendTimeout: 3
}).install();

const Client = new Polaris.Client({
	token: process.env.NODE_ENV === 'production' ? settings.token : settings.testToken,
	Raven,
	erisSettings: {
		maxShards: 'auto'
	}
});

app.get('/health', (req, res) => {
  res.json({  
    uptime: Math.floor(process.uptime())
  });
});

// Connect to a cluster containing `192.168.0.100`, `192.168.0.100`, `192.168.0.102` and
// use a maximum of 3000 connections and try to keep 300 connections available at all time.
var r = require('rethinkdbdash')({pool: true, discovery: true,
    servers: [
        {host: '*', port: 28015},
    ],
    buffer: 300,
    max: 3000
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

