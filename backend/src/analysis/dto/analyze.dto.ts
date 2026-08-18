import { IsNotEmpty, IsString } from 'class-validator';

export class AnalyzeDto {
  @IsNotEmpty()
  @IsString()
  resumeId: string;

  @IsNotEmpty()
  @IsString()
  targetRole: string;
}
