import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyzeDto } from './dto/analyze.dto';

// Role-based skill requirements database for fallback if AI service fails
const ROLE_SKILLS: Record<string, string[]> = {
  'Frontend Developer': [
    'javascript',
    'typescript',
    'react',
    'html',
    'css',
    'tailwind',
    'nextjs',
    'redux',
    'graphql',
    'webpack',
    'git',
    'rest api',
  ],
  'Backend Developer': [
    'javascript',
    'typescript',
    'nodejs',
    'express',
    'nestjs',
    'postgresql',
    'mongodb',
    'redis',
    'docker',
    'rest api',
    'jwt',
    'git',
    'linux',
  ],
  'Full Stack Developer': [
    'javascript',
    'typescript',
    'react',
    'nodejs',
    'express',
    'postgresql',
    'mongodb',
    'docker',
    'git',
    'rest api',
    'html',
    'css',
    'jwt',
  ],
  'Data Scientist': [
    'python',
    'machine learning',
    'deep learning',
    'pandas',
    'numpy',
    'scikit-learn',
    'tensorflow',
    'pytorch',
    'matplotlib',
    'sql',
    'git',
  ],
  'DevOps Engineer': [
    'linux',
    'docker',
    'kubernetes',
    'aws',
    'terraform',
    'ci/cd',
    'nginx',
    'git',
    'python',
    'bash',
    'monitoring',
  ],
  'ML Engineer': [
    'python',
    'machine learning',
    'deep learning',
    'tensorflow',
    'pytorch',
    'scikit-learn',
    'docker',
    'aws',
    'git',
    'rest api',
    'nlp',
  ],
  'Mobile Developer': [
    'react',
    'javascript',
    'typescript',
    'swift',
    'kotlin',
    'git',
    'rest api',
    'firebase',
    'redux',
  ],
  'Cloud Engineer': [
    'aws',
    'gcp',
    'azure',
    'docker',
    'kubernetes',
    'terraform',
    'linux',
    'python',
    'networking',
    'security',
    'git',
  ],
};

function normalizeSkill(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9+#]/g, '');
  const synonyms: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    cpp: 'c++',
    csharp: 'c#',
    reactjs: 'react',
    'react.js': 'react',
    postgres: 'postgresql',
    mongodb: 'mongo',
    kubernetes: 'k8s',
    googlecloud: 'gcp',
    googlecloudplatform: 'gcp',
    amazonwebservices: 'aws',
  };
  return synonyms[clean] || clean;
}

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(private prisma: PrismaService) {}

  async analyze(dto: AnalyzeDto, userId: string) {
    // Verify resume belongs to user
    const resume = await this.prisma.resume.findFirst({
      where: { id: dto.resumeId, userId },
    });
    if (!resume) throw new NotFoundException('Resume not found');

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    let readinessScore = 0;
    let matchedSkills: string[] = [];
    let skillGaps: string[] = [];
    let steps: any[] = [];

    const userSkills = resume.parsedSkills.map((s) => s.toLowerCase());

    try {
      this.logger.log(`Calling AI Service at ${aiServiceUrl}/analyze`);
      const response = await fetch(`${aiServiceUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: resume.rawText,
          extracted_skills: userSkills,
          target_role: dto.targetRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Service returned ${response.status}`);
      }

      const data = await response.json();
      readinessScore = data.readiness_score;
      matchedSkills = data.matched_skills;
      skillGaps = data.skill_gaps;
      steps = data.roadmap;
    } catch (error: any) {
      this.logger.warn(
        `AI Service failed (${error.message}). Falling back to local algorithm.`,
      );

      const roleSkills =
        ROLE_SKILLS[dto.targetRole] || ROLE_SKILLS['Full Stack Developer'];

      // Fallback Algorithm
      matchedSkills = roleSkills.filter((skill) => {
        const reqNorm = normalizeSkill(skill);
        return userSkills.some((us) => {
          const usNorm = normalizeSkill(us);
          if (reqNorm === usNorm) return true;
          if (reqNorm.length > 3 && usNorm.length > 3) {
            return reqNorm.includes(usNorm) || usNorm.includes(reqNorm);
          }
          return false;
        });
      });
      skillGaps = roleSkills.filter(
        (skill) => !matchedSkills.includes(skill),
      );

      const coreSkillWeight = 1.5;
      const coreSkills = roleSkills.slice(0, 4);
      let weightedScore = 0;
      let totalWeight = 0;

      roleSkills.forEach((skill) => {
        const weight = coreSkills.includes(skill) ? coreSkillWeight : 1;
        totalWeight += weight;
        if (matchedSkills.includes(skill)) weightedScore += weight;
      });

      readinessScore = Math.round((weightedScore / totalWeight) * 100);
      steps = this.generateFallbackRoadmap(skillGaps, dto.targetRole);
    }

    // Save to DB
    const analysis = await this.prisma.analysis.create({
      data: {
        resumeId: resume.id,
        targetRole: dto.targetRole,
        readinessScore,
        extractedSkills: userSkills,
        matchedSkills,
        skillGaps,
      },
    });

    const roadmap = await this.prisma.roadmap.create({
      data: { analysisId: analysis.id, steps },
    });

    return {
      analysis: {
        id: analysis.id,
        targetRole: dto.targetRole,
        readinessScore,
        extractedSkills: userSkills,
        matchedSkills,
        skillGaps,
      },
      roadmap: { id: roadmap.id, steps },
    };
  }

  async getAnalysis(id: string, userId: string) {
    const analysis = await this.prisma.analysis.findFirst({
      where: {
        id,
        resume: { userId },
      },
      include: { roadmap: true },
    });
    if (!analysis) throw new NotFoundException('Analysis not found');
    return analysis;
  }

  async getMyAnalyses(userId: string) {
    return this.prisma.analysis.findMany({
      where: { resume: { userId } },
      include: { roadmap: true, resume: { select: { fileName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  getAvailableRoles(): string[] {
    return Object.keys(ROLE_SKILLS);
  }

  private generateFallbackRoadmap(skillGaps: string[], role: string): any[] {
    const resourceMap: Record<
      string,
      { resource: string; url: string; duration: string }
    > = {
      javascript: {
        resource: 'JavaScript.info',
        url: 'https://javascript.info',
        duration: '3 weeks',
      },
      typescript: {
        resource: 'TypeScript Docs',
        url: 'https://www.typescriptlang.org/docs/',
        duration: '2 weeks',
      },
      react: {
        resource: 'React Docs',
        url: 'https://react.dev',
        duration: '3 weeks',
      },
      nodejs: {
        resource: 'Node.js Guide',
        url: 'https://nodejs.org/en/learn',
        duration: '2 weeks',
      },
      python: {
        resource: 'Python.org Tutorial',
        url: 'https://docs.python.org/3/tutorial/',
        duration: '2 weeks',
      },
      docker: {
        resource: 'Docker Docs',
        url: 'https://docs.docker.com/get-started/',
        duration: '1 week',
      },
      aws: {
        resource: 'AWS Free Training',
        url: 'https://aws.amazon.com/training/',
        duration: '4 weeks',
      },
      postgresql: {
        resource: 'PostgreSQL Tutorial',
        url: 'https://www.postgresqltutorial.com',
        duration: '1 week',
      },
      mongodb: {
        resource: 'MongoDB University',
        url: 'https://university.mongodb.com',
        duration: '1 week',
      },
      'machine learning': {
        resource: 'Fast.ai',
        url: 'https://www.fast.ai',
        duration: '6 weeks',
      },
      kubernetes: {
        resource: 'Kubernetes Docs',
        url: 'https://kubernetes.io/docs/tutorials/',
        duration: '3 weeks',
      },
      git: {
        resource: 'Pro Git Book',
        url: 'https://git-scm.com/book',
        duration: '3 days',
      },
      tensorflow: {
        resource: 'TensorFlow Tutorials',
        url: 'https://www.tensorflow.org/tutorials',
        duration: '4 weeks',
      },
      pytorch: {
        resource: 'PyTorch Tutorials',
        url: 'https://pytorch.org/tutorials/',
        duration: '4 weeks',
      },
      'scikit-learn': {
        resource: 'Scikit-learn Docs',
        url: 'https://scikit-learn.org/stable/getting_started.html',
        duration: '2 weeks',
      },
    };

    const priorities = ['High', 'High', 'Medium', 'Medium', 'Low'];

    return skillGaps.slice(0, 8).map((skill, i) => {
      const res = resourceMap[skill] || {
        resource: `${skill} Documentation`,
        url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorial')}`,
        duration: '1-2 weeks',
      };
      return {
        title: `Learn ${skill}`,
        description: `Learn ${skill} to strengthen your ${role} profile`,
        priority: priorities[i] || 'Low',
        completed: false,
        resources: [
          { type: 'documentation', title: res.resource, url: res.url },
        ],
      };
    });
  }
}
