import { StorageService } from '../../../src/services/storage/StorageService';
import * as chrome from 'sinon-chrome';

describe('StorageService with sinon-chrome', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
  });

  afterEach(() => {
    chrome.flush();
  })

  describe('get', () => {
    it('should return value for existing key', async () => {
      chrome.storage.local.get.yields({ testKey: 'testValue' });
      const result = await storageService.get<string>('testKey');
      expect(chrome.storage.local.get.calledWith('testKey')).toBe(true);
      expect(result).toBe('testValue');
    });

    it('should return null for non-existing key', async () => {
      chrome.storage.local.get.yields({});
      const result = await storageService.get<string>('nonExistentKey');
      expect(chrome.storage.local.get.calledWith('nonExistentKey')).toBe(true);
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value for a key', async () => {
      chrome.storage.local.set.yields();
      await storageService.set<number>('testKey', 123);
      expect(chrome.storage.local.set.calledWith({ testKey: 123 })).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove a key', async () => {
      chrome.storage.local.remove.yields();
      await storageService.remove('testKey');
      expect(chrome.storage.local.remove.calledWith('testKey')).toBe(true);
    });
  });

  describe('getMultiple', () => {
    it('should return values for multiple keys', async () => {
      chrome.storage.local.get.yields({ key1: 'value1', key2: 'value2' });
      const result = await storageService.getMultiple<string>(['key1', 'key2']);
      expect(chrome.storage.local.get.calledWith(['key1', 'key2'])).toBe(true);
      expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should return null for non-existing keys', async () => {
      chrome.storage.local.get.yields({ key1: 'value1' });
      const result = await storageService.getMultiple<string>(['key1', 'key2']);
      expect(chrome.storage.local.get.calledWith(['key1', 'key2'])).toBe(true);
      expect(result).toEqual({ key1: 'value1', key2: null });
    });
  });

  describe('removeMultiple', () => {
    it('should remove multiple keys', async () => {
      chrome.storage.local.remove.yields();
      await storageService.removeMultiple(['key1', 'key2']);
      expect(chrome.storage.local.remove.calledWith(['key1', 'key2'])).toBe(true);
    });
  });
});