import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface WebhookPayload {
  event: string;
  enrollment_id: number;
}

@ApiTags('webhook')
@Controller('api/v1/webhooks')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post('payment')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook de confirmation de paiement' })
  @ApiResponse({ status: 200, description: 'Webhook traité' })
  @ApiResponse({ status: 401, description: 'Signature invalide' })
  @ApiResponse({ status: 404, description: 'Inscription non trouvée' })
  async handlePayment(
    @Body() payload: WebhookPayload,
    @Headers('x-webhook-signature') signature: string,
  ) {
    return this.webhookService.handlePaymentWebhook(payload, signature);
  }
}