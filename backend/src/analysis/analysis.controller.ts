import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalysisService } from './analysis.service';
import { AnalyzeDto } from './dto/analyze.dto';

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  @Post()
  analyze(@Body() dto: AnalyzeDto, @Request() req: any) {
    return this.analysisService.analyze(dto, req.user.id);
  }

  @Get('roles')
  getRoles() {
    return this.analysisService.getAvailableRoles();
  }

  @Get('my')
  getMyAnalyses(@Request() req: any) {
    return this.analysisService.getMyAnalyses(req.user.id);
  }

  @Get(':id')
  getAnalysis(@Param('id') id: string, @Request() req: any) {
    return this.analysisService.getAnalysis(id, req.user.id);
  }
}
