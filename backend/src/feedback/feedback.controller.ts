import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, FeedbackQueryDto } from './dto/feedback.dto';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit citizen feedback (text, voice, or image)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 5))
  async create(
    @Body() dto: CreateFeedbackDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.feedbackService.create(dto, files);
  }

  @Get()
  @ApiOperation({ summary: 'List feedback with filters' })
  async findAll(@Query() query: FeedbackQueryDto) {
    return this.feedbackService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Feedback statistics' })
  async getStats(@Query('constituencyId') constituencyId?: string) {
    return this.feedbackService.getStats(constituencyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feedback by ID' })
  async findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(id);
  }
}
