import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResumeService } from './resume.service';

@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (file.mimetype !== 'application/pdf')
      throw new BadRequestException('Only PDF files are allowed');
    return this.resumeService.processUpload(file, req.user.id);
  }

  @Get('my')
  getMyResumes(@Request() req: any) {
    return this.resumeService.getUserResumes(req.user.id);
  }

  @Get(':id')
  getResume(@Param('id') id: string, @Request() req: any) {
    return this.resumeService.getResume(id, req.user.id);
  }
}
