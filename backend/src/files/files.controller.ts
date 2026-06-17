import { Controller, Get, Post, Delete, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  uploadZip(@Request() req, @Param('projectId') projectId: string, @UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadZip(req.user.sub, projectId, file);
  }

  @Get('tree')
  getTree(@Request() req, @Param('projectId') projectId: string) {
    return this.filesService.getFileTree(req.user.sub, projectId);
  }

  @Get(':fileId')
  getFile(@Request() req, @Param('projectId') projectId: string, @Param('fileId') fileId: string) {
    return this.filesService.getFileContent(req.user.sub, projectId, fileId);
  }

  @Delete(':fileId')
  deleteFile(@Request() req, @Param('projectId') projectId: string, @Param('fileId') fileId: string) {
    return this.filesService.deleteFile(req.user.sub, projectId, fileId);
  }
}