export interface BlockRange {
    blockRangeId: number
    blockType: 1 | 2
    identifier: number
    startToken: number | null
    endToken: number | null
    userMarkId: number
}