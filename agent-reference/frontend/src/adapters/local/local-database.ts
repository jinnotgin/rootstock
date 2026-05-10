type Collection = 'session' | 'users' | 'teams' | 'discussions' | 'comments';

export type DatabaseShape = Record<Collection, any[]>;

const emptyDatabase = (): DatabaseShape => ({
  session: [],
  users: [],
  teams: [],
  discussions: [],
  comments: [],
});

export class LocalDatabase {
  private readonly databaseName = 'rootstock-local-db';
  private readonly storeName = 'records';
  private readonly fallbackKey = 'rootstock-local-db';

  constructor(private readonly initialData: DatabaseShape = emptyDatabase()) {}

  async read(): Promise<DatabaseShape> {
    const raw = await this.getRaw();
    if (!raw) return { ...emptyDatabase(), ...this.initialData };
    return { ...emptyDatabase(), ...JSON.parse(raw) };
  }

  async write(data: DatabaseShape): Promise<void> {
    await this.setRaw(JSON.stringify(data));
  }

  async collection<T>(collection: Collection): Promise<T[]> {
    const data = await this.read();
    return data[collection] as T[];
  }

  async replaceCollection<T>(
    collection: Collection,
    values: T[],
  ): Promise<void> {
    const data = await this.read();
    data[collection] = values;
    await this.write(data);
  }

  private async getRaw(): Promise<string | null> {
    if (typeof window.indexedDB === 'undefined') {
      return window.localStorage.getItem(this.fallbackKey);
    }
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const request = transaction.objectStore(this.storeName).get('database');
      request.onsuccess = () => resolve((request.result as string) ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  private async setRaw(value: string): Promise<void> {
    if (typeof window.indexedDB === 'undefined') {
      window.localStorage.setItem(this.fallbackKey, value);
      return;
    }
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const request = transaction
        .objectStore(this.storeName)
        .put(value, 'database');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.databaseName, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(this.storeName);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
