import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, role } = loginDto;

    // FIND USER
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // CHECK STATUS
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Your account is inactive',
      );
    }

    // CHECK ROLE
    if (user.role !== role) {
      throw new UnauthorizedException(
        'Invalid login role',
      );
    }

    // CHECK PASSWORD
    const passwordMatch = await bcrypt.compare(
      password,
      user.password,
    );

    console.log('Login email:', email);
    console.log('Password received:', password);
    console.log('Password hash:', user.password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // CREATE JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    // RESPONSE
    return {
      message: 'Login successful',

      access_token: accessToken,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}