import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  private readonly logger: Logger;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.logger = new Logger(TokenService.name);
  }

  async generateToken(userId: string | number, ttl: string) {
    return await this.jwtService.signAsync(
      {
        userId: userId,
      },
      {
        expiresIn: ttl,
      },
    );
  }

  async handleCreateTokens(
    userId: string | number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const accessToken = await this.generateToken(
        userId,
        this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
      );
      const refreshToken = await this.generateToken(
        userId,
        this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
      );
      return { accessToken, refreshToken };
    } catch (err) {
      this.logger.error({
        message: 'Error creating tokens',
        error: err,
      });
      throw new InternalServerErrorException(err);
    }
  }
}
