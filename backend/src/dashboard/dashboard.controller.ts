import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'MP dashboard overview with all key metrics' })
  getOverview(@Query('constituencyId') constituencyId?: string) {
    return this.dashboardService.getOverview(constituencyId);
  }
}
