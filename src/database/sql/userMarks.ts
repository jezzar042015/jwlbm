export const USERMARK_ALL_LIST = `
    SELECT *
    FROM USERMARK
    WHERE UserMarkID IN (SELECT UserMarkId FROM Note)
`;