const Promise = require('bluebird');
const { CancellationToken } = require('electron-builder-http');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const autoUpdateString = 'autoUpdatString_random_olapxsdf#@%';
// const { ipcMain } = require('electron');
const { UpdateStorageHelper } = require('../../../../../../learn/electron-updater-example/UpdateHelper.js');
const updateStorageHelper = new UpdateStorageHelper(autoUpdateString);
function setAutoUpdater() {
  autoUpdater.autoDownload = true; // when the update is available, it will download automatically
  // if user does not install downloaded app, it will auto install when quit the app
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowDowngrade = false;
}
const UpdaterFactory = (function () {
  let instance = null;
  class Updater {
    constructor(window, app) {
      this.menuallyStarted = false;
      this.cancellationToken = new CancellationToken();
      this.hasUpdate = null;
      // check if auto updater module available
      if (!autoUpdater) {
        return null;
      }
      this.win = window;
      this.app = app;
    }
    // it should be called when the app starts
    onStart() {
      return new Promise((resolve) => {
        setAutoUpdater();
        updateStorageHelper.getStrategyStorage().then(() => {
          if (updateStorageHelper.getAutoCheck) {
            resolve(this.startUpdateCheck());
          } else {
            resolve();
          }
        });
      });
    }
    // it should be called when the app closes will return a promise
    onClose() {
      this.close = true;
      return updateStorageHelper.setStrategyStorage();
    }
    // it should be called when user check update manually
    startUpdateManually() {
      const backObj = this;
      return new Promise((resolve) => {
        backObj.menuallyStarted = true;
        resolve(this.startUpdateCheck());
      });
    }
    // todo for now no such concern
    cancelUpdate() {
      return autoUpdater.downloadUpdate(this.cancellationToken); // return promise
    }

    startUpdateCheck() {
      const backObj = this;
      autoUpdater.logger = log;
      autoUpdater.logger.transports.file.level = 'info';
      this.registerMessageHandlerForUpdater(backObj);
      this.registerMessageHandlerForIPCMain(backObj);
      return autoUpdater.checkForUpdates();
    }

    sendStatusToWindow(text) {
      this.win.webContents.send('update-message', text);
    }
    registerMessageHandlerForUpdater(backObj) {
      autoUpdater.on('checking-for-update', () => {
        this.sendStatusToWindow('Checking for update...');
      });
      autoUpdater.on('update-available', (info) => {
        if (backObj.isUpdateProper(info)) {
          backObj.hasUpdate = true;
          this.sendStatusToWindow(`${JSON.stringify(info)}Update available.`);
        } else {
          backObj.hasUpdate = false;
        }
      });
      autoUpdater.on('update-not-available', () => {
        backObj.hasUpdate = false;
        this.sendStatusToWindow('Update not available.');
      });
      autoUpdater.on('error', (err) => {
        this.sendStatusToWindow(`Error in auto-updater. ${err}`);
      });
      autoUpdater.on('download-progress', (progressObj) => {
        let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
        logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
        logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
        this.sendStatusToWindow(logMessage);
      });
      autoUpdater.on('update-downloaded', () => {
        this.sendStatusToWindow('Update downloaded');
        autoUpdater.quitAndInstall(true, true);
      });
    }


    // registerMessageHandlerForIPCMain(backObj) {
    //   ipcMain.on('cancel-update', (event, arg) => {
    //
    //   });
    //   ipcMain.on('update-setting', (event, arg) => { // arg {'':bool,'':bool....}
    //
    //   });
    //   ipcMain.on('quit-install-now', (event, arg) => { // arg true/false
    //
    //   });
    // }
    // isUpdateProper(updateInfo) {
    //   // todo
    // }
    set setWindow(win) {
      this.win = win;
    }
    get getWindow() {
      return this.win;
    }
  }

  return {
    getInstance(win, app) {
      if (instance) {
        if (win && app) {
          instance.app = app;
          instance.win = win;
        }
        return instance;
      }
      instance = new Updater(win, app);
      return instance;
    },
  };
}());
exports.Updater = UpdaterFactory;

