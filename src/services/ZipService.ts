import JSZip from "jszip";
import type { DatabaseManifest } from "@/database/types/database";

export class ZipService {
    static async extractDatabase(file: File): Promise<Uint8Array> {
        const zip = await JSZip.loadAsync(file);

        const db = zip.file("userData.db");

        if (!db) {
            throw new Error("userData.db not found.");
        }

        return await db.async("uint8array");
    }

    static async extractManifest(file: File): Promise<DatabaseManifest> {
        const zip = await JSZip.loadAsync(file);

        const manifest = zip.file("manifest.json");

        if (!manifest) {
            throw new Error("manifest.json not found.");
        }

        const manifestContent = await manifest.async("string");

        return JSON.parse(manifestContent) as DatabaseManifest;
    }
}