import initSqlJs from "sql.js";

let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

export async function getSqlJs() {
    if (SQL) return SQL;

    SQL = await initSqlJs({
        locateFile: () => `${import.meta.env.BASE_URL}sql-wasm.wasm`,
    });

    return SQL;
}