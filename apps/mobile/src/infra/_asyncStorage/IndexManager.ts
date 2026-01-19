// infra/common/IndexedRepository.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageHelpers } from './helpers';

export class IndexManager {
  constructor(
    private indexKey: string,
    private entityKeyPrefix: string
  ) {}
  
  async loadIndex(): Promise<string[]> {
    return AsyncStorageHelpers.loadArray<string>(this.indexKey);
  }
  
  async saveIndex(ids: string[]): Promise<void> {
    await AsyncStorageHelpers.saveArray(this.indexKey, ids);
  }
  
  async addToIndex(id: string): Promise<void> {
    const index = await this.loadIndex();
    if (!index.includes(id)) {
      index.push(id);
      await this.saveIndex(index);
    }
  }
  
  getEntityKey(id: string): string {
    return `${this.entityKeyPrefix}:${id}`;
  }
  
  async loadEntity<T>(id: string): Promise<T | null> {
    return AsyncStorageHelpers.loadObject<T>(this.getEntityKey(id));
  }
  
  async saveEntity<T>(id: string, entity: T): Promise<void> {
    await AsyncStorageHelpers.saveObject(this.getEntityKey(id), entity);
  }
  
  async deleteEntity(id: string): Promise<void> {
    const key = this.getEntityKey(id);
    await AsyncStorage.removeItem(key);
  }
}
