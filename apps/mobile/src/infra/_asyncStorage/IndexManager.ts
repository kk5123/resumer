import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageHelpers } from './helpers';

export class IndexManager {
  constructor(
    private indexKeyPrefix: string,
    private entityKeyPrefix: string
  ) {}

  private indexKey(suffix: string = ''): string {
    return suffix ? `${this.indexKeyPrefix}:${suffix}` : this.indexKeyPrefix;
  }

  private entityKey(id: string): string {
    return `${this.entityKeyPrefix}:${id}`;
  }

  async loadIndex(suffix: string = ''): Promise<string[]> {
    return AsyncStorageHelpers.loadArray<string>(this.indexKey(suffix));
  }

  async saveIndex(ids: string[], suffix: string = ''): Promise<void> {
    await AsyncStorageHelpers.saveArray(this.indexKey(suffix), ids);
  }

  async addToIndex(id: string, suffix: string = ''): Promise<void> {
    const index = await this.loadIndex(suffix);
    if (!index.includes(id)) {
      index.push(id);
      await this.saveIndex(index, suffix);
    }
  }

  async loadEntity<T>(id: string): Promise<T | null> {
    return AsyncStorageHelpers.loadObject<T>(this.entityKey(id));
  }

  async saveEntity<T>(id: string, entity: T): Promise<void> {
    await AsyncStorageHelpers.saveObject(this.entityKey(id), entity);
  }

  async deleteEntity(id: string): Promise<void> {
    await AsyncStorage.removeItem(this.entityKey(id));
  }
}
