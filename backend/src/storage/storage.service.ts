import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private s3: AWS.S3 | null = null;
  private localDir: string;
  private useLocal: boolean;

  constructor(private config: ConfigService) {
    const endpoint = this.config.get('S3_ENDPOINT');
    if (endpoint) {
      this.s3 = new AWS.S3({
        endpoint,
        accessKeyId: this.config.get('S3_ACCESS_KEY'),
        secretAccessKey: this.config.get('S3_SECRET_KEY'),
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
      });
      this.useLocal = false;
    } else {
      this.localDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(this.localDir)) {
        fs.mkdirSync(this.localDir, { recursive: true });
      }
      this.useLocal = true;
    }
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${uuidv4()}-${file.originalname}`;

    if (this.useLocal) {
      const dest = path.join(this.localDir, key);
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(dest, file.buffer);
      return `/uploads/${key}`;
    }

    const bucket = this.config.get('S3_BUCKET') || 'feedback-media';
    await this.s3!.upload({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    return `${this.config.get('S3_ENDPOINT')}/${bucket}/${key}`;
  }
}
