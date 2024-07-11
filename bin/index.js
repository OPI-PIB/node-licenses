#! /usr/bin/env node

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
	'WTFPL',
];

program
	.command('list')
	.description('List all licenses in project')
	.action((options) => {
		checker.init(
			{
				start: './',
			},
			async function (err, packages) {
				if (err) {
					console.err(err);
				} else {
					const chalk = (await import('chalk')).default;
					const licensesPermissive = {};
					const packegesNotPermissive = [];

					for (const [packageName, packageInfo] of Object.entries(
						packages
					)) {
						const license = packageInfo.licenses;

						if (permissive.includes(license)) {
							if (licensesPermissive[license]) {
								licensesPermissive[license] += 1;
							} else {
								licensesPermissive[license] = 1;
							}
						} else {
							packegesNotPermissive.push({
								packageName,
								packageInfo,
							});
						}
					}

					console.log(chalk.green(`Licenses permissive:`));
					console.log(chalk.white(`------`));
					for (const [license, count] of Object.entries(
						licensesPermissive
					)) {
						console.log(chalk.green(`${license}: ${count}`));
					}

					if (packegesNotPermissive.length) {
						console.log(chalk.white(`------`));
						console.log(
							chalk.yellow(
								`Packages with not permissive licenses:`
							)
						);
						packegesNotPermissive.forEach((p) => {
							console.log(chalk.white(`------`));
							console.log(chalk.yellow(`Name: ${p.packageName}`));
							console.log(
								chalk.yellow(
									`Licenses: ${p.packageInfo.licenses}`
								)
							);
							console.log(
								chalk.yellow(`Path: ${p.packageInfo.path}`)
							);
							console.log(
								chalk.yellow(
									`Repository ${p.packageInfo.repository}`
								)
							);
						});
					}
				}
			}
		);
	});

program.parse();
