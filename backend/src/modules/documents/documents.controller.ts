import { Request, Response } from 'express';

import { DocumentsService } from './documents.service.js';

export class DocumentsController {
  private service: DocumentsService;

  constructor() {
    this.service = new DocumentsService();
  }

  async getDocuments(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const userRole = (req as any).user.role || (req as any).user.user_metadata?.role || 'user';
    const userId = (req as any).user.id;
    const folderId = (req.query as Record<string, string>).folderId as string;
    const data = await this.service.getDocuments(tenantId, folderId, userRole, userId);
    res.json({ success: true, data });
  }

  async createDocument(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    req.body.owner_id = (req as any).user.id;
    const data = await this.service.createDocument(tenantId, req.body);
    res.status(201).json({ success: true, data });
  }

  async getDocumentVersions(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const { id } = req.params as Record<string, string>;
    const data = await this.service.getDocumentVersions(tenantId, id);
    res.json({ success: true, data });
  }

  async addVersion(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const { id } = req.params as Record<string, string>;
    req.body.uploaded_by = (req as any).user.id;
    const data = await this.service.addVersion(tenantId, id, req.body);
    res.status(201).json({ success: true, data });
  }

  async uploadDocument(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const ownerId = (req as any).user.id;
    const folderId = req.body.folder_id || null;
    let allowedRoles: string[] = [];
    try {
      if (req.body.allowed_roles) {
        allowedRoles = JSON.parse(req.body.allowed_roles);
      }
    } catch (e) {
      // Ignored if invalid JSON, default to empty
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
      const data = await this.service.uploadToS3AndCreate(
        tenantId,
        ownerId,
        folderId,
        req.file,
        allowedRoles
      );
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async archiveDocument(req: Request, res: Response) {
    const tenantId = (req as any).user.tenant_id;
    const { id } = req.params as Record<string, string>;
    const data = await this.service.archiveDocument(tenantId, id);
    res.json({ success: true, data });
  }
}
