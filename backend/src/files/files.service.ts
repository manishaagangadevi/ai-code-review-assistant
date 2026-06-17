import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as AdmZip from 'adm-zip';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  private readonly uploadDir = './uploads';

  async uploadZip(userId: string, projectId: string, file: Express.Multer.File) {
    await this.verifyProject(userId, projectId);

    const zip = new AdmZip(file.buffer);
    const entries = zip.getEntries();
    const created = [];

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      const entryName = entry.entryName;
      const ext = path.extname(entryName).toLowerCase();
      const skipExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.ttf', '.eot'];
      if (skipExts.includes(ext)) continue;

      let content = '';
      try {
        content = entry.getData().toString('utf8');
      } catch {
        continue;
      }

      const dbFile = await this.prisma.file.create({
        data: {
          name: path.basename(entryName),
          path: entryName,
          content,
          mimeType: this.getMimeType(ext),
          size: entry.header.size,
          projectId,
        },
      });
      created.push(dbFile);
    }

    return { uploaded: created.length, files: created };
  }

  async getFileTree(userId: string, projectId: string) {
    await this.verifyProject(userId, projectId);
    const files = await this.prisma.file.findMany({ where: { projectId } });
    return this.buildTree(files);
  }

  async getFileContent(userId: string, projectId: string, fileId: string) {
    await this.verifyProject(userId, projectId);
    const file = await this.prisma.file.findFirst({ where: { id: fileId, projectId } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async deleteFile(userId: string, projectId: string, fileId: string) {
    await this.verifyProject(userId, projectId);
    return this.prisma.file.delete({ where: { id: fileId } });
  }

  async getFilesContent(projectId: string, fileIds?: string[]) {
    const where = fileIds ? { projectId, id: { in: fileIds } } : { projectId };
    return this.prisma.file.findMany({ where, select: { id: true, name: true, path: true, content: true } });
  }

  private async verifyProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  private buildTree(files: any[]) {
    const tree = {};
    for (const file of files) {
      const parts = file.path.split('/');
      let node = tree;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!node[parts[i]]) node[parts[i]] = { __files: [] };
        node = node[parts[i]];
      }
      if (!node.__files) node.__files = [];
      node.__files.push({ id: file.id, name: file.name, path: file.path, size: file.size, mimeType: file.mimeType });
    }
    return tree;
  }

  private getMimeType(ext: string): string {
    const map = {
      '.ts': 'text/typescript', '.js': 'text/javascript', '.tsx': 'text/tsx',
      '.jsx': 'text/jsx', '.py': 'text/x-python', '.java': 'text/x-java',
      '.json': 'application/json', '.html': 'text/html', '.css': 'text/css',
      '.md': 'text/markdown', '.sql': 'text/x-sql', '.env': 'text/plain',
    };
    return map[ext] || 'text/plain';
  }
}