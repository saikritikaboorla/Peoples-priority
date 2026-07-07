import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ThemesService } from '../themes/themes.service';
import { GeoService } from '../geo/geo.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private themesService: ThemesService,
    private geoService: GeoService,
    private recommendationsService: RecommendationsService,
  ) {}

  async getOverview(constituencyId?: string) {
    const where = constituencyId ? { constituencyId } : {};

    const [
      totalSubmissions,
      activeIssues,
      themeStats,
      districtDemand,
      recommendations,
      recentFeedback,
      timeline,
    ] = await Promise.all([
      this.prisma.feedback.count({ where }),
      this.prisma.feedback.count({
        where: { ...where, status: 'PROCESSED', sentiment: { in: ['URGENT', 'NEGATIVE'] } },
      }),
      this.themesService.getThemeStats(constituencyId),
      this.geoService.getDistrictDemand(constituencyId),
      this.recommendationsService.findAll(constituencyId),
      this.prisma.feedback.findMany({
        where,
        include: { theme: true, district: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.getTimeline(constituencyId),
    ]);

    const topHotspot = districtDemand[0] || null;

    const aiSummary = this.generateSummary(themeStats, districtDemand, recommendations);

    return {
      totalSubmissions,
      activeIssues,
      trendingTopics: themeStats.slice(0, 5),
      districtDemand,
      topHotspot,
      recommendations: recommendations.slice(0, 10),
      recentFeedback,
      timeline,
      aiSummary,
    };
  }

  private async getTimeline(constituencyId?: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const where = constituencyId
      ? { constituencyId, createdAt: { gte: thirtyDaysAgo } }
      : { createdAt: { gte: thirtyDaysAgo } };

    const feedback = await this.prisma.feedback.findMany({
      where,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const byDay = new Map<string, number>();
    for (const f of feedback) {
      const day = f.createdAt.toISOString().split('T')[0];
      byDay.set(day, (byDay.get(day) || 0) + 1);
    }

    return Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));
  }

  private generateSummary(
    themes: { name: string; count: number }[],
    districts: { districtName: string; totalFeedback: number }[],
    recommendations: { title: string; priorityScore: number; citizenRequestCount: number }[],
  ): string {
    const topTheme = themes[0];
    const topDistrict = districts[0];
    const topRec = recommendations[0];

    const parts = [];
    if (topTheme) {
      parts.push(`The most reported issue is ${topTheme.name} with ${topTheme.count} submissions.`);
    }
    if (topDistrict) {
      parts.push(`${topDistrict.districtName} is the highest-demand area with ${topDistrict.totalFeedback} requests.`);
    }
    if (topRec) {
      parts.push(`Top recommended project: "${topRec.title}" (Priority: ${topRec.priorityScore}, based on ${topRec.citizenRequestCount} citizen requests).`);
    }
    return parts.join(' ') || 'No feedback data available yet. Submit citizen feedback to generate insights.';
  }
}
