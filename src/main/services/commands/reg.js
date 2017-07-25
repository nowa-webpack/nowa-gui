/*
 reference node-reg

*/
import { join } from 'path';
import { exec } from 'child_process';

export const addRegKey = function(entry) {
	const basePath = join(process.env.WINDIR, 'system32', 'reg.exe');
	return new Promise(function(resolve, reject) {

		let query = basePath;
		query += ' add ' + entry.target;
		query += ' /v ' + entry.name;
		query += ' /t ' + entry.type;
		query += ' /d ' + entry.value;
		query += ' /f';

		executeQuery(query).then(function(value) {
			resolve(value);
		}, function(error) {
			reject(error);
		});

	});
}

export const getRegKey = function(entry) {
	const basePath = join(process.env.WINDIR, 'system32', 'reg.exe');
	return new Promise(function(resolve, reject) {

		let query = basePath;
		query += ' query ' + entry.target;
		if(entry.name) {
			query += ' /v ' + entry.name;
		}
		if(entry.type) {
			query += ' /t ' + entry.type;
		}

		executeQuery(query).then(function(value) {
			resolve(value);
		}, function(error) {
			reject(error);
		});

	});
}

function executeQuery(query) {
	return new Promise(function(resolve, reject) {

		const child = exec(query, (error, stdout, stderr) => {
			if(error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		});

	});
}