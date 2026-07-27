import { ZipService } from "./ZipService";
import { DatabaseService } from "./DatabaseService";

export class ImportService {
    static async importBackup(file: File) {
        const bytes = await ZipService.extractDatabase(file);
        const manifest = await ZipService.extractManifest(file);

        const database = new DatabaseService();

        await database.open(bytes, manifest);

        return database;
    }
}