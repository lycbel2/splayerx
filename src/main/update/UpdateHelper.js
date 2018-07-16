const Promise = require('bluebird');
const storage = require('electron-json-storage');
Promise.promisifyAll(storage);
const defultStorageSetting = { autoCheck: true, askDownload: false, askQuitInstall: true };
function isUndefined(object) {
  return typeof object !== 'undefined';
}

export default class UpdateStorageHelper {
  constructor(updaterStrategyString) {
    this.uss = updaterStrategyString;
    console.log(this.uss);
    this.strategy = null;
    // in format {'autoCheck':bool,'askDownload':bool,'askQuitInstall':bool} default true,false,true
    this.updateStrategy = null;
  }
  get getAutoCheck() {
    return this.updateStrategy.autoCheck;
  }
  get getAskDownload() {
    return this.updateStrategy.askDownload;
  }
  get getAskQuitInstall() {
    return this.updateStrategy.askQuitInstall;
  }

  set setAutoCheck(bool) {
    this.updateStrategy.autoCheck = bool;
  }
  set setAskDownload(bool) {
    this.updateStrategy.askDownload = bool;
  }
  set setAskQuitInstall(bool) {
    this.updateStrategy.askQuitInstall = bool;
  }

  getStrategyStorage() {
    const backOb = this;
    return new Promise((resolve, reject) => {
      storage.get(this.uss, (err, data) => {
        if (err) {
          const logMessage = `Download speed: ${this.uss}`;
          console.log(logMessage);
          // todo when err maybe need a temp setting
          reject(err);
        } else if (isUndefined(data) || data == null) {
          backOb.updateStrategy = defultStorageSetting;
          resolve();
        } else {
          backOb.updateStrategy = UpdateStorageHelper.getStrategyFromString(data);
          resolve();
        }
      });
    });
  }

  static getStrategyFromString(strategyString) {
    return JSON.parse(strategyString);
  }
  setStrategyStorage() {
    return storage.setAsync(this.uss, JSON.stringify(this.updateStrategy));
  }
}

