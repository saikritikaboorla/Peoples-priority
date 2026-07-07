import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwt.sign({ sub: user.id, role: user.role, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async register(email: string, password: string, name: string, role: UserRole = UserRole.CITIZEN) {
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashed, name, role },
    });
    const token = this.jwt.sign({ sub: user.id, role: user.role, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
}
