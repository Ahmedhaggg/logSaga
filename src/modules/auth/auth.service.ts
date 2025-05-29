import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../users/user.repository';
import { User } from '../users/entities/user.entity';
import { GoogleUserInfo } from './types/googleAuthUser.type';
import { RefreshToken } from './entities/refreshToken.entity';
import * as crypto from 'crypto';
import { RefreshTokenRepository } from './repositories/refreshToken.repository';

@Injectable()
export class AuthService {
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async loginWithGoogle(googleUser: GoogleUserInfo): Promise<TokenPair> {
    const email = this.getEmailFromGoogleUser(googleUser);

    // await this.userRepository.create({
    //   email,
    //   status: 'INVITED',
    //   role: 'ADMIN',
    // });

    let user = await this.validateUserExists(email);

    if (user.status === 'ACTIVE') {
      await this.updateLastLogin(user.id);
    } else if (user.status === 'INVITED') {
      user = await this.activateInvitedUser(user, googleUser);
    }

    return this.generateTokenPair(user);
  }

  async validateRefreshToken(token: string): Promise<TokenPair> {
    const hashedToken = this.hashToken(token);
    const refreshToken = await this.findValidRefreshToken(hashedToken);
    const user = await this.userRepository.findById(refreshToken.userId);

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // Rotate refresh token
    await this.revokeRefreshToken(hashedToken);
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokenPair(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(token: string): Promise<void> {
    const hashedToken = this.hashToken(token);
    await this.revokeRefreshToken(hashedToken);
  }

  // Private helper methods
  private getEmailFromGoogleUser(googleUser: GoogleUserInfo): string {
    const email = googleUser.email;

    if (!email) {
      throw new UnauthorizedException(
        'Google account does not provide an email.',
      );
    }

    return email;
  }

  private async validateUserExists(email: string): Promise<User> {
    let user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('You are not invited to this platform.');
    }

    return user;
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.updateById(userId, { lastLogin: new Date() });
  }

  private async activateInvitedUser(
    user: User,
    googleUser: GoogleUserInfo,
  ): Promise<User> {
    const updateData: Partial<User> = {
      status: 'ACTIVE',
      photo: googleUser.picture,
    };

    await this.userRepository.updateById(user.id, updateData);

    const updatedUser = await this.userRepository.findById(user.id);

    if (!updatedUser) {
      throw new UnauthorizedException('User not found after update.');
    }

    return updatedUser;
  }

  private async generateTokenPair(user: User): Promise<TokenPair> {
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const hashedToken = this.hashToken(token);
    const expiresAt = this.calculateTokenExpiry();

    await this.refreshTokenRepository.create({
      userId,
      token: hashedToken,
      expiresAt,
    });

    return token;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private calculateTokenExpiry(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);
    return expiresAt;
  }

  private async findValidRefreshToken(
    hashedToken: string,
  ): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      token: hashedToken,
      isRevoked: false,
    });

    if (
      !refreshToken ||
      refreshToken.expiresAt.getTime() < new Date().getTime()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    return refreshToken;
  }

  private async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }
}
