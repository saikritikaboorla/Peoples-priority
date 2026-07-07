import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ThemesService } from './themes.service';

@ApiTags('themes')
@Controller('themes')
export class ThemesController {
  constructor(private themesService: ThemesService) {}

  @Get()
  @ApiOperation({ summary: 'List all themes' })
  findAll() {
    return this.themesService.findAll();
  }

  @Get('trending')
  @ApiOperation({ summary: 'Trending development topics' })
  getTrending(@Query('limit') limit?: number) {
    return this.themesService.getTrending(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Theme statistics with counts' })
  getStats(@Query('constituencyId') constituencyId?: string) {
    return this.themesService.getThemeStats(constituencyId);
  }
}
