import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3BucketService {
  private readonly logger: Logger = new Logger(S3BucketService.name);
  private bucket: string;
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
    this.bucket = this.configService.get<string>('AWS_BUCKET_NAME');
  }

  async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    try {
      const fileName = `${uuid()}-${filename}`;
      const encodeFileName = encodeURIComponent(fileName);
      const bucketName = this.bucket;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: dataBuffer,
      });
      const uploadResult = await this.s3Client.send(command);
      this.logger.log({
        uploadResult,
      });
      return {
        url: `https://${bucketName}.s3.amazonaws.com/${encodeFileName}`,
        key: fileName,
      };
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'An error occurred while uploading file',
      );
    }
  }

  async deletePublicFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    try {
      const data = await this.s3Client.send(command);
      console.log('Success, s3 object deleted', data);
    } catch (err) {
      console.log('Error', err);
    }
  }

  // check if file exists in bucket
  async checkFileExists(key: string) {
    try {
      const headObjectParams = {
        Bucket: this.bucket,
        Key: key,
      };
      await this.s3Client.send(new HeadObjectCommand(headObjectParams));
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  streamToBuffer = async (stream) => {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  };

  async getImageBytes(key: string) {
    const getObjectParams = { Bucket: this.bucket, Key: key };
    const { Body } = await this.s3Client.send(
      new GetObjectCommand(getObjectParams),
    );
    //return Body as Bytes
    return await this.streamToBuffer(Body);
  }
}
