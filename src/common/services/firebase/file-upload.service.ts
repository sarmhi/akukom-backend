import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { initializedapp } from './firebase.service';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class FileService {
  private readonly logger: Logger = new Logger(FileService.name);
  private bucket;
  private readonly initializedapp;

  constructor(
    private configService: ConfigService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.initializedapp = this.firebaseService.getInitializedApp();
    this.bucket = this.initializedapp
      .storage()
      .bucket(`${this.configService.get<string>('PROJECT_ID')}.appspot.com`);
  }

  async uploadPublicFile(
    dataBuffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<{ url: string; key: string }> {
    try {
      const uniqueFileName = `${Date.now()}-${filename}`;
      const file = this.bucket.file(uniqueFileName);

      return new Promise((resolve, reject) => {
        // Create a writable stream buffer from the data buffer
        const fileStream = file.createWriteStream({
          metadata: {
            contentType: mimetype,
          },
          resumable: false,
        });

        // Handle stream events (optional)
        fileStream.on('error', (err) => {
          this.logger.error(err);
          reject(
            new InternalServerErrorException(
              'An error occurred while uploading file',
            ),
          );
        });

        fileStream.on('finish', async () => {
          this.logger.log(`File ${uniqueFileName} uploaded successfully.`);

          const publicUrl = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
          });

          resolve({
            url: publicUrl[0],
            key: uniqueFileName,
          });
        });

        // Write the buffer to the stream
        fileStream.end(dataBuffer);
      });
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'An error occurred while uploading file',
      );
    }
  }

  async deletePublicFile(key: string) {
    this.logger.debug(`deleting public file: ${key}`);
    try {
      const fileExists = await this.checkFileExists(key);
      if (!fileExists) return;
      const file = this.bucket.file(key);
      await file.delete();
      return true;
    } catch (err) {
      this.logger.error('Error deleting file:', err);
      throw new InternalServerErrorException(
        'An error occurred while deleting the file',
      );
    }
  }

  async checkFileExists(key: string): Promise<boolean> {
    this.logger.debug('Checking file exists method called');
    try {
      const file = this.bucket.file(key);
      const exists = await file.exists();
      return exists[0];
    } catch (error) {
      this.logger.error('Error checking file existence:', error);
      if (error.message.includes('No such object:')) return false;
      throw new InternalServerErrorException(
        'An error occurred while checking the file existence',
      );
    }
  }
}
