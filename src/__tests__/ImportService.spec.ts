import { describe, expect, it, vi } from "vitest";
import JSZip from "jszip";

import { DatabaseService } from "../services/DatabaseService";
import { ImportService } from "../services/ImportService";

describe("ImportService", () => {
  it("parses and exposes the backup manifest", async () => {
    const zip = new JSZip();
    await zip.file("userData.db", new Uint8Array([1, 2, 3]));
    await zip.file(
      "manifest.json",
      JSON.stringify({
        name: "Backup Name",
        creationDate: "2024-01-01",
        version: 1,
        type: 0,
        userDataBackup: {
          lastModifiedDate: "2024-01-01",
          deviceName: "Device",
          databaseName: "DB",
          hash: "abc123",
          schemaVersion: 1,
        },
      }),
    );

    const file = new File([await zip.generateAsync({ type: "blob" })], "backup.zip", {
      type: "application/zip",
    });

    const openSpy = vi.spyOn(DatabaseService.prototype, "open").mockImplementation(async function (this: DatabaseService, _data: Uint8Array, manifest?: any) {
      this.manifest = manifest;
    });

    const database = await ImportService.importBackup(file);

    expect(openSpy).toHaveBeenCalledWith(expect.any(Uint8Array), expect.objectContaining({ name: "Backup Name" }));
    expect(database.manifest).toEqual(expect.objectContaining({ name: "Backup Name" }));

    openSpy.mockRestore();
  });
});
