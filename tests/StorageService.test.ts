import {StorageService} from "../src/services/storage/StorageService";

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
    jest.clearAllMocks(); // Очищаем вызовы моков перед каждым тестом
  });

  describe('get', () => {
    it('should return value for existing key', async () => {
      const key = 'testKey';
      const value = 'testValue';
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ [key]: value });
      });

      const result = await storageService.get<string>(key);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(key, expect.any(Function));
      expect(result).toBe(value);
    });

    it('should return null for non-existing key', async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const result = await storageService.get<string>('nonExistentKey');
      expect(chrome.storage.local.get).toHaveBeenCalledWith('nonExistentKey', expect.any(Function));
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value for a key', async () => {
      const key = 'testKey';
      const value = 123;
      chrome.storage.local.set.mockImplementation((data, callback) => {
        callback();
      });

      await storageService.set<number>(key, value);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ [key]: value }, expect.any(Function));
    });
  });

  describe('remove', () => {
    it('should remove a key', async () => {
      const key = 'testKey';
      chrome.storage.local.remove.mockImplementation((keys, callback) => {
        callback();
      });

      await storageService.remove(key);
      expect(chrome.storage.local.remove).toHaveBeenCalledWith(key, expect.any(Function));
    });
  });

  describe('getMultiple', () => {
    it('should return values for multiple keys', async () => {
      const keys = ['key1', 'key2'];
      const values = { key1: 'value1', key2: 'value2' };
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(values);
      });

      const result = await storageService.getMultiple<string>(keys);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(keys, expect.any(Function));
      expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should return null for non-existing keys', async () => {
      const keys = ['key1', 'key2'];
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ key1: 'value1' });
      });

      const result = await storageService.getMultiple<string>(keys);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(keys, expect.any(Function));
      expect(result).toEqual({ key1: 'value1', key2: null });
    });
  });

  describe('removeMultiple', () => {
    it('should remove multiple keys', async () => {
      const keys = ['key1', 'key2'];
      chrome.storage.local.remove.mockImplementation((keys, callback) => {
        callback();
      });

      await storageService.removeMultiple(keys);
      expect(chrome.storage.local.remove).toHaveBeenCalledWith(keys, expect.any(Function));
    });
  });
});