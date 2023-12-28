import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private readonly initializedApp: firebase.app.App;

  constructor(private readonly configService: ConfigService) {
    const { privateKey } = JSON.parse(
      this.configService.get<string>('PRIVATE_KEY'),
    );

    const firebaseConfig = {
      type: this.configService.get<string>('TYPE'),
      project_id: this.configService.get<string>('PROJECT_ID'),
      private_key_id: this.configService.get<string>('PRIVATE_KEY_ID'),
      private_key: privateKey,
      client_email: this.configService.get<string>('CLIENT_EMAIL'),
      client_id: this.configService.get<string>('CLIENT_ID'),
      auth_uri: this.configService.get<string>('AUTH_URI'),
      token_uri: this.configService.get<string>('TOKEN_URI'),
      auth_provider_x509_cert_url:
        this.configService.get<string>('AUTH_CERT_URL'),
      client_x509_cert_url: this.configService.get<string>('CLIENT_CERT_URL'),
      universe_domain: this.configService.get<string>('UNIVERSAL_DOMAIN'),
    } as firebase.ServiceAccount;

    this.initializedApp = firebase.initializeApp({
      credential: firebase.credential.cert(firebaseConfig),
    });
  }

  getInitializedApp(): firebase.app.App {
    return this.initializedApp;
  }
}
