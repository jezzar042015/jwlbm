<template>
    <div class="p-4 m-2 shadow rounded cursor-pointer" :class="bg">
        <p v-if="item.note[6]" class="text-xs text-gray-500 mb-2">
            {{ formatRelativeTime(item.note[6]) }}
        </p>
        <h3 class="font-semibold text-gray-800">{{ item.note[4] }}</h3>
        <p class="text-gray-600" v-html="formatText(item.note[5])"></p>
        <div v-if="normalizedTagMaps.length > 0">
            <span v-for="tag in tags" :key="tag.id" @click="handleTagClick(tag.id)"
                class="inline-block text-xs px-3 py-2 rounded-full mr-2 mt-2 shadow-xs"
                :class="filterTags.includes(tag.id) ? 'bg-black text-white' : 'bg-gray-300/80 text-blue-800'">
                {{ tag.label }}
            </span>
        </div>
        <!-- location reference -->
        <div v-if="isStudyBible" class="mt-4 py-2 px-2 border-t border-t-gray-300 flex justify-start gap-2">
            <div class="mt-2">
                <img src="/1001070103_univ_sqr_lg.jpg" alt="Study Bible thumbnail" class="w-9 h-9" />
            </div>
            <div class="flex flex-col text-xs text-blue-500 mt-2 justify-start">
                <div>Study Bible</div>
                <div>
                    {{ bibleBookName }} {{ item.location?.[2] }}:{{ item.note[9] }}
                </div>
            </div>
        </div>

        <div v-if="!isMaster" class="mt-4 pt-3 border-t border-t-gray-200">
            <button v-if="batched" type="button"
                class="text-xs md:text-sm px-4 py-2 rounded-full cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60 shadow"
                :class="selectedForBatch ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-violet-900 text-white hover:bg-violet-800'"
                :disabled="isMigrating" @click.stop="handleBatchSelectionClick">
                {{ selectedForBatch ? 'Remove from Selection' : 'Add to Migration List' }}
            </button>

            <button v-else type="button"
                class="text-xs md:text-sm px-4 py-2 rounded-full cursor-pointer bg-violet-900 text-white hover:bg-violet-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60 shadow"
                :disabled="isMigrating" @click.stop="handleCopyToMasterClick">
                Copy to Master Backup
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { UserMark } from '@/database/types/marker';
    import type { Note } from '@/database/types/note';
    import type { NoteTagMapRow } from '@/database/types/tagMap';
    import { useTagsStore } from '@/stores/tags';
    import { useRelativeTime } from '@/composables/useRelativeTime';
    import { computed } from 'vue';
    import type { Location } from '@/database/types/location';

    const { item, filterTags, isMaster, batched, selectedForBatch, isMigrating } = defineProps<{
        item: {
            note: Note,
            tagMaps: NoteTagMapRow[],
            marker?: UserMark,
            location?: Location
        },
        filterTags: number[],
        isMaster: boolean,
        batched: boolean,
        selectedForBatch: boolean,
        isMigrating: boolean,
    }>();

    const emit = defineEmits<{
        (e: 'handle-tag-filter-change', selectedTagId: number): void;
        (e: 'toggle-note-batch-selection', noteId: number): void;
        (e: 'copy-note-to-master', item: {
            note: Note,
            tagMaps: NoteTagMapRow[],
            marker?: UserMark,
            location?: Location
        }): void;
    }>();

    const handleTagClick = (tagId: number) => {
        emit('handle-tag-filter-change', tagId);
    };

    const handleBatchSelectionClick = () => {
        if (isMaster || isMigrating) {
            return;
        }

        emit('toggle-note-batch-selection', item.note[0]);
    };

    const handleCopyToMasterClick = () => {
        if (isMaster || isMigrating) {
            return;
        }

        emit('copy-note-to-master', item);
    };

    const tagStore = useTagsStore();
    const { formatRelativeTime } = useRelativeTime();

    function escapeHtml(unsafe: string) {
        return unsafe
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function formatText(text: string | null | undefined) {
        if (!text) return '';
        // preserve existing HTML safety and convert newlines to <br>
        const escaped = escapeHtml(text);
        return escaped.replace(/\r\n|\r|\n/g, '<br>');
    }

    const normalizedTagMaps = computed(() => {
        return Array.isArray(item?.tagMaps) ? item.tagMaps : [];
    });

    const tags = computed(() => {
        return normalizedTagMaps.value
            .map((m) => ({
                id: m[4],
                label: tagStore.activeDatabaseTags.find(f => f[0] == m[4])?.[2] ?? '',
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    });

    const bg = computed(() => {
        if (item.marker?.[1] === 0) {
            return 'bg-white';
        } else if (item.marker?.[1] === 1) {
            return 'bg-yellow-50';
        } else if (item.marker?.[1] === 2) {
            return 'bg-green-50';
        } else if (item.marker?.[1] === 3) {
            return 'bg-blue-100';
        } else if (item.marker?.[1] === 4) {
            return 'bg-red-100';
        } else if (item.marker?.[1] === 5) {
            return 'bg-orange-100';
        } else if (item.marker?.[1] === 6) {
            return 'bg-purple-100';
        } else {
            return 'bg-white';
        }
    });

    const isStudyBible = computed(() => {
        return item.location?.[6] === 'nwtsty';
    });

    const bibleBookName = computed(() => {

        if (!isStudyBible.value || !item.location) return '';

        const bookId = item.location[1];
        if (typeof bookId !== 'number') return '';

        const nwtBibleBooks: Record<number, { long: string; short: string; label: string }> = {
            // Old Testament / Hebrew-Aramaic Scriptures
            1: { long: "Genesis", short: "Gen.", label: "Ge" },
            2: { long: "Exodus", short: "Ex.", label: "Ex" },
            3: { long: "Leviticus", short: "Lev.", label: "Le" },
            4: { long: "Numbers", short: "Num.", label: "Nu" },
            5: { long: "Deuteronomy", short: "Deut.", label: "De" },
            6: { long: "Joshua", short: "Josh.", label: "Jos" },
            7: { long: "Judges", short: "Judg.", label: "Jg" },
            8: { long: "Ruth", short: "Ruth", label: "Ru" },
            9: { long: "1 Samuel", short: "1 Sam.", label: "1Sa" },
            10: { long: "2 Samuel", short: "2 Sam.", label: "2Sa" },
            11: { long: "1 Kings", short: "1 Ki.", label: "1Ki" },
            12: { long: "2 Kings", short: "2 Ki.", label: "2Ki" },
            13: { long: "1 Chronicles", short: "1 Chron.", label: "1Ch" },
            14: { long: "2 Chronicles", short: "2 Chron.", label: "2Ch" },
            15: { long: "Ezra", short: "Ezra", label: "Ezr" },
            16: { long: "Nehemiah", short: "Neh.", label: "Ne" },
            17: { long: "Esther", short: "Esth.", label: "Es" },
            18: { long: "Job", short: "Job", label: "Job" },
            19: { long: "Psalms", short: "Ps.", label: "Ps" },
            20: { long: "Proverbs", short: "Prov.", label: "Pr" },
            21: { long: "Ecclesiastes", short: "Eccl.", label: "Ec" },
            22: { long: "Song of Solomon", short: "Song of Sol.", label: "Ca" },
            23: { long: "Isaiah", short: "Isa.", label: "Isa" },
            24: { long: "Jeremiah", short: "Jer.", label: "Jer" },
            25: { long: "Lamentations", short: "Lam.", label: "La" },
            26: { long: "Ezekiel", short: "Ezek.", label: "Eze" },
            27: { long: "Daniel", short: "Dan.", label: "Da" },
            28: { long: "Hosea", short: "Hos.", label: "Ho" },
            29: { long: "Joel", short: "Joel", label: "Joe" },
            30: { long: "Amos", short: "Amos", label: "Am" },
            31: { long: "Obadiah", short: "Obad.", label: "Ob" },
            32: { long: "Jonah", short: "Jonah", label: "Jon" },
            33: { long: "Micah", short: "Mic.", label: "Mic" },
            34: { long: "Nahum", short: "Nah.", label: "Na" },
            35: { long: "Habakkuk", short: "Hab.", label: "Hab" },
            36: { long: "Zephaniah", short: "Zeph.", label: "Zep" },
            37: { long: "Haggai", short: "Hag.", label: "Hag" },
            38: { long: "Zechariah", short: "Zech.", label: "Zec" },
            39: { long: "Malachi", short: "Mal.", label: "Mal" },

            // New Testament / Christian Greek Scriptures
            40: { long: "Matthew", short: "Matt.", label: "Mt" },
            41: { long: "Mark", short: "Mark", label: "Mr" },
            42: { long: "Luke", short: "Luke", label: "Lu" },
            43: { long: "John", short: "John", label: "Joh" },
            44: { long: "Acts", short: "Acts", label: "Ac" },
            45: { long: "Romans", short: "Rom.", label: "Ro" },
            46: { long: "1 Corinthians", short: "1 Cor.", label: "1Co" },
            47: { long: "2 Corinthians", short: "2 Cor.", label: "2Co" },
            48: { long: "Galatians", short: "Gal.", label: "Ga" },
            49: { long: "Ephesians", short: "Eph.", label: "Eph" },
            50: { long: "Philippians", short: "Phil.", label: "Php" },
            51: { long: "Colossians", short: "Col.", label: "Col" },
            52: { long: "1 Thessalonians", short: "1 Thess.", label: "1Th" },
            53: { long: "2 Thessalonians", short: "2 Thess.", label: "2Th" },
            54: { long: "1 Timothy", short: "1 Tim.", label: "1Ti" },
            55: { long: "2 Timothy", short: "2 Tim.", label: "2Ti" },
            56: { long: "Titus", short: "Titus", label: "Tit" },
            57: { long: "Philemon", short: "Philem.", label: "Phm" },
            58: { long: "Hebrews", short: "Heb.", label: "Heb" },
            59: { long: "James", short: "Jas.", label: "Jas" },
            60: { long: "1 Peter", short: "1 Pet.", label: "1Pe" },
            61: { long: "2 Peter", short: "2 Pet.", label: "2Pe" },
            62: { long: "1 John", short: "1 John", label: "1Jo" },
            63: { long: "2 John", short: "2 John", label: "2Jo" },
            64: { long: "3 John", short: "3 John", label: "3Jo" },
            65: { long: "Jude", short: "Jude", label: "Jude" },
            66: { long: "Revelation", short: "Rev.", label: "Re" }
        };

        return nwtBibleBooks[bookId]?.long ?? '';
    });
</script>