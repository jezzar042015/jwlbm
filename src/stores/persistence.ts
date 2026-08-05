import Dexie from "dexie";

const STORAGE_PREFIX = "jw-library-backup-viewer";
const DB_NAME = `${STORAGE_PREFIX}-db`;
const STORE_NAME = "persisted-state";

interface PersistedEntry {
    key: string;
    value: string;
}

const persistenceCache = new Map<string, unknown>();
let databaseInstance: Dexie | null = null;

function getStorageKey(key: string) {
    return `${STORAGE_PREFIX}:${key}`;
}

export function getCachedPersistedState<T>(key: string): T | undefined {
    const storageKey = getStorageKey(key);
    const cachedValue = persistenceCache.get(storageKey);

    if (cachedValue === undefined) {
        return undefined;
    }

    return cachedValue as T;
}

export function clearPersistedStateCache() {
    persistenceCache.clear();
}

async function openDatabase(): Promise<Dexie | null> {
    if (typeof window === "undefined") {
        return null;
    }

    if (!databaseInstance) {
        const database = new Dexie(DB_NAME);
        database.version(1).stores({
            [STORE_NAME]: "&key",
        });
        databaseInstance = database;
    }

    try {
        await databaseInstance.open();
        return databaseInstance;
    } catch {
        return null;
    }
}

async function readFromIndexedDb<T>(storageKey: string): Promise<T | null> {
    const database = await openDatabase();

    if (!database) {
        return null;
    }

    try {
        const entry = await database.table<PersistedEntry>(STORE_NAME).get(storageKey);
        if (!entry?.value) {
            return null;
        }

        const parsedValue = JSON.parse(entry.value) as T;
        persistenceCache.set(storageKey, parsedValue);
        return parsedValue;
    } catch {
        return null;
    }
}

export async function readPersistedState<T>(key: string): Promise<T | null> {
    if (typeof window === "undefined") {
        return null;
    }

    const storageKey = getStorageKey(key);
    const cachedValue = persistenceCache.get(storageKey);

    if (cachedValue !== undefined) {
        return cachedValue as T | null;
    }

    return readFromIndexedDb<T>(storageKey);
}

export async function writePersistedState<T>(key: string, value: T) {
    if (typeof window === "undefined") {
        return;
    }

    const storageKey = getStorageKey(key);
    persistenceCache.set(storageKey, value);

    const database = await openDatabase();

    if (!database) {
        return;
    }

    try {
        await database.table<PersistedEntry>(STORE_NAME).put({
            key: storageKey,
            value: JSON.stringify(value),
        });
    } catch {
        // Ignore persistence errors so imports can still work in restricted environments.
    }
}
