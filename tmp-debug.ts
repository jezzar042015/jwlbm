import { createPinia, setActivePinia } from 'pinia';
import './src/testSetup';
import { useDatabaseStore } from './src/stores/database';
import { useNotesStore } from './src/stores/notes';
import { readPersistedState } from './src/stores/persistence';

setActivePinia(createPinia());

const dbStore = useDatabaseStore();
const notesStore = useNotesStore();

const dbService = { manifest: {} } as any;
dbStore.addDatabase({ id: 'db-1', isMaster: true, importedAt: new Date(), name: 'Backup 1', db: dbService });
notesStore.notes.push({ db_id: 'db-1', notes: [], notesWithTagMaps: [{ note: [1, 'guid', null, null, 'Title', 'Body', '', '', 0, null], tagMaps: [] }] });

await notesStore.persist();
await dbStore.persist();

console.log('db active', dbStore.activeDatabaseId);
console.log('notes length', notesStore.notes.length);
console.log('active notes length', notesStore.activeDatabaseNotes.length);
console.log('persisted db', await readPersistedState('database'));
console.log('persisted notes', await readPersistedState('notes'));
