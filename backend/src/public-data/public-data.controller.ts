import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicDataService } from './public-data.service';

@ApiTags('public-data')
@Controller('public-data')
export class PublicDataController {
  constructor(private publicDataService: PublicDataService) {}

  @Get()
  @ApiOperation({ summary: 'List public datasets' })
  findAll(@Query('districtId') districtId?: string) {
    return this.publicDataService.findAll(districtId);
  }

  @Get('district/:districtId')
  @ApiOperation({ summary: 'District demographic and infrastructure indicators' })
  getDistrictIndicators(@Param('districtId') districtId: string) {
    return this.publicDataService.getDistrictIndicators(districtId);
  }
}
