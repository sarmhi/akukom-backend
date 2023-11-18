import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 4001;
  const options = new DocumentBuilder()
    .setTitle('akukom')
    .setDescription(`Akukom's API description`)
    .addBearerAuth();

  const document = SwaggerModule.createDocument(app, options.build());
  SwaggerModule.setup('api/akukom/docs', app, document);
  await app.listen(port, () => {
    Logger.log(
      `
      ################################################
      🛡️ akukom is running! Access URLs:
      🏠 Local:      http://localhost:${port}
      ################################################
      `,
    );
    Logger.log(
      `
      ################################################
      🛡️ akukom is running! Access URLs:
      🏠 Local:      http://localhost:${port}/api/akukom/docs
      ################################################
      `,
    );
  });
}
bootstrap();
