function isSupported() {
  try {
    const testKey = "__key__";
    window.sessionStorage.setItem(testKey, testKey);
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

function Store () {
  this.store = {};

  this.getItem = (key) => {
    return this.store[key]
  }

  this.setItem = (key, value) => {
    this.store[key] = value
  }
}

export const storage = isSupported ? window.sessionStorage : new Store()
