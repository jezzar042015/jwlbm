export const USERMARK_ALL_LIST = `
    SELECT *
    FROM USERMARK
    `;

export const USERMARK_FILTERED_LIST = `
    SELECT *
    FROM USERMARK
    WHERE UserMarkID IN (SELECT UserMarkId FROM Note)
`;