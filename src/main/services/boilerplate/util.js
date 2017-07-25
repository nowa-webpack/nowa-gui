import { lt } from 'semver';
import load from 'download';

import { join, dirname } from 'path';
import { existsSync, removeSync, copySync } from 'fs-extra';

import { request } from 'shared-nowa';
import { TEMPLATES_DIR } from '../paths';
import mainWin from '../windowManager';
import log from '../applog';

export const download = (url, folder) => load(url, folder,
  {
    extract: true,
    retries: 0,
    timeout: 15000
  });


export const getTemplate = async function ({ registry, tempName, type, typeData }) {
  const { data: pkg, err } = await request(`${registry}/${tempName}`);
  try {
    if (err) throw err;

    const distTags = pkg['dist-tags'];
    const tags = Object.keys(distTags).filter(tag => tag !== 'latest');
    const defaultTag = tags[tags.length - 1];
    const { description } = pkg.versions[distTags[defaultTag]];
    const homepage = pkg.repository.url || '';
    const obj = {
      name: tempName,
      defaultTag,
      description,
      homepage: homepage.slice(4, homepage.length - 4),
      type: type.toUpperCase(),
      loading: false,
    };

    obj.tags = tags.map((tag) => {
      const name = `${tempName}-${tag}`;
      const tempPath = join(TEMPLATES_DIR, name);
      const version = distTags[tag];
      const o = {
        name: tag,
        path: tempPath,
        update: false,
        downloaded: false,
        remote: pkg.versions[version].dist.tarball
      };
      // 这个模板未被下载
      if (!existsSync(tempPath)) {
        o.version = version;
      } else {
        o.downloaded = true;
        const manifestItem = typeData.filter(n => n.name === tempName)[0];
        o.version = version;

        if (manifestItem) {
          const oldVersion = manifestItem.tags.filter(n => n.name === tag)[0].version;
          o.version = oldVersion;
          o.update = lt(oldVersion, version);
        }
      }

      return o;
    });
    return obj;
  } catch (e) {
    log.error(e);
    mainWin.send('main-err', e);
    if (typeData && typeData.length > 0) {
      return typeData.filter(n => n.name === tempName)[0];
    }
    return null;
  }
};