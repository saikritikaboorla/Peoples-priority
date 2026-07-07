import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GeoService } from './geo.service';

@ApiTags('geo')
@Controller('geo')
export class GeoController {
  constructor(private geoService: GeoService) {}

  @Get('heatmap')
  @ApiOperation({ summary: 'Geographic demand heatmap data' })
  getHeatmap(
    @Query('constituencyId') constituencyId?: string,
    @Query('themeId') themeId?: string,
  ) {
    return this.geoService.getHeatmap(constituencyId, themeId);
  }

  @Get('district-demand')
  @ApiOperation({ summary: 'Demand breakdown by district' })
  getDistrictDemand(@Query('constituencyId') constituencyId?: string) {
    return this.geoService.getDistrictDemand(constituencyId);
  }

  @Get('constituencies')
  @ApiOperation({ summary: 'List constituencies' })
  getConstituencies() {
    return this.geoService.getConstituencies();
  }

  @Get('districts')
  @ApiOperation({ summary: 'List districts' })
  getDistricts(@Query('constituencyId') constituencyId?: string) {
    return this.geoService.getDistricts(constituencyId);
  }
}
