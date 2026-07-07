import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'List project recommendations' })
  findAll(@Query('constituencyId') constituencyId?: string) {
    return this.recommendationsService.findAll(constituencyId);
  }

  @Post('generate/:constituencyId')
  @ApiOperation({ summary: 'Generate recommendations for a constituency' })
  generate(@Param('constituencyId') constituencyId: string) {
    return this.recommendationsService.generate(constituencyId);
  }
}
