import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ThemeCategory } from '@prisma/client';

interface ScoreInputs {
  demandScore: number;
  impactScore: number;
  costScore: number;
  budgetScore: number;
  planAlignmentScore: number;
}

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  computePriorityScore(scores: ScoreInputs): number {
    const weights = {
      demand: 0.35,
      impact: 0.25,
      cost: 0.15,
      budget: 0.15,
      plan: 0.10,
    };
    const costFactor = 100 - scores.costScore;
    return Math.round(
      scores.demandScore * weights.demand +
      scores.impactScore * weights.impact +
      costFactor * weights.cost +
      scores.budgetScore * weights.budget +
      scores.planAlignmentScore * weights.plan
    );
  }

  async generate(constituencyId: string) {
    const constituency = await this.prisma.constituency.findUnique({
      where: { id: constituencyId },
      include: {
        districts: {
          include: {
            feedback: { include: { theme: true } },
            publicDatasets: true,
          },
        },
      },
    });

    if (!constituency) return [];

    await this.prisma.projectRecommendation.deleteMany({
      where: { constituencyId },
    });

    const themeCounts = new Map<ThemeCategory, { count: number; districts: Set<string> }>();

    for (const district of constituency.districts) {
      for (const feedback of district.feedback) {
        const cat = feedback.theme?.category || ThemeCategory.OTHER;
        const entry = themeCounts.get(cat) || { count: 0, districts: new Set() };
        entry.count++;
        entry.districts.add(district.id);
        themeCounts.set(cat, entry);
      }
    }

    const maxCount = Math.max(...Array.from(themeCounts.values()).map((v) => v.count), 1);
    const recommendations = [];

    const projectTemplates: Record<ThemeCategory, { title: string; description: string; baseCost: number }> = {
      ROAD_INFRASTRUCTURE: { title: 'Road Repair & Upgrade', description: 'Repair potholes and upgrade road infrastructure in high-demand areas', baseCost: 60 },
      WATER_SUPPLY: { title: 'Water Pipeline Extension', description: 'Extend drinking water pipelines to underserved villages', baseCost: 50 },
      EDUCATION: { title: 'School Infrastructure Upgrade', description: 'Upgrade government schools with classrooms, labs, and sanitation', baseCost: 70 },
      HEALTHCARE: { title: 'Primary Health Centre Upgrade', description: 'Strengthen PHC facilities and add emergency services', baseCost: 65 },
      PUBLIC_TRANSPORT: { title: 'Bus Service Expansion', description: 'Add bus routes connecting rural areas to district headquarters', baseCost: 55 },
      EMPLOYMENT: { title: 'Vocational Training Centre', description: 'Establish skill development centre for youth employment', baseCost: 75 },
      ELECTRICITY: { title: 'Power Infrastructure Upgrade', description: 'Install transformers and stabilize power supply', baseCost: 45 },
      SANITATION: { title: 'Sanitation & Drainage Project', description: 'Improve drainage systems and waste management', baseCost: 40 },
      AGRICULTURE: { title: 'Irrigation Canal Repair', description: 'Repair irrigation canals and support farmer access to water', baseCost: 50 },
      OTHER: { title: 'General Development Project', description: 'Address miscellaneous citizen development requests', baseCost: 50 },
    };

    for (const [category, data] of themeCounts) {
      const template = projectTemplates[category];
      const demandScore = Math.min(100, (data.count / maxCount) * 100);

      const affectedDistricts = constituency.districts.filter((d) =>
        d.feedback.some((f) => f.theme?.category === category),
      );

      let avgPopulation = 0;
      let avgLiteracy = 0;
      let avgRoadCondition = 50;
      let avgWaterCoverage = 50;

      for (const d of affectedDistricts) {
        avgPopulation += d.population || 0;
        avgLiteracy += d.literacyRate || 0;
        avgRoadCondition += d.roadConditionIndex || 50;
        avgWaterCoverage += d.waterCoverage || 50;
      }
      const n = affectedDistricts.length || 1;
      avgPopulation = Math.round(avgPopulation / n);
      avgLiteracy = avgLiteracy / n;
      avgRoadCondition = avgRoadCondition / n;
      avgWaterCoverage = avgWaterCoverage / n;

      let impactScore = 50;
      if (category === ThemeCategory.EDUCATION) {
        impactScore = Math.min(100, (100 - avgLiteracy) * 1.5 + demandScore * 0.3);
      } else if (category === ThemeCategory.ROAD_INFRASTRUCTURE) {
        impactScore = Math.min(100, (100 - avgRoadCondition) + demandScore * 0.2);
      } else if (category === ThemeCategory.WATER_SUPPLY) {
        impactScore = Math.min(100, (100 - avgWaterCoverage) + demandScore * 0.3);
      } else {
        impactScore = Math.min(100, demandScore * 0.8 + (avgPopulation / 100000) * 20);
      }

      const costScore = template.baseCost;
      const budgetScore = 70;
      const planAlignmentScore = 60;

      const priorityScore = this.computePriorityScore({
        demandScore,
        impactScore,
        costScore,
        budgetScore,
        planAlignmentScore,
      });

      const boostedPriority = (category === ThemeCategory.WATER_SUPPLY || category === ThemeCategory.HEALTHCARE)
        ? Math.max(priorityScore, 80)
        : priorityScore;

      const rec = await this.prisma.projectRecommendation.create({
        data: {
          title: template.title,
          description: template.description,
          themeCategory: category,
          constituencyId,
          demandScore: Math.round(demandScore),
          impactScore: Math.round(impactScore),
          costScore,
          budgetScore,
          planAlignmentScore,
          priorityScore: boostedPriority,
          citizenRequestCount: data.count,
          affectedPopulation: avgPopulation * data.districts.size,
          estimatedCost: costScore <= 50 ? 'Medium' : costScore <= 70 ? 'High' : 'Very High',
          rationale: `${data.count} citizen requests across ${data.districts.size} district(s). ` +
            `Population impact: ~${(avgPopulation * data.districts.size).toLocaleString()} residents. ` +
            `Demand intensity: ${Math.round(demandScore)}%.`,
        },
      });
      recommendations.push(rec);
    }

    const ranked = recommendations.sort((a, b) => {
      const aEssential = a.themeCategory === ThemeCategory.WATER_SUPPLY || a.themeCategory === ThemeCategory.HEALTHCARE;
      const bEssential = b.themeCategory === ThemeCategory.WATER_SUPPLY || b.themeCategory === ThemeCategory.HEALTHCARE;
      if (aEssential !== bEssential) return bEssential ? 1 : -1;
      return b.priorityScore - a.priorityScore;
    });
    for (let i = 0; i < ranked.length; i++) {
      await this.prisma.projectRecommendation.update({
        where: { id: ranked[i].id },
        data: { rank: i + 1 },
      });
    }

    return this.prisma.projectRecommendation.findMany({
      where: { constituencyId },
      orderBy: { priorityScore: 'desc' },
    });
  }

  async findAll(constituencyId?: string) {
    return this.prisma.projectRecommendation.findMany({
      where: constituencyId ? { constituencyId } : undefined,
      orderBy: { priorityScore: 'desc' },
    });
  }
}
