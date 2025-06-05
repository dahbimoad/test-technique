import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';

export interface ProjectAnalysisResponse {
  healthScore: number; // 0-100
  riskFactors: string[];
  recommendations: string[];
  predictedCompletionDate: string;
  bottlenecks: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('OpenAI API key not found. AI features will be disabled.');
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Auto-suggest tags for projects/tasks based on content
   */  async suggestTags(content: string, projectId?: string): Promise<string[]> {
    if (!this.openai) {
      throw new BadRequestException('AI features are not available. OpenAI API key not configured.');
    }

    // Get existing tags for context
    const existingTags = await this.prisma.tag.findMany({
      select: { name: true },
      take: 50, // Get top 50 most common tags
    });

    const existingTagNames = existingTags.map(tag => tag.name);

    const prompt = `
    Analyze this content and suggest 3-5 relevant tags:
    
    Content: "${content}"
    
    Existing tags in system: ${existingTagNames.join(', ')}
    
    Rules:
    1. Prefer existing tags when relevant
    2. Suggest new tags only if they add significant value
    3. Keep tags lowercase and concise
    4. Focus on technology, domain, and priority tags
    
    Return only a JSON object with tags array: {"tags": ["tag1", "tag2", "tag3"]}
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a tagging expert. Return only a JSON object with a tags array.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const response = JSON.parse(completion.choices[0].message.content || '{"tags": []}');
      return Array.isArray(response.tags) ? response.tags : [];
    } catch (error) {
      this.logger.error('Error suggesting tags:', error);
      return [];
    }
  }

  /**
   * Analyze project health and provide insights
   */  async analyzeProject(projectId: string): Promise<ProjectAnalysisResponse> {
    if (!this.openai) {
      throw new BadRequestException('AI features are not available. OpenAI API key not configured.');
    }

    // Get project data
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          select: {
            title: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        memberships: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        _count: {
          select: { tasks: true, memberships: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    const projectData = {
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      tasksCount: project._count.tasks,
      membersCount: project._count.memberships,
      tasks: project.tasks,
    };

    const prompt = this.buildProjectAnalysisPrompt(projectData);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a project management expert. Analyze project data and provide insights in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return this.validateProjectAnalysis(response);    } catch (error) {
      this.logger.error('Error analyzing project:', error);
      throw new BadRequestException('Failed to analyze project. Please try again later.');
    }
  }

  /**
   * Generate project summary and recommendations
   */  async generateProjectSummary(projectId: string): Promise<string> {
    if (!this.openai) {
      throw new BadRequestException('AI features are not available. OpenAI API key not configured.');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        projectTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    const prompt = `
    Generate a concise project summary for:
    
    Project: ${project.name}
    Description: ${project.description}
    Tasks: ${project.tasks.length}
    Tags: ${project.projectTags.map(pt => pt.tag.name).join(', ')}
    
    Provide a 2-3 sentence executive summary focusing on goals, progress, and key technologies.
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a technical writer. Create concise, professional project summaries.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      return completion.choices[0].message.content?.trim() || 'Unable to generate summary';    } catch (error) {
      this.logger.error('Error generating project summary:', error);
      throw new BadRequestException('Failed to generate project summary. Please try again later.');
    }
  }

  private buildProjectAnalysisPrompt(projectData: any): string {
    return `
    Analyze this project data and provide insights:
    
    ${JSON.stringify(projectData, null, 2)}
    
    Provide analysis in JSON format:
    {
      "healthScore": number (0-100),
      "riskFactors": ["risk 1", "risk 2"],
      "recommendations": ["recommendation 1", "recommendation 2"],
      "predictedCompletionDate": "YYYY-MM-DD",
      "bottlenecks": ["bottleneck 1", "bottleneck 2"]
    }
    
    Base your analysis on task distribution, timeline, and project scope.
    `;
  }

  private validateProjectAnalysis(response: any): ProjectAnalysisResponse {
    return {
      healthScore: Math.min(100, Math.max(0, Number(response.healthScore) || 75)),
      riskFactors: Array.isArray(response.riskFactors) ? response.riskFactors : [],
      recommendations: Array.isArray(response.recommendations) ? response.recommendations : [],
      predictedCompletionDate: response.predictedCompletionDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bottlenecks: Array.isArray(response.bottlenecks) ? response.bottlenecks : [],
    };
  }
}
