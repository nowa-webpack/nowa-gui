import { hostname } from 'os';
import MacAddress from 'get-mac-address';
import { FEEDBACK_URL, request } from 'shared-nowa';

import { APP_VERSION } from './paths';
import log from './applog';

const logServer = 'http://gm.mmstat.com/jstracker.3';
const nick = hostname();

const feedback = async function ({ nickname, contact, content }) {
  const res = await request(FEEDBACK_URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      msgtype: 'markdown',
      markdown: {
        title: '来自用户的反馈',
        text: '### Name\n' +
              `${nickname}\n` +
              '### Contact\n' +
              `${contact}\n` +
              '### Feedback\n' +
              `${content}\n` +
              '### Version\n' +
              `${APP_VERSION}\n` +
              '### OS\n' +
              `${process.platform}\n`
      }
    })
  });
  return res;
};

const macAddr = Object.values(MacAddress).filter(n => n.indexOf('00:00:00:00') === -1);


const getPointArgs = () => {
  const params = {
    nick,
    url: 'log://uxdata/nowa/',
    msg: JSON.stringify({
      MAC: macAddr[0],
      version: APP_VERSION,
      os: process.platform,
    }),
    sampling: 1,
  };
  return Object
    .keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
};

const sendPointLog = () => {
  const queryStr = getPointArgs();
  request(`${logServer}?${queryStr}`);
};


export default {
  feedback,
  sendPointLog
};
