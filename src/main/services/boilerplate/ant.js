/*
  蚂蚁模板
*/
import { lt } from 'semver';
import { join, dirname } from 'path';
import mkdirp from 'mkdirp';
import { existsSync, removeSync, copySync, renameSync } from 'fs-extra';

import config from 'config-main-nowa';
import { request, delay } from 'shared-nowa';
import log from '../applog';
import { download } from './util';
import mainWin from '../windowManager';
import { TEMPLATES_DIR } from '../paths';
import { getMainifest, setMainifest } from './manifest';

/*
  ant 模板形式
  {
    "name": "@ant/Da",
    "description": "这原本是我的毕业设计，做一个后台管理系统，一定程度上解决了某些问题，所以把他拿出来分享给大家。本系统使用基于Dva脚手架和antd框架，我只做了一些优化，大家可以参考下我的文件结构和开发方法。",
    "homepage": "https://github.com/liumin1128/CourseManagementSystem",
    "remote": "https://github.com/liumin1128/CourseManagementSystem/archive/master.zip",
    "type": "ANT",
    "loading": false,
    "downloaded": false,
    "path": "C:\\Users\\wb-xyl259837\\.nowa-gui\\template\\@ant\\Da"
  }
*/

// 获取模板列表，不下载
const get = async function () {
  console.log(`get ant boilerplate`);
  const manifest = getMainifest();
  const getTemplate = async function ({ name, git_url, description }) {
    const homepage = git_url.replace('git:', 'https:').slice(0, -4);
    const remote = homepage.concat('/archive/master.zip');
    const tempName = `@ant/${name}`;
    try {
      const target = join(TEMPLATES_DIR, tempName)
      const obj = {
        name: tempName,
        description,
        homepage,
        remote,
        type: 'ANT',
        loading: false,
        downloaded: existsSync(target),
        path: target,
      };

      //   download(remote, obj.path)
      //     .then((files) => {
      //       const dir = dirname(files[1].path);
      //       copySync(join(obj.path, dir), join(obj.path, 'proj'));
      //       removeSync(join(obj.path, dir));
      //     });

      // downloadRemoteTemplate(remote, obj.path);

      return obj;

    } catch (e) {
      log.error(e);
      mainWin.send('main-err', e);
      if (manifest.ant && manifest.ant.length > 0) {
        return manifest.ant.filter(n => n.name === tempName)[0];
      }
      return null;
    }
  };

  const url = 'http://scaffold.ant.design/list.json';

  const { data, err } = await request(url);

  if (!err) {
    const boilerplate = await Promise.all(data.list.map(getTemplate));
    // manifest.ant = boilerplate.filter(n => !!n);
    const antData = boilerplate.filter(n => !!n);

    // 把模板列表信息写入到模板文件
    setMainifest('ant', antData);

    return antData;
  }
  log.error(err);
  mainWin.send('main-err', err);
  return manifest.ant || [];
};

// 加载模板
const load = async function ({ ...item }) {
  const { remote, path, name } = item;
  try {
    console.log(`load ant boilerplate`);
    const files = await download(remote, path);
    const dir = dirname(files[1].path);

    renameSync(join(path, dir), join(path, 'proj'));
    const manifest = getMainifest();
    // 标记该模板已经被下载
    item.downloaded = true;
    item.loading = false;
    manifest.ant = manifest.ant.map(n => n.name === name ? item : n);
    setMainifest('ant', manifest.ant);
    return { err: false, data: manifest.ant };
  } catch (err) {
    const manifest = getMainifest();
    log.error(err);
    mainWin.send('main-err', err);
    return { err: true, data: manifest.ant };
  }
};



export default { get, load };
