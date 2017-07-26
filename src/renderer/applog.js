/*
	无用，本打算把renderer日志一起保存到mainlogs
*/
import mkdirp from 'mkdirp';
import moment from 'moment';
import { join } from 'path';
import { homedir } from 'os';
import log from 'electron-log';
import { existsSync } from 'fs-extra';

const type = 'renderer';
const logFolder = join(homedir(), '.nowa-gui', `${type}logs`);
const current = moment().format('YYYY-MM-DD');

if (!existsSync(logFolder)) {
  mkdirp(logFolder);
}

log.transports.file.file = `${logFolder}/log-${current}.txt`;

export default { error: log.error, info: log.info };
