// plase don't import electron here

import is from 'electron-is';

export { default as request } from './request';
export { default as checkver } from './checkver';
export const isDev = is.dev();
export const isMac = is.macOS();
export const isWin = is.windows();
export const isLinux = is.linux();

export const delay = n => new Promise(resolve => setTimeout(resolve, n));

export const throttle = (fn, time) => {
  let timer;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(context, args), time);
  };
};

const PROD_DINGDING_TOKEN = 'be77cc501c1d5a466f91690266495a28b1a0e0cb654cc578cfd5a00dbd1b7850';

// test token
const DEV_DINGDING_TOKEN = '399b920a41af24d5c4d0e12f302a496a37e816bf7eaad10aa59fb93f8330cc78';

export const FEEDBACK_URL = `https://oapi.dingtalk.com/robot/send?access_token=${isDev ? DEV_DINGDING_TOKEN : PROD_DINGDING_TOKEN}`;
