import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { StorageService } from '../storage/storage.service';
import { CreateFeedbackDto, FeedbackQueryDto } from './dto/feedback.dto';
import { FeedbackStatus, SubmissionType } from '@prisma/client';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private storage: StorageService,
  ) {}

  async create(dto: CreateFeedbackDto, files?: Express.Multer.File[]) {
    let rawContent = dto.rawContent || '';
    let submissionType = dto.submissionType || SubmissionType.TEXT;

    const feedback = await this.prisma.feedback.create({
      data: {
        rawContent,
        channel: dto.channel || 'WEB',
        submissionType,
        isAnonymous: dto.isAnonymous ?? true,
        citizenId: dto.citizenId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        locationName: dto.locationName,
        districtId: dto.districtId,
        constituencyId: dto.constituencyId,
        status: FeedbackStatus.PROCESSING,
      },
    });

    if (files?.length) {
      for (const file of files) {
        const url = await this.storage.upload(file, 'feedback');
        let aiDescription: string | undefined;
        let aiClassification: string | undefined;

        if (file.mimetype.startsWith('image/')) {
          submissionType = SubmissionType.MIXED;
          const analysis = await this.ai.analyzeImage(file.buffer, file.mimetype);
          aiDescription = analysis.description;
          aiClassification = analysis.classification;
          if (!rawContent) rawContent = analysis.description;
        } else if (file.mimetype.startsWith('audio/')) {
          submissionType = SubmissionType.VOICE;
          rawContent = await this.ai.transcribeAudio(file.buffer, file.mimetype);
        }

        await this.prisma.mediaAttachment.create({
          data: {
            feedbackId: feedback.id,
            type: file.mimetype.startsWith('audio/') ? 'audio' : 'image',
            url,
            mimeType: file.mimetype,
            fileName: file.originalname,
            aiDescription,
            aiClassification,
          },
        });
      }
    }

    const processed = await this.ai.processText(rawContent);

    let theme = await this.prisma.theme.findFirst({
      where: { category: processed.theme.category },
    });
    if (!theme) {
      theme = await this.prisma.theme.create({
        data: {
          name: processed.theme.name,
          category: processed.theme.category,
          keywords: processed.keywords,
        },
      });
    } else {
      await this.prisma.theme.update({
        where: { id: theme.id },
        data: { feedbackCount: { increment: 1 } },
      });
    }

    const recentFeedback = await this.prisma.feedback.findMany({
      where: { themeId: theme.id, id: { not: feedback.id } },
      select: { id: true, processedContent: true, duplicateGroupId: true },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    const duplicateGroupId = this.ai.findDuplicateGroupId(
      processed.translatedContent,
      recentFeedback.map((f) => ({
        id: f.id,
        content: f.processedContent || '',
        groupId: f.duplicateGroupId,
      })),
    );

    const updated = await this.prisma.feedback.update({
      where: { id: feedback.id },
      data: {
        rawContent,
        processedContent: processed.translatedContent,
        detectedLanguage: processed.detectedLanguage,
        translatedContent: processed.translatedContent,
        sentiment: processed.sentiment,
        themeId: theme.id,
        keywords: processed.keywords,
        aiSummary: processed.summary,
        duplicateGroupId: duplicateGroupId || feedback.id,
        submissionType,
        status: FeedbackStatus.PROCESSED,
      },
      include: { theme: true, media: true, district: true },
    });

    return updated;
  }

  async findAll(query: FeedbackQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.themeId) where.themeId = query.themeId;
    if (query.districtId) where.districtId = query.districtId;
    if (query.constituencyId) where.constituencyId = query.constituencyId;
    if (query.status) where.status = query.status;
    if (query.channel) where.channel = query.channel;
    if (query.search) {
      where.OR = [
        { rawContent: { contains: query.search, mode: 'insensitive' } },
        { processedContent: { contains: query.search, mode: 'insensitive' } },
        { locationName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        include: { theme: true, district: true, media: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.feedback.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: { theme: true, district: true, media: true, constituency: true },
    });
    if (!feedback) throw new NotFoundException('Feedback not found');
    return feedback;
  }

  async getStats(constituencyId?: string) {
    const where = constituencyId ? { constituencyId } : {};

    const [total, byStatus, byChannel, recentCount] = await Promise.all([
      this.prisma.feedback.count({ where }),
      this.prisma.feedback.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.feedback.groupBy({
        by: ['channel'],
        where,
        _count: true,
      }),
      this.prisma.feedback.count({
        where: {
          ...where,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return { total, byStatus, byChannel, recentCount };
  }
}
