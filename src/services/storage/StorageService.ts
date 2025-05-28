// services/github/StorageService.ts
import { IStorageService } from "../github/interfaces";

type StorageValue = string | number | boolean | object | null;

export class StorageService implements IStorageService {
  async get<T extends StorageValue>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (data: Record<string, T>) => {
        resolve(data[key] ?? null);
      });
    });
  }

  async set<T extends StorageValue>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  async remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, resolve);
    });
  }

  async getMultiple<T extends StorageValue>(keys: string[]): Promise<Record<string, T | null>> {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (data: Record<string, T>) => {
        const result: Record<string, T | null> = {};
        for (const key of keys) {
          result[key] = data[key] ?? null;
        }
        resolve(result);
      });
    });
  }

  async removeMultiple(keys: string[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, resolve);
    });
  }
}