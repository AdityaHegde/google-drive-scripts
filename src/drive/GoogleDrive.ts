import {drive_v3, google} from "googleapis";
import Drive = drive_v3.Drive;

export class GoogleDrive {
  private readonly drive: Drive;

  public constructor(auth: any) {
    this.drive = google.drive({version: "v3", auth});
  }

  public async getFiles(query?: string, pageToken?: string): Promise<Array<drive_v3.Schema$File>> {
    const files = new Array<drive_v3.Schema$File>();
    const listResp = await this.drive.files.list({
      ...(query ? {q: query}: {}),
      ...(pageToken ? {pageToken} : {}),
      fields: "nextPageToken, files(id, name, owners)",
    });

    files.push.apply(files, listResp.data.files);
    if (listResp.data.files.length && listResp.data.nextPageToken) {
      files.push.apply(files, await this.getFiles(query, listResp.data.nextPageToken));
    }

    return files;
  }

  public async copyFile(source: drive_v3.Schema$File, targetDir: string) {
    await this.drive.files.copy({
      fileId: source.id,
      requestBody: {
        name: source.name,
        parents: [targetDir],
      },
    });
  }

  public async deleteFile(source: drive_v3.Schema$File) {
    await this.drive.files.delete({
      fileId: source.id,
    });
  }
}
