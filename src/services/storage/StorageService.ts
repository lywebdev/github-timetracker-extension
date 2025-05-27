type StorageKey = string;

type StorageValue = string | number | boolean | object | null;

interface StorageResult {
  [key: StorageKey]: StorageValue;
}

class StorageService {
  async get<T extends StorageValue>(key: StorageKey): Promise<T | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (data: StorageResult) => {
        resolve(data[key] as T || null);
      });
    });
  }

  async set<T extends StorageValue>(key: StorageKey, value: T): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  async remove(key: StorageKey): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, resolve);
    });
  }

  async getMultiple<T extends StorageValue>(keys: StorageKey[]): Promise<StorageResult> {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (data: StorageResult) => {
        const result: StorageResult = {};
        for (const key of keys) {
          result[key] = data[key] || null;
        }
        resolve(result);
      });
    });
  }

  async removeMultiple(keys: StorageKey[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, resolve);
    });
  }
}

export const storageService = new StorageService();