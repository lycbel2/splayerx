import storage from 'vue-electron-json-storage';


export default class localStorage {
  constructor() {
    this.storage = storage;
  }
  get(name) {
    return new Promise((resolve, reject) => {
      this.storage.get(name, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
  set(name, input) {
    return new Promise(((resolve, reject) => {
      this.storage.set(name, input, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve('success');
        }
      });
    }));
  }
}
