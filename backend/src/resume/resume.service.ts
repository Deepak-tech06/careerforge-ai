import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import pdfParse from 'pdf-parse';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async processUpload(file: Express.Multer.File, userId: string) {
    // Extract text from PDF buffer with robust text decoding
    const rawText = await this.extractTextFromBuffer(file.buffer);

    // Basic skill keyword extraction
    const parsedSkills = this.extractSkills(rawText);
    // Ensure uniqueness and normalization
    const uniqueSkills = Array.from(
      new Set(parsedSkills.map((s) => s.toLowerCase().trim())),
    );

    const resume = await this.prisma.resume.create({
      data: {
        userId,
        fileName: file.originalname,
        rawText,
        parsedSkills: uniqueSkills,
      },
    });

    return {
      id: resume.id,
      fileName: resume.fileName,
      parsedSkills: uniqueSkills,
      rawText,
    };
  }

  async getUserResumes(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      select: {
        id: true,
        fileName: true,
        parsedSkills: true,
        uploadedAt: true,
        analyses: {
          select: {
            id: true,
            targetRole: true,
            readinessScore: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async getResume(id: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });
    if (!resume) throw new NotFoundException('Resume not found');
    return resume;
  }

  private async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      const str = data.text.replace(/\0/g, '');
      const cleaned = str.replace(/\s+/g, ' ').trim();
      return cleaned.substring(0, 20000);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      // Fallback
      return buffer
        .toString('utf8')
        .replace(/\0/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 20000);
    }
  }

  private extractSkills(text: string): string[] {
    const skillKeywords = [
      // Languages
      'javascript',
      'typescript',
      'python',
      'java',
      'c++',
      'c#',
      'go',
      'rust',
      'kotlin',
      'swift',
      // quick synonyms/variants
      'js',
      'ts',
      'php',
      'ruby',
      'scala',
      'r',
      'matlab',
      // Frontend
      'react',
      'next.js',
      'nextjs',
      'vue',
      'angular',
      'svelte',
      'html',
      'css',
      'tailwind',
      'redux',
      'graphql',
      'webpack',
      // Backend
      'node.js',
      'nodejs',
      'express',
      'nestjs',
      'fastapi',
      'django',
      'flask',
      'spring',
      'asp.net',
      'laravel',
      // Databases
      'postgresql',
      'mysql',
      'mongodb',
      'redis',
      'sqlite',
      'prisma',
      'typeorm',
      'sequelize',
      'elasticsearch',
      // Cloud & DevOps
      'aws',
      'gcp',
      'azure',
      'docker',
      'kubernetes',
      'terraform',
      'nginx',
      'linux',
      'git',
      'github',
      'gitlab',
      'ci/cd',
      'jenkins',
      // AI/ML
      'machine learning',
      'deep learning',
      'tensorflow',
      'pytorch',
      'scikit-learn',
      'nlp',
      'computer vision',
      'pandas',
      'numpy',
      'matplotlib',
      // Other
      'rest api',
      'microservices',
      'jwt',
      'oauth',
      'websocket',
      'kafka',
      'rabbitmq',
      'agile',
      'scrum',
      'jira',
    ];

    const lowerText = text.toLowerCase();
    // Build a candidate set with direct keywords plus a few common shorthand variants
    const candidates = new Set<string>();

    for (const skill of skillKeywords) {
      // Split by spacers and join with optional spacer class to match any spacing/punctuation format
      const parts = skill.split(/[\s.\-/]+/);
      let flexiblePattern = '';
      if (parts.length > 1) {
        flexiblePattern = parts.map((p) => p.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('[\\s.\\-/]*');
      } else {
        flexiblePattern = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      }
      
      const regex = new RegExp(
        `(?:^|[^a-z0-9+#])(${flexiblePattern})(?:[^a-z0-9+#]|$)`,
        'i',
      );
      if (regex.test(lowerText)) {
        candidates.add(skill);
      }
    }

    // Heuristic expansions for common shorthand with boundaries
    if (/(?:^|[^a-z0-9+#])js(?:[^a-z0-9+#]|$)/i.test(lowerText))
      candidates.add('javascript');
    if (/(?:^|[^a-z0-9+#])ts(?:[^a-z0-9+#]|$)/i.test(lowerText))
      candidates.add('typescript');
    if (/(?:^|[^a-z0-9+#])html5(?:[^a-z0-9+#]|$)/i.test(lowerText))
      candidates.add('html');
    if (/(?:^|[^a-z0-9+#])css3(?:[^a-z0-9+#]|$)/i.test(lowerText))
      candidates.add('css');

    return Array.from(candidates);
  }
}
