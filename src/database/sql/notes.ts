export const NOTE_COUNT = `
    SELECT COUNT(*) AS total
    FROM Note;  
`;

export const NOTE_ALL_LIST = `
    SELECT *
    FROM Note
    ORDER BY LastModified DESC;  
`;