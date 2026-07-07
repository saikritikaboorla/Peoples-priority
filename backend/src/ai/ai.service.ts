import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { THEME_KEYWORDS, INDIAN_LANGUAGES } from './constants';
import { ThemeCategory, Sentiment } from '@prisma/client';

export interface ProcessedText {
  detectedLanguage: string;
  translatedContent: string;
  theme: { name: string; category: ThemeCategory };
  keywords: string[];
  sentiment: Sentiment;
  summary: string;
}

export interface ImageAnalysisResult {
  description: string;
  classification: string;
  suggestedTheme: string;
}

@Injectable()
export class AiService {
  constructor(private config: ConfigService) {}

  async transcribeAudio(_buffer: Buffer, _mimeType: string): Promise<string> {
    const whisperUrl = this.config.get('WHISPER_API_URL');
    if (whisperUrl) {
      // Production: POST audio to Whisper API
      return 'Transcription via Whisper API (configure WHISPER_API_URL)';
    }
    return 'My village has no proper drinking water supply. The pipeline is broken for months.';
  }

  detectLanguage(text: string): string {
    const hindiPattern = /[\u0900-\u097F]/;
    const tamilPattern = /[\u0B80-\u0BFF]/;
    const teluguPattern = /[\u0C00-\u0C7F]/;
    const bengaliPattern = /[\u0980-\u09FF]/;

    if (hindiPattern.test(text)) return 'hi';
    if (tamilPattern.test(text)) return 'ta';
    if (teluguPattern.test(text)) return 'te';
    if (bengaliPattern.test(text)) return 'bn';
    return 'en';
  }

  async translate(text: string, fromLang: string): Promise<string> {
    if (fromLang === 'en') return text;
    const apiKey = this.config.get('OPENAI_API_KEY');
    if (apiKey) {
      // Production: call translation API
      return text;
    }
    return `[Translated from ${fromLang}] ${text}`;
  }

  extractKeywords(text: string): string[] {
    const words = text.toLowerCase().replace(/[^\w\s\u0900-\u097F]/g, '').split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'my', 'our', 'no', 'not']);
    return [...new Set(words.filter((w) => w.length > 2 && !stopWords.has(w)))].slice(0, 10);
  }

  classifyTheme(text: string): { name: string; category: ThemeCategory } {
    const lower = text.toLowerCase();
    let bestMatch: { name: string; category: ThemeCategory; score: number } = {
      name: 'Other',
      category: ThemeCategory.OTHER,
      score: 0,
    };

    for (const [name, config] of Object.entries(THEME_KEYWORDS)) {
      let score = 0;
      for (const kw of config.keywords) {
        if (lower.includes(kw.toLowerCase())) score++;
      }
      if (score > bestMatch.score) {
        bestMatch = { name, category: config.category as ThemeCategory, score };
      }
    }
    return { name: bestMatch.name, category: bestMatch.category };
  }

  analyzeSentiment(text: string): Sentiment {
    const lower = text.toLowerCase();
    const urgentWords = ['urgent', 'emergency', 'critical', 'immediate', 'danger', 'broken', 'no water', 'no electricity'];
    const negativeWords = ['bad', 'poor', 'worst', 'failed', 'corrupt', 'neglect', 'unsafe'];
    const positiveWords = ['good', 'improve', 'better', 'thank', 'appreciate'];

    if (urgentWords.some((w) => lower.includes(w))) return Sentiment.URGENT;
    if (negativeWords.some((w) => lower.includes(w))) return Sentiment.NEGATIVE;
    if (positiveWords.some((w) => lower.includes(w))) return Sentiment.POSITIVE;
    return Sentiment.NEUTRAL;
  }

  generateSummary(text: string, theme: string): string {
    const truncated = text.length > 200 ? text.slice(0, 200) + '...' : text;
    return `Citizen reports issue related to ${theme}: "${truncated}"`;
  }

  async processText(rawContent: string): Promise<ProcessedText> {
    const detectedLanguage = this.detectLanguage(rawContent);
    const translatedContent = await this.translate(rawContent, detectedLanguage);
    const theme = this.classifyTheme(translatedContent);
    const keywords = this.extractKeywords(translatedContent);
    const sentiment = this.analyzeSentiment(translatedContent);
    const summary = this.generateSummary(translatedContent, theme.name);

    return {
      detectedLanguage,
      translatedContent,
      theme,
      keywords,
      sentiment,
      summary,
    };
  }

  async analyzeImage(_buffer: Buffer, _mimeType: string): Promise<ImageAnalysisResult> {
    const apiKey = this.config.get('OPENAI_API_KEY');
    if (apiKey) {
      // Production: vision API call
    }
    return {
      description: 'Image shows damaged road infrastructure with visible potholes and cracked surface.',
      classification: 'ROAD_DAMAGE',
      suggestedTheme: 'Road Infrastructure',
    };
  }

  computeSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = [...words1].filter((w) => words2.has(w));
    const union = new Set([...words1, ...words2]);
    return union.size > 0 ? intersection.length / union.size : 0;
  }

  findDuplicateGroupId(content: string, existing: { id: string; content: string; groupId: string | null }[]): string | null {
    for (const item of existing) {
      const similarity = this.computeSimilarity(content, item.content);
      if (similarity > 0.6) {
        return item.groupId || item.id;
      }
    }
    return null;
  }
}
