// plase don't import electron here

// const is = require('electron-is');
// const request = require('./request');
import is from 'electron-is';

export { default as request } from './request';
export { default as checkver } from './checkver';
// export const isDev = process.env.NODE_ENV !== 'production';
export const isDev = is.dev();
export const isMac = is.macOS();
export const isWin = is.windows();
export const isLinux = is.linux();

export const delay = n => new Promise(resolve => setTimeout(resolve, n));

// const DINGDING_TOKEN = 'be77cc501c1d5a466f91690266495a28b1a0e0cb654cc578cfd5a00dbd1b7850';

// test token
const DINGDING_TOKEN = '399b920a41af24d5c4d0e12f302a496a37e816bf7eaad10aa59fb93f8330cc78';

export const FEEDBACK_URL = `https://oapi.dingtalk.com/robot/send?access_token=${DINGDING_TOKEN}`



