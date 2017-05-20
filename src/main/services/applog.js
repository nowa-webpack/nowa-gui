import mkdirp from 'mkdirp';
import moment from 'moment';
// import DateDiff from 'date-diff';
// import format from 'date-formatter';
import log from 'electron-log';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, readdirSync, removeSync } from 'fs-extra';

const clearLog = (type) => {
  const logFolder = join(homedir(), '.nowa-gui', `${type}logs`);

  if (!existsSync(logFolder)) {
    mkdirp(logFolder);
  }

  // const current = format(new Date(), 'YYYY-MM-DD');
  const current = moment().format('YYYY-MM-DD');

  log.transports.file.file = `${logFolder}/log-${current}.txt`;

  try {
    readdirSync(logFolder)
      .filter(fileName => fileName.includes('.txt'))
      .forEach((fileName) => {
        const date = fileName.slice(4, 14);
        const delFlag = moment().diff(moment(date), 'days') >= 10;
        // const diff = new DateDiff(new Date(), new Date(date));
        // const delFlag = diff.days() >= 10;
        console.log(delFlag);
        if (delFlag) {
          removeSync(join(logFolder, fileName));
        }
      });
  } catch (e) {
    log.error(e.message);
  }
};

export default { error: log.error, info: log.info, clearLog };
