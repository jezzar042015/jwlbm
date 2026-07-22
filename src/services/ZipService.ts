import JSZip from "jszip";

export class ZipService {
    static async extractDatabase(file: File): Promise<Uint8Array> {
        const zip = await JSZip.loadAsync(file);

        const db = zip.file("userData.db");

        if (!db) {
            throw new Error("userData.db not found.");
        }

        return await db.async("uint8array");
    }
}