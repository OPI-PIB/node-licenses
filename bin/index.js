#! /usr/bin/env node

// @ts-check

const { program } = require('commander');
const checker = require('license-checker-rseidelsohn');

const permissive = [
	// MIT-like
	'MIT',
	'MIT-0',
	'ISC',

	// Apache
	'Apache-2.0',

	// BSD
	'0BSD',
	'BSD-2-Clause',
	'BSD-3-Clause',
	'BSD-3-Clause-Clear',
	'BSD-4-Clause',

	// Creative Commons
	'CC0-1.0',

	// Microsoft
	'MS-PL',

	// Other
	'Unlicense',
	'WTFPL'
];

program
	.command('list')
	.description('List all licenses in project')
	.option('-p, --production', 'Only show production dependencies', false)
	.option('-n, --nopeer', 'Ignore peerDependencies', false)
	.option('-d, --direct', 'Look for direct dependencies only', false)
	.action(({ production, nopeer, direct }) => {
		checker.init(
			{
				start: './',
				production,
				nopeer,
				direct
			},
			function (err, packages) {
				if (err) {
					console.error(err);
				} else {
					const licensesPermissive = /** @type {{[key: string]: number}} */ ({});
					const packagesNotPermissive = [];

					for (const [packageName, packageInfo] of Object.entries(packages)) {
						const license = packageInfo.licenses;

						if (typeof license === 'string' && permissive.includes(license)) {
							if (licensesPermissive[license]) {
								licensesPermissive[license] += 1;
							} else {
								licensesPermissive[license] = 1;
							}
						} else {
							packagesNotPermissive.push({
								packageName,
								packageInfo
							});
						}
					}

					console.log(`✅ Licenses permissive:`);
					console.log(`------`);
					for (const [license, count] of Object.entries(licensesPermissive)) {
						console.log(`✅ ${license}: ${count}`);
					}

					if (packagesNotPermissive.length) {
						console.log(`------`);
						console.log(`⚠️  Packages with not permissive licenses:`);
						packagesNotPermissive.forEach((p) => {
							console.log(`------`);
							console.log(`⚠️  Name: ${p.packageName}`);
							console.log(`⚠️  Licenses: ${p.packageInfo.licenses}`);
							console.log(`⚠️  Path: ${p.packageInfo.path}`);
							console.log(`⚠️  Repository ${p.packageInfo.repository}`);
						});
					}
				}
			}
		);
	});

program.parse();
