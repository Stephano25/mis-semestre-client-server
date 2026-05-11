import { Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('openai')
@Controller('api/v1/courses')
export class OpenaiController {
  constructor(private openaiService: OpenaiService) {}

  @Post(':id/generate-description')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Générer une description via OpenAI' })
  async generateDescription(@Param('id', ParseIntPipe) id: number) {
    return this.openaiService.generateDescription(id);
  }

  @Get(':id/description')
  @ApiOperation({ summary: 'Récupérer la description générée' })
  async getDescription(@Param('id', ParseIntPipe) id: number) {
    return this.openaiService.getDescription(id);
  }
}