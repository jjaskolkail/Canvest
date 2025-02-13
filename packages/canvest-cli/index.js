#!/usr/bin/env node
const path = require('path');
const argv = require('yargs').argv;
const processUtil = require('./src/processUtil');
const createScirpt = require('./src/createScirpt');

(async () => {
	const cachePort = argv.cachePort ? argv.cachePort : 45670;

	createScirpt.createInitScript(cachePort, argv.ts);

	const cmd = ['--kill-others'];

	const cdsConfigCMD = `--port ${cachePort} ${
		argv.ci ? `--ci ${argv.ci}` : ''
		}`;

	cmd.push(
		`"node ./node_modules/@canvest/canvest-dev-server/index.js ${cdsConfigCMD}"`,
	);

	const wdsRunCMD = `node ./node_modules/webpack-dev-server/bin/webpack-dev-server.js --config ${path.join(
		__dirname,
		'./canvest.config.js',
	)}`;

	// TODO: replace --quiet
	const wdsConfigCMD = `${!argv.debug ? '' : ''} ${
		argv.pagePort ? `--port ${argv.pagePort}` : ''
		} ${argv.ts ? `--ts ${argv.ts}` : ''}`;

	cmd.push(`" ${wdsRunCMD} ${wdsConfigCMD} "`);

	try {
		await processUtil.processRunConcurrently(cmd, process.cwd());
	}catch (e) {
		console.log(e);
	}

})();
