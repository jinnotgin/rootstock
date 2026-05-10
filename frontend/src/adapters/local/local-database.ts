type StoreName = 'session' | 'users' | 'models' | 'api-keys' | 'usage' | 'settings';

export type DatabaseShape = Record<StoreName, any[]>;

const STORE_NAMES: StoreName[] = ['session', 'users', 'models', 'api-keys', 'usage', 'settings'];

const STORE_CONFIG: Record<StoreName, { keyPath: string; indexes?: { name: string; keyPath: string }[] }> = {
	session: { keyPath: 'userId' },
	users: { keyPath: 'id' },
	models: { keyPath: 'id' },
	'api-keys': { keyPath: 'userId', indexes: [{ name: 'by-bifrostKeyId', keyPath: 'bifrostKeyId' }] },
	usage: { keyPath: 'userId', indexes: [{ name: 'by-week', keyPath: 'weekStart' }] },
	settings: { keyPath: 'key' },
};

const emptyDatabase = (): DatabaseShape => ({
	session: [],
	users: [],
	models: [],
	'api-keys': [],
	usage: [],
	settings: [],
});

export class LocalDatabase {
	private readonly databaseName = 'api-gateway-local-db';
	private readonly fallbackPrefix = 'api-gateway-local-db';
	private readonly dbVersion = 1;
	private dbPromise: Promise<IDBDatabase> | null = null;
	private seedPromise: Promise<void> | null = null;

	constructor(private readonly initialData: DatabaseShape = emptyDatabase()) {}

	async getAll<T>(store: StoreName): Promise<T[]> {
		await this.ensureSeeded();
		if (!this.hasIndexedDB()) return this.fallbackGetAll<T>(store);
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(store, 'readonly');
			const request = tx.objectStore(store).getAll();
			request.onsuccess = () => resolve(request.result as T[]);
			request.onerror = () => reject(request.error);
		});
	}

	async get<T>(store: StoreName, key: string): Promise<T | undefined> {
		await this.ensureSeeded();
		if (!this.hasIndexedDB()) {
			const all = this.fallbackGetAll<any>(store);
			const keyPath = STORE_CONFIG[store].keyPath;
			return all.find((item: any) => item[keyPath] === key) as T | undefined;
		}
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(store, 'readonly');
			const request = tx.objectStore(store).get(key);
			request.onsuccess = () => resolve(request.result as T | undefined);
			request.onerror = () => reject(request.error);
		});
	}

	async getAllByIndex<T>(store: StoreName, indexName: string, value: IDBValidKey): Promise<T[]> {
		await this.ensureSeeded();
		if (!this.hasIndexedDB()) {
			const all = this.fallbackGetAll<any>(store);
			const idx = STORE_CONFIG[store].indexes?.find((i) => i.name === indexName);
			if (!idx) return [];
			return all.filter((item: any) => item[idx.keyPath] === value) as T[];
		}
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(store, 'readonly');
			const index = tx.objectStore(store).index(indexName);
			const request = index.getAll(value);
			request.onsuccess = () => resolve(request.result as T[]);
			request.onerror = () => reject(request.error);
		});
	}

	async put<T>(store: StoreName, record: T): Promise<void> {
		await this.ensureSeeded();
		if (!this.hasIndexedDB()) {
			this.fallbackPut(store, record);
			return;
		}
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(store, 'readwrite');
			const request = tx.objectStore(store).put(record);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async delete(store: StoreName, key: string): Promise<void> {
		await this.ensureSeeded();
		if (!this.hasIndexedDB()) {
			this.fallbackDelete(store, key);
			return;
		}
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(store, 'readwrite');
			const request = tx.objectStore(store).delete(key);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async clear(store: StoreName): Promise<void> {
		await this.ensureSeeded();
		if (!this.hasIndexedDB()) {
			localStorage.removeItem(`${this.fallbackPrefix}:${store}`);
			return;
		}
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const tx = db.transaction(store, 'readwrite');
			const request = tx.objectStore(store).clear();
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	private hasIndexedDB(): boolean {
		return typeof window.indexedDB !== 'undefined';
	}

	private async ensureSeeded(): Promise<void> {
		if (!this.seedPromise) {
			this.seedPromise = this.doSeed().catch((err) => {
				this.seedPromise = null;
				throw err;
			});
		}
		return this.seedPromise;
	}

	private async doSeed(): Promise<void> {
		if (!this.hasIndexedDB()) {
			const hasData = STORE_NAMES.some((name) => {
				const raw = localStorage.getItem(`${this.fallbackPrefix}:${name}`);
				return raw && JSON.parse(raw).length > 0;
			});
			if (hasData) return;
			for (const name of STORE_NAMES) {
				if (this.initialData[name].length > 0) {
					localStorage.setItem(`${this.fallbackPrefix}:${name}`, JSON.stringify(this.initialData[name]));
				}
			}
			return;
		}

		const db = await this.open();

		const count = await new Promise<number>((resolve, reject) => {
			const tx = db.transaction('users', 'readonly');
			const request = tx.objectStore('users').count();
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});

		if (count > 0) return;

		const hasInitialData = STORE_NAMES.some((name) => this.initialData[name].length > 0);
		if (!hasInitialData) return;

		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(STORE_NAMES, 'readwrite');
			for (const name of STORE_NAMES) {
				const store = tx.objectStore(name);
				for (const record of this.initialData[name]) {
					store.put(record);
				}
			}
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	}

	private open(): Promise<IDBDatabase> {
		if (!this.dbPromise) {
			this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
				const request = window.indexedDB.open(this.databaseName, this.dbVersion);
				request.onupgradeneeded = () => {
					const db = request.result;
					for (const [name, config] of Object.entries(STORE_CONFIG)) {
						if (!db.objectStoreNames.contains(name)) {
							const store = db.createObjectStore(name, { keyPath: config.keyPath });
							for (const idx of config.indexes ?? []) {
								store.createIndex(idx.name, idx.keyPath);
							}
						}
					}
				};
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => {
					this.dbPromise = null;
					reject(request.error);
				};
			});
		}
		return this.dbPromise;
	}

	private fallbackGetAll<T>(store: StoreName): T[] {
		const raw = localStorage.getItem(`${this.fallbackPrefix}:${store}`);
		return raw ? JSON.parse(raw) : [];
	}

	private fallbackPut<T>(store: StoreName, record: T): void {
		const all = this.fallbackGetAll<any>(store);
		const keyPath = STORE_CONFIG[store].keyPath;
		const key = (record as any)[keyPath];
		const index = all.findIndex((item: any) => item[keyPath] === key);
		if (index >= 0) {
			all[index] = record;
		} else {
			all.push(record);
		}
		localStorage.setItem(`${this.fallbackPrefix}:${store}`, JSON.stringify(all));
	}

	private fallbackDelete(store: StoreName, key: string): void {
		const all = this.fallbackGetAll<any>(store);
		const keyPath = STORE_CONFIG[store].keyPath;
		const filtered = all.filter((item: any) => item[keyPath] !== key);
		localStorage.setItem(`${this.fallbackPrefix}:${store}`, JSON.stringify(filtered));
	}
}

export const createId = () => {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const currentWeekStart = (): string => {
	const now = new Date();
	const day = now.getUTCDay();
	const diff = (day === 0 ? -6 : 1) - day;
	const monday = new Date(now);
	monday.setUTCDate(now.getUTCDate() + diff);
	monday.setUTCHours(0, 0, 0, 0);
	return monday.toISOString().split('T')[0];
};
