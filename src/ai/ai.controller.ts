import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AiService, ProjectAnalysisResponse } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '@prisma/client';
import {
  SuggestTagsDto,
  ProjectAnalysisResponseDto,
  TagSuggestionsResponseDto,
  ProjectSummaryResponseDto,
} from './dto';

/**
 * Controller for AI-powered features
 * Provides intelligent auto-tagging, project analysis, and project summaries
 */
@ApiTags('AI Features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {  constructor(private readonly aiService: AiService) {}

  /**
   * Get AI-powered tag suggestions for content
   */
  @Post('suggest-tags')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get AI tag suggestions',
    description: 'Analyzes content and suggests relevant tags based on existing tags and content analysis',
  })
  @ApiBody({
    type: SuggestTagsDto,
    description: 'Content to analyze for tag suggestions',
  })
  @ApiResponse({
    status: 200,
    description: 'Tag suggestions generated successfully',
    type: TagSuggestionsResponseDto,
    example: {
      suggestions: ['frontend', 'react', 'typescript', 'ui/ux', 'responsive'],
      confidence: 0.85,
    },
  })  @ApiResponse({
    status: 400,
    description: 'Bad request - AI features not available or invalid input',
    example: {
      statusCode: 400,
      message: 'AI features are not available. OpenAI API key not configured.',
      error: 'Bad Request',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  async suggestTags(
    @Body() suggestTagsDto: SuggestTagsDto,
    @GetUser() user: User,
  ): Promise<TagSuggestionsResponseDto> {
    const suggestions = await this.aiService.suggestTags(
      suggestTagsDto.content,
      suggestTagsDto.projectId,
    );

    return {
      suggestions,
      confidence: 0.85, // You could implement actual confidence scoring
    };
  }

  /**
   * Analyze project health and get AI insights
   */
  @Get('analyze-project/:id')
  @ApiOperation({
    summary: 'Analyze project with AI',
    description: 'Provides AI-powered project analysis including health score, risk assessment, and recommendations',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID to analyze',
    example: 'clx1y2z3a4b5c6d7e8f9g0h1',
  })
  @ApiResponse({
    status: 200,
    description: 'Project analysis completed successfully',
    type: ProjectAnalysisResponseDto,
    example: {
      healthScore: 78,
      riskFactors: [
        'High number of overdue tasks',
        'Limited team size for project scope',
        'Complex dependencies between tasks'
      ],
      recommendations: [
        'Consider breaking down large tasks into smaller chunks',
        'Prioritize fixing overdue tasks',
        'Add more team members or extend timeline',
        'Implement better task dependency management'
      ],
      predictedCompletionDate: '2025-08-15',
      bottlenecks: [
        'Frontend development tasks waiting for design approval',
        'Backend API development blocking frontend integration'
      ]
    },
  })  @ApiResponse({
    status: 400,
    description: 'Bad request - AI features not available or analysis failed',
    example: {
      statusCode: 400,
      message: 'AI features are not available. OpenAI API key not configured.',
      error: 'Bad Request',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
    example: {
      statusCode: 404,
      message: 'Project with ID "invalid-id" not found',
      error: 'Not Found',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  async analyzeProject(
    @Param('id') projectId: string,
    @GetUser() user: User,
  ): Promise<ProjectAnalysisResponseDto> {
    return await this.aiService.analyzeProject(projectId);
  }

  /**
   * Generate AI-powered project summary
   */
  @Get('project-summary/:id')
  @ApiOperation({
    summary: 'Generate project summary',
    description: 'Creates an AI-generated executive summary of the project',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID to summarize',
    example: 'clx1y2z3a4b5c6d7e8f9g0h1',
  })
  @ApiResponse({
    status: 200,
    description: 'Project summary generated successfully',
    type: ProjectSummaryResponseDto,
    example: {
      summary: 'E-commerce Platform is a modern web application focused on building a scalable online retail solution. The project utilizes React for frontend development and Node.js for backend services, with current progress showing 15 completed tasks and active development in authentication and payment systems.',
      keyInsights: [
        'Strong technical foundation with modern tech stack',
        'Well-organized task structure and clear milestones',
        'Active development momentum with regular updates'
      ]
    },
  })  @ApiResponse({
    status: 400,
    description: 'Bad request - AI features not available or summary generation failed',
    example: {
      statusCode: 400,
      message: 'AI features are not available. OpenAI API key not configured.',
      error: 'Bad Request',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
    example: {
      statusCode: 404,
      message: 'Project with ID "invalid-id" not found',
      error: 'Not Found',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  async generateProjectSummary(
    @Param('id') projectId: string,
    @GetUser() user: User,
  ): Promise<ProjectSummaryResponseDto> {
    const summary = await this.aiService.generateProjectSummary(projectId);
    
    return {
      summary,
      keyInsights: [
        'AI-generated insights based on project analysis',
        'Recommendations for improvement and optimization',
        'Technical and strategic observations'
      ]
    };
  }
}
