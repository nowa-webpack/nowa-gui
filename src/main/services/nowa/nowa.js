import commands from '../commands';
import mainWin from '../windowManager';
import { getInstallOpt, getLocalPkg, checkNpmVer, saveNewPkg, nowaDiff } from './utils';


class Nowa {
  constructor(iwant) {
    this.iwant = iwant;
    this.needInstallPkgs = [];
    this.pkgSize = 0;
  }

  // 判断需要安装或更新的组件
  async checkNeedInstallPkgs() {
    const installedPkgs = getLocalPkg();
    if (installedPkgs.length > 0) {
      const localNeedUpdatePkgs = await checkNpmVer(installedPkgs);
      const set = new Set(this.iwant);

      installedPkgs.forEach(({ name }) => {
        if (set.has(name)) set.delete(name);
      });
      this.needInstallPkgs = [...set, ...localNeedUpdatePkgs];
    } else {
      this.needInstallPkgs = [...this.iwant, 'npm'];
      // this.needInstallPkgs = this.iwant;
    }
    this.pkgSize = this.needInstallPkgs.length;
    console.log('needInstallPkgs', this.needInstallPkgs, this.pkgSize);
  }

  // 判断本地是否安装了所有的 nowa 组件
  hasInstalledPkgs() {
    const installedPkgs = getLocalPkg();

    return installedPkgs.length === this.iwant.length;
  }

  // 安装组件
  async installNowaPkgs() {
    if (this.pkgSize > 0) {
      const pkgs = this.needInstallPkgs.map(name => ({ name, version: 'latest' }));
      const installOpt = getInstallOpt(pkgs);
      // installOpt.noSave = true;

      const { err } = await commands.installPkgsWithLog({
        opt: installOpt,
        sender: 'nowa-install'
      });
      // const { err } = await commands.noLoggingInstall(installOpt);

      if (!err) {
        // 安装结束后保存新版本
        saveNewPkg(this.needInstallPkgs.filter(name => name !== 'npm'));
        // saveNewPkg(this.needInstallPkgs);
        console.log('saveNewNowaJSON');
        // mainWin.send('nowa-install-finished');
      } 
      // else {
      //   mainWin.send('nowa-install-failed', err);
      // }
    }
  }

  // 判断是否需要更新
  needInstall() {
    return this.pkgSize > 0;
  }

  // 判断命令行版本是否低于gui的nowa版本号
  checkNowaCliVer() {
    return nowaDiff();
  }
}

export default Nowa;
