import { Injectable, OnModuleInit } from '@nestjs/common';
import { Storage, File as MegaFile, MutableFile } from 'megajs';
import * as fs from 'fs';

@Injectable()
export class MegaService implements OnModuleInit {
  private storage: Storage;
  private ready = false;

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

  async onModuleInit() {
    await this.storage.ready;
    this.ready = true;
    console.log('MEGA ready');
  }

  private async ensureReady() {
    if (!this.ready) {
      await this.storage.ready;
      this.ready = true;
    }
  }

  private async getOrCreateFolder(folderName: string): Promise<MutableFile> {
    await this.ensureReady();

    // Lấy folder từ root.children, đảm bảo children không undefined
    const rootChildren = this.storage.root.children || [];
    let folder = rootChildren.find(
      (c) => c.directory && c.name === folderName,
    ) as MutableFile | undefined;

    if (folder) return folder;

    // Nếu chưa có thì tạo mới
    return new Promise<MutableFile>((resolve, reject) => {
      this.storage.root.mkdir({ name: folderName }, (err, created) => {
        if (err) return reject(err);
        resolve(created as MutableFile);
      });
    });
  }

  private exportFileAsPublicLink(file: MegaFile): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const res = (file as any).export?.();
        if (res && typeof res.then === 'function') {
          return res.then(resolve).catch(reject);
        }
        (file as any).export((err: any, link: string) => {
          if (err) return reject(err);
          resolve(link);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Upload single file (Buffer) → return public link
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    folderName = 'films',
  ): Promise<string> {
    const folder = await this.getOrCreateFolder(folderName);

    // Upload file
    const file = await new Promise<MegaFile>((resolve, reject) => {
      const uploadStream = folder.upload(filename, buffer);
      uploadStream.on('complete', resolve);
      uploadStream.on('error', reject);
    });

    // Lấy public link ngay
    const publicLink = file.link({ noKey: false });
    console.log('>>> Public link: ', await publicLink);

    return publicLink;
  }


  /**
   * Upload nhiều file cùng lúc → return array public links
   */
  async uploadFiles(
    files: { buffer: Buffer; filename: string }[],
    folderName = 'films',
  ): Promise<string[]> {
    // Upload song song
    const promises = files.map((f) => this.uploadFile(f.buffer, f.filename, folderName));
    return Promise.all(promises);
  }
}
