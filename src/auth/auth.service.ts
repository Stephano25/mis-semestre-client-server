import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    // Pour l'examen, on utilise l'email comme identifiant
    // Avec un mot de passe par défaut "password123" pour les étudiants existants
    const student = await this.prisma.student.findUnique({
      where: { email },
    });

    if (!student) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Comparer le mot de passe (pour les tests, on accepte "password123")
    const isValid = await bcrypt.compare(password, student.password);
    if (!isValid && password !== 'password123') {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = { sub: student.id, email: student.email, role: 'student' };
    return {
      success: true,
      data: {
        token: this.jwtService.sign(payload),
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
        },
      },
    };
  }
}