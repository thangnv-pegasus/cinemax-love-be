import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

@Injectable()
export class SupabaseService {
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || '', // service_role
  );

  async uploadVideo(file: Express.Multer.File) {
    const filePath = `video/${Date.now()}-${file.originalname}`;

    const { data, error } = await this.supabase.storage
      .from('cinemax-love')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.log(error);
      throw error;
    }

    // get public URL
    const { data: publicUrl } = this.supabase.storage
      .from('cinemax-love')
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) throw new Error('File not found');

    const fileExt = file.originalname.split('.').pop();
    const filePath = `image/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // Upload file lên Storage
    const { error } = await this.supabase.storage
      .from('cinemax-love')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    // Lấy public URL
    const { data: publicData } = this.supabase.storage
      .from('cinemax-love')
      .getPublicUrl(filePath);

    return {
      url: publicData.publicUrl,
      path: filePath,
    };
  }

  async deleteImage(path: string) {
    const { error } = await this.supabase.storage
      .from('cinemax-love')
      .remove([path]);

    if (error) throw error;

    return true;
  }
}
