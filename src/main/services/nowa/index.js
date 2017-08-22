/*
	nowa 组件初始化
*/
import mkdirp from 'mkdirp';
import { isWin } from 'shared-nowa';
import Nowa from './nowa';
import { existsNowa, writeNowaVer, writeNowaPackageJSON, existsNowaPackageJSON } from './utils';
import { NOWA_INSTALL_DIR } from '../paths';

// 全局安装目录下不存在nowa配置文件，则生成
try {
  if (!existsNowa()) {
    mkdirp.sync(NOWA_INSTALL_DIR);
    writeNowaVer({});
  }
  if (!existsNowaPackageJSON()) {
    writeNowaPackageJSON({
      name: "nowa-install-path",
      description: "where nowa-gui place nowa-cli files",
      repository: {},
      license: "MIT"
    });
  }
} catch (e) {
  console.log(e);
}

// 想要全局安装的nowa依赖
const iwant = ['nowa', 'nowa-init', 'nowa-server', 'nowa-build', 'nowa-lib', 'nowa-dep'];

const nowa = new Nowa(iwant);

export default nowa;
