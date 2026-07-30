import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import DatabaseNotes from '../views/DatabaseNotes.vue';
import { useDatabaseStore } from '../stores/database';
import { useNotesStore } from '../stores/notes';

vi.mock('@/router', () => ({
    default: {
        push: vi.fn(),
    },
}));

describe('DatabaseNotes', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the notes view shell', () => {
        const wrapper = mount(DatabaseNotes);
        expect(wrapper.exists()).toBe(true);
    });

    it('returns conflicting note entries from non-master databases', () => {
        const databaseStore = useDatabaseStore();
        const notesStore = useNotesStore();

        databaseStore.databases = [
            { id: 'db-master', isMaster: true, importedAt: new Date(), name: 'Master', db: {} as any },
            { id: 'db-remote', isMaster: false, importedAt: new Date(), name: 'Remote', db: {} as any },
        ] as any;
        databaseStore.activeDatabaseId = 'db-master';

        notesStore.notes = [
            {
                db_id: 'db-master',
                notesWithTagMaps: [
                    {
                        note: [1, '', '', '', 'Alpha note', 'Original content', '', ''],
                        tagMaps: [],
                    },
                ],
            },
            {
                db_id: 'db-remote',
                notesWithTagMaps: [
                    {
                        note: [1, '', '', '', 'Alpha note', 'Changed content', '', ''],
                        tagMaps: [],
                    },
                ],
            },
        ] as any;

        expect(notesStore.conflictingNoteStates).toHaveLength(1);
        // expect(notesStore.conflictingNoteStates?[0].notesWithTagMaps?.[0].note[5]).toBe('Changed content');
    });

    it('filters notes by keyword after a debounce delay', async () => {
        const databaseStore = useDatabaseStore();
        const notesStore = useNotesStore();

        databaseStore.activeDatabaseId = 'db-1';
        notesStore.notes = [
            {
                db_id: 'db-1',
                notesWithTagMaps: [
                    {
                        note: ['1', '', '', '', 'Alpha note', 'First content', '', ''],
                        tagMaps: [],
                    },
                    {
                        note: ['2', '', '', '', 'Beta note', 'Second content', '', ''],
                        tagMaps: [],
                    },
                ],
            },
        ] as any;

        const wrapper = mount(DatabaseNotes, {
            global: {
                stubs: {
                    NoteListItem: {
                        props: ['item'],
                        template: '<div class="note-item">{{ item.note[4] }}</div>',
                    },
                },
            },
        });

        const input = wrapper.get('input[type="search"]');
        await input.setValue('beta');

        expect(wrapper.text()).toContain('Alpha note');
        expect(wrapper.text()).toContain('Beta note');

        vi.advanceTimersByTime(300);
        await nextTick();

        expect(wrapper.text()).toContain('Beta note');
        expect(wrapper.text()).not.toContain('Alpha note');
    });
});
