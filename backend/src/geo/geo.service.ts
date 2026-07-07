import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
  theme?: string;
  district?: string;
}

export interface DistrictDemand {
  districtId: string;
  districtName: string;
  totalFeedback: number;
  byTheme: Record<string, number>;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class GeoService {
  constructor(private prisma: PrismaService) {}

  async getHeatmap(constituencyId?: string, themeId?: string): Promise<HeatmapPoint[]> {
    const where: Record<string, unknown> = {
      latitude: { not: null },
      longitude: { not: null },
    };
    if (constituencyId) where.constituencyId = constituencyId;
    if (themeId) where.themeId = themeId;

    const feedback = await this.prisma.feedback.findMany({
      where,
      include: { theme: true, district: true },
    });

    const clusters = new Map<string, HeatmapPoint>();

    for (const f of feedback) {
      const key = `${f.latitude!.toFixed(2)},${f.longitude!.toFixed(2)}`;
      const existing = clusters.get(key);
      if (existing) {
        existing.weight++;
      } else {
        clusters.set(key, {
          latitude: f.latitude!,
          longitude: f.longitude!,
          weight: 1,
          theme: f.theme?.name,
          district: f.district?.name,
        });
      }
    }

    return Array.from(clusters.values());
  }

  async getDistrictDemand(constituencyId?: string): Promise<DistrictDemand[]> {
    const districts = await this.prisma.district.findMany({
      where: constituencyId ? { constituencyId } : undefined,
      include: {
        feedback: { include: { theme: true } },
      },
    });

    return districts.map((d) => {
      const byTheme: Record<string, number> = {};
      for (const f of d.feedback) {
        const themeName = f.theme?.name || 'Other';
        byTheme[themeName] = (byTheme[themeName] || 0) + 1;
      }
      return {
        districtId: d.id,
        districtName: d.name,
        totalFeedback: d.feedback.length,
        byTheme,
        latitude: d.latitude ?? undefined,
        longitude: d.longitude ?? undefined,
      };
    }).sort((a, b) => b.totalFeedback - a.totalFeedback);
  }

  async getConstituencies() {
    return this.prisma.constituency.findMany({
      include: { districts: true },
    });
  }

  async getDistricts(constituencyId?: string) {
    return this.prisma.district.findMany({
      where: constituencyId ? { constituencyId } : undefined,
    });
  }
}
