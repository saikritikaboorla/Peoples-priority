import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicDataService {
  constructor(private prisma: PrismaService) {}

  async findAll(districtId?: string) {
    return this.prisma.publicDataset.findMany({
      where: districtId ? { districtId } : undefined,
      include: { district: true },
    });
  }

  async getDistrictIndicators(districtId: string) {
    const district = await this.prisma.district.findUnique({
      where: { id: districtId },
      include: { publicDatasets: true },
    });
    if (!district) return null;

    return {
      district: district.name,
      population: district.population,
      literacyRate: district.literacyRate,
      schoolEnrollment: district.schoolEnrollment,
      hospitalCount: district.hospitalCount,
      roadConditionIndex: district.roadConditionIndex,
      waterCoverage: district.waterCoverage,
      employmentRate: district.employmentRate,
      datasets: district.publicDatasets,
    };
  }
}
