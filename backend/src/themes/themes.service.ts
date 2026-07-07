import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThemesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.theme.findMany({
      orderBy: { feedbackCount: 'desc' },
    });
  }

  async getTrending(limit = 10) {
    return this.prisma.theme.findMany({
      orderBy: { feedbackCount: 'desc' },
      take: limit,
    });
  }

  async getThemeStats(constituencyId?: string) {
    const themes = await this.prisma.theme.findMany({
      include: {
        feedback: {
          where: constituencyId ? { constituencyId } : undefined,
          select: { id: true, districtId: true, sentiment: true },
        },
      },
    });

    return themes.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      count: t.feedback.length,
      urgentCount: t.feedback.filter((f) => f.sentiment === 'URGENT').length,
    })).sort((a, b) => b.count - a.count);
  }
}
