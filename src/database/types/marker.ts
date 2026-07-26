export enum UserMarkColor {
    Yellow = 0,
    Green = 1,
    Blue = 2,
    Purple = 3,
    Red = 4,
    Orange = 5,
}

export enum UserMarkStyle {
    Solid = 0,
    // Add other styles as they become known
}

export interface UserMark {
    userMarkId: number
    colorIndex: UserMarkColor
    locationId: number
    styleIndex: UserMarkStyle
    userMarkGuid: string
    version: number
}