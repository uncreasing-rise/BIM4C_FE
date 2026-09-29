/** Images live outside localStorage; each issue can be restored independently. */
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("bim4c-issue-images", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("images");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("STORAGE_BLOCKED"));
  });
}

export async function readIssueSnapshots(key: string): Promise<Record<string, string>> {
  let db: IDBDatabase | undefined;
  try {
    db = await database();
    return await new Promise((resolve, reject) => {
      const request = db!.transaction("images").objectStore("images").get(key);
      request.onsuccess = () => resolve(request.result ?? {});
      request.onerror = () => reject(request.error);
    });
  } catch { return {}; } finally { db?.close(); }
}

export async function writeIssueSnapshots(key: string, images: Record<string, string>): Promise<boolean> {
  let db: IDBDatabase | undefined;
  try {
    db = await database();
    await new Promise<void>((resolve, reject) => {
      const tx = db!.transaction("images", "readwrite");
      if (Object.keys(images).length) tx.objectStore("images").put(images, key);
      else tx.objectStore("images").delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = tx.onabort = () => reject(tx.error);
    });
    return true;
  } catch { return false; } finally { db?.close(); }
}
