import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionChannel, SubmissionType } from '@prisma/client';

export class CreateFeedbackDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rawContent?: string;

  @ApiPropertyOptional({ enum: SubmissionChannel })
  @IsOptional()
  @IsEnum(SubmissionChannel)
  channel?: SubmissionChannel;

  @ApiPropertyOptional({ enum: SubmissionType })
  @IsOptional()
  @IsEnum(SubmissionType)
  submissionType?: SubmissionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  citizenId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  districtId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  constituencyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detectedLanguage?: string;
}

export class FeedbackQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  themeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  districtId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  constituencyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;
}
