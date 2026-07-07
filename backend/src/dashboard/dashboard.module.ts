import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ThemesModule } from '../themes/themes.module';
import { GeoModule } from '../geo/geo.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [ThemesModule, GeoModule, RecommendationsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
