import { Injectable } from '@nestjs/common';
import { Storage, File, MutableFile } from 'megajs';
import * as fs from 'fs';

@Injectable()
export class MegaService {
  private storage: Storage;

  constructor() {
    this.storage = new Storage(
      {
        email: process.env.MEGA_ACCOUNT_EMAIL ?? '',
        password: process.env.MEGA_ACCOUNT_PASSWORD ?? '',
      },
      (err) => {
        if (err) throw err;
        console.log('Logged in to MEGA');
      },
    );
  }

  private async getOrCreateFolder(folderName: string): Promise<MutableFile> {
    return new Promise((resolve, reject) => {
      const folder = this.storage.find(
        (child) => child.name === folderName && child.directory,
      ) as MutableFile | undefined;

      if (folder) return resolve(folder);

      this.storage.mkdir({ name: folderName }, (err, createdFolder) => {
        if (err) return reject(err);
        resolve(createdFolder as MutableFile);
      });
    });
  }


  async uploadFile(
    buffer: Buffer,
    filename: string,
    folderName = 'films',
  ): Promise<string> {
    console.log('>>> uploadFile >>> ', { filename, folderName });
    const folder = await this.getOrCreateFolder(folderName);
    const file = await new Promise<File>((resolve, reject) => {
      const uploadStream = folder.upload(filename, buffer);
      uploadStream.on('complete', resolve);
      uploadStream.on('error', reject);
    });
    console.log('>>> Uploaded to MEGA: ', file);
    return file.link({noKey: false});
  }
}
