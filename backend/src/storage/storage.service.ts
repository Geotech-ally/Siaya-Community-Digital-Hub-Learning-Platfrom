import {
  BadRequestException,
  Injectable,
  Logger,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { Readable } from 'stream';

export interface StoredObject {
  stream: Readable;
  contentType: string;
  length?: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: 's3' | 'local';
  private readonly localRoot: string;
  private s3: S3Client | null = null;
  private bucket: string | null = null;
  private publicBaseUrl: string | null = null;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('AWS_S3_ENDPOINT');
    const region = this.config.get<string>('AWS_REGION');
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('AWS_S3_BUCKET') ?? null;
    this.publicBaseUrl = this.config.get<string>('STORAGE_PUBLIC_BASE_URL') ?? null;

    if (region && accessKeyId && secretAccessKey && this.bucket) {
      this.driver = 's3';
      this.s3 = new S3Client({
        region,
        endpoint,
        forcePathStyle: !!endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.logger.log(
        `Storage driver: S3 (bucket=${this.bucket}${endpoint ? `, endpoint=${endpoint}` : ''})`,
      );
    } else {
      this.driver = 'local';
      this.localRoot = join(process.cwd(), 'storage');
      if (!existsSync(this.localRoot)) mkdirSync(this.localRoot, { recursive: true });
      this.logger.warn(
        'AWS S3 not fully configured — falling back to local disk storage under ./storage',
      );
    }
  }

  get isS3(): boolean {
    return this.driver === 's3';
  }

  /**
   * Upload a buffer/stream and return a stable storage key (stored in fileUrl).
   */
  async upload(key: string, body: Buffer | Readable, contentType: string): Promise<string> {
    if (this.driver === 's3' && this.s3 && this.bucket) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          // Public-read for certs; adjust via ACL as needed.
          ACL: 'public-read',
        }),
      );
      return key;
    }

    const filePath = join(this.localRoot, key);
    if (!existsSync(dirname(filePath))) mkdirSync(dirname(filePath), { recursive: true });
    await new Promise<void>((resolve, reject) => {
      if (Buffer.isBuffer(body)) {
        import('fs').then((fs) =>
          fs.writeFile(filePath, body, (err) => (err ? reject(err) : resolve())),
        );
      } else {
        const out = createWriteStream(filePath);
        body.pipe(out);
        out.on('finish', resolve);
        out.on('error', reject);
      }
    });
    return key;
  }

  async download(key: string): Promise<StoredObject> {
    if (this.driver === 's3' && this.s3 && this.bucket) {
      const res = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      const stream = res.Body as Readable;
      return {
        stream,
        contentType: res.ContentType ?? 'application/octet-stream',
        length: res.ContentLength,
      };
    }

    const filePath = join(this.localRoot, key);
    if (!existsSync(filePath)) throw new BadRequestException('File not found');
    return {
      stream: createReadStream(filePath),
      contentType: 'application/octet-stream',
    };
  }

  async delete(key: string): Promise<void> {
    if (this.driver === 's3' && this.s3 && this.bucket) {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      return;
    }
    const filePath = join(this.localRoot, key);
    if (existsSync(filePath)) {
      import('fs').then((fs) => fs.unlink(filePath, () => undefined));
    }
  }

  /**
   * Publicly accessible URL for a stored key (S3 public base or signed/local).
   */
  toPublicUrl(key: string): string {
    if (this.driver === 's3' && this.bucket) {
      if (this.publicBaseUrl) return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
      if (this.config.get<string>('AWS_S3_ENDPOINT')) {
        return `${this.config.get<string>('AWS_S3_ENDPOINT')!.replace(/\/$/, '')}/${this.bucket}/${key}`;
      }
      const region = this.config.get<string>('AWS_REGION');
      return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
    }
    return `/storage/${key}`;
  }

  toStreamableFile(obj: StoredObject): StreamableFile {
    return new StreamableFile(obj.stream as any, {
      type: obj.contentType,
      length: obj.length,
    });
  }
}
