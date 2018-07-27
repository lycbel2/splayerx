import { app } from 'electron' // eslint-disable-line
import fs from 'fs-extra';
// import localStorage from './localStorage.js';
const appBase = `${app.getAppPath()}/`;
const basePath = `${app.getAppPath()}/.fileStorageSS/`;

// if there is / on start or end remove them
function modifyPath(path) {
  if (!path) {
    return basePath;
  }
  if (path.indexOf('/') === 0) {
    path = path.substring(1);
  }
  if (path.slice(-1) === '/') {
    path = path.substring(0, path.length - 1);
  }
  return path;
}


function CDOneStepRe(base, nextFolders) {
  return new Promise((resolve, reject) => {
    if (nextFolders.length === 0) {
      resolve(true);
    } else {
      base = `${base}${nextFolders.shift()}/`;
      fs.exists(base).then((back) => {
        if (!back) {
          fs.mkdir(base).then(() => {
            resolve(CDOneStepRe(base, nextFolders));
          }).catch((err) => {
            reject(err);
            console.log('rejected');
          });
        } else {
          resolve(CDOneStepRe(base, nextFolders));
        }
      });
    }
  });
}

/*
   *the root path will be base path
   * here will start from appBasePath as at start there will be no .fileStorageSS folder
    */
function mkdirByPath(path) {
  return new Promise((resolve, reject) => {
    const folderChain = modifyPath(path).split('/');
    folderChain.unshift('.fileStorageSS');
    CDOneStepRe(appBase, folderChain).then(() => { resolve(); }).catch((err) => {
      reject(err);
    });
  });
}


function absolutePath(path) {
  return `${basePath}${modifyPath(path)}`;
}

/*
 * this fileDb can only work in the folder /.fileStorageSS app installed directory
 */
export default class fileHelper {
  static fetchAllFilesUnderPath(folderPath) {
    return new Promise((resolve) => {
      fs.readdir(absolutePath(folderPath)).then((data) => {
        data.shift();
        resolve(data);
      });
    });
  }
  static storeFileUnderPath(folderPath, fileName, data) {
    return new Promise((resolve, reject) => {
      const absoluteFilePath = absolutePath(folderPath);
      fs.exists(absoluteFilePath).then((back) => {
        if (!back) {
          mkdirByPath(folderPath).then(() => {
            fs.writeFile(`${absoluteFilePath}/${fileName}`, data);
          }).catch((err) => {
            console.log('rejected2');
            reject(err);
          });
        } else {
          resolve(fs.writeFile(`${absoluteFilePath}/${fileName}`, data));
        }
      });
    });
  }
  static readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(`${absolutePath(filePath)}`, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
  static removeFile(filePath) {
    return new Promise((resolve, reject) => {
      // for now the fs promised won't reject
      fs.unlink(absolutePath(filePath)).then((back) => {
        if (back) {
          reject(back);
        }
        resolve(true);
      }).catch((err) => { reject(err); });
    });
  }
}
