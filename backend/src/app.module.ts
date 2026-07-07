import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AiModule } from './ai/ai.module';
import { ThemesModule } from './themes/themes.module';
import { GeoModule } from './geo/geo.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { PublicDataModule } from './public-data/public-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AiModule,
    AuthModule,
    FeedbackModule,
    ThemesModule,
    GeoModule,
    PublicDataModule,
    RecommendationsModule,
    DashboardModule,
  ],
})
export class AppModule {}
