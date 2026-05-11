import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class OpenaiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('OPENAI_BASE_URL') || 'https://api.openai.com/v1';
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  async generateDescription(courseId: number): Promise<{ description: string }> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true },
    });

    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }

    // Si la description existe déjà, la retourner (économie de tokens)
    if (course.description) {
      return { description: course.description };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            { 
              role: 'system', 
              content: 'Tu es un expert en marketing de formation. Tu rédiges des descriptions courtes et percutantes pour des pages de cours en ligne. Réponds uniquement en français. Maximum 4 phrases.' 
            },
            { 
              role: 'user', 
              content: `Génère une description marketing pour ce cours : Titre : ${course.title} Durée : ${course.durationHours} heures Formateur spécialisé en : ${course.instructor.specialty}` 
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const description = response.data.choices[0].message.content.trim();

      // Sauvegarder la description
      await this.prisma.course.update({
        where: { id: courseId },
        data: { description },
      });

      return { description };
    } catch (error) {
      console.error('OpenAI error:', error.message);
      throw new ServiceUnavailableException('Service OpenAI indisponible');
    }
  }

  async getDescription(courseId: number): Promise<{ description: string }> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }

    if (!course.description) {
      throw new NotFoundException('Aucune description générée pour ce cours');
    }

    return { description: course.description };
  }
}