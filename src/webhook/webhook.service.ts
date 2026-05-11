import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  private readonly webhookSecret: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.webhookSecret = this.configService.get<string>('WEBHOOK_SECRET') || 'secret_examen_2026';
  }

  verifySignature(payload: string, signature: string): boolean {
    const expectedSignature = 'sha256=' + crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  async handlePaymentWebhook(payload: any, signature: string) {
    // Vérifier la présence de la signature
    if (!signature) {
      throw new UnauthorizedException('Signature manquante');
    }

    // Vérifier la signature
    const payloadStr = JSON.stringify(payload);
    if (!this.verifySignature(payloadStr, signature)) {
      throw new UnauthorizedException('Signature invalide');
    }

    if (payload.event === 'payment.succeeded') {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: payload.enrollment_id },
      });

      if (!enrollment) {
        throw new NotFoundException('Inscription non trouvée');
      }

      await this.prisma.enrollment.update({
        where: { id: payload.enrollment_id },
        data: {
          paymentStatus: 'paid',
          status: 'active',
        },
      });
    }

    return { success: true, received: true };
  }
}