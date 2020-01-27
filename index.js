const settings = require('./settings');
const Raven = require('raven');
const Polaris = require('./polaris');
const keepalive = require('express-glitch-keepalive');

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

// Connect to a cluster containing `192.168.0.100`, `192.168.0.100`, `192.168.0.102` and
// use a maximum of 3000 connections and try to keep 300 connections available at all time.
var r = require('rethinkdbdash')({pool: false, discovery: true,
    servers: [
        {host: '*', port: 28015},
    ],
    buffer: 300,
    max: 3000
});

