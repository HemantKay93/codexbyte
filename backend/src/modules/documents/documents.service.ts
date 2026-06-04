import path from 'path';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { eventBus } from '../../core/events/EventBus.js';
import { AppError } from '../../middlewares/error.js';

import { DocumentsRepository } from './documents.repository.js';

export class DocumentsService {
  private repo: DocumentsRepository;
  private s3Client: S3Client;

  constructor() {
    this.repo = new DocumentsRepository();
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-northeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async getDocuments(
    tenantId: string,
    folderId?: string,
    userRole: string = 'admin',
    userId: string = ''
  ) {
    return await this.repo.getDocuments(tenantId, folderId || null, userRole, userId);
  }

  async createDocument(tenantId: string, payload: any, allowedRoles: string[] = []) {
    if (!payload.name || !payload.owner_id) {
      throw new AppError('Name and owner_id are required', 400);
    }
    const doc = await this.repo.createDocument(tenantId, payload);

    // Auto-create version 1 if it's a file (not a folder)
    if (payload.file_type !== 'folder' && payload.file_path) {
      await this.repo.addDocumentVersion(tenantId, doc.id, {
        file_path: payload.file_path,
        file_size_bytes: payload.file_size_bytes,
        uploaded_by: payload.owner_id,
      });
    }

    if (allowedRoles.length > 0) {
      await this.repo.addDocumentPermissions(tenantId, doc.id, allowedRoles);
    }

    eventBus.publish(<any>'document.created', { tenantId, documentId: doc.id });
    return doc;
  }

  async getDocumentVersions(tenantId: string, documentId: string) {
    return await this.repo.getDocumentVersions(tenantId, documentId);
  }

  async addVersion(tenantId: string, documentId: string, payload: any) {
    const version = await this.repo.addDocumentVersion(tenantId, documentId, payload);
    eventBus.publish(<any>'document.version_added', { tenantId, documentId });
    return version;
  }

  async archiveDocument(tenantId: string, documentId: string) {
    const doc = await this.repo.archiveDocument(tenantId, documentId);
    eventBus.publish(<any>'document.archived', { tenantId, documentId });
    return doc;
  }

  async uploadToS3AndCreate(
    tenantId: string,
    ownerId: string,
    folderId: string | null,
    file: Express.Multer.File,
    allowedRoles: string[] = []
  ) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) throw new Error('AWS_S3_BUCKET_NAME is not configured');

    const extension = path.extname(file.originalname);
    const key = `documents/${tenantId}/${Date.now()}-${Math.random().toString(36).substring(7)}${extension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const docPayload = {
      name: file.originalname,
      file_path: s3Url,
      file_type: extension.replace('.', '') || 'unknown',
      file_size_bytes: file.size,
      folder_id: folderId,
      owner_id: ownerId,
    };

    return await this.createDocument(tenantId, docPayload, allowedRoles);
  }
}
