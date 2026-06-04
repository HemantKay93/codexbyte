import { getAdminClient } from '../../config/supabase.js';

export class DocumentsRepository {
  async getDocuments(tenantId: string, folderId: string | null = null, userRole: string = 'admin', userId: string = '') {
    const admin = await getAdminClient();
    let query = admin
      .from('documents')
      .select('*, document_versions(count), document_permissions(role)')
      .eq('tenant_id', tenantId)
      .eq('is_archived', false)
      .order('file_type', { ascending: true }) // folders first
      .order('created_at', { ascending: false });

    if (folderId) {
      query = query.eq('folder_id', folderId);
    } else {
      query = query.is('folder_id', null);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    const docs = data || [];
    
    if (['admin', 'super-admin'].includes(userRole)) {
      return docs;
    }

    return docs.filter((doc: any) => {
      if (doc.owner_id === userId) return true;
      if (!doc.document_permissions || doc.document_permissions.length === 0) return false;
      return doc.document_permissions.some((p: any) => p.role === userRole || p.role === 'all');
    });
  }

  async createDocument(tenantId: string, payload: any) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('documents')
      .insert([{ 
        tenant_id: tenantId, 
        name: payload.name, 
        folder_id: payload.folder_id || null, 
        file_path: payload.file_path, 
        file_type: payload.file_type, 
        file_size_bytes: payload.file_size_bytes, 
        owner_id: payload.owner_id 
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getDocumentVersions(tenantId: string, documentId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('document_versions')
      .select('*, users!uploaded_by(email)')
      .eq('tenant_id', tenantId)
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async addDocumentVersion(tenantId: string, documentId: string, payload: any) {
    const admin = await getAdminClient();
    
    // Get latest version number
    const { data: latest } = await admin
      .from('document_versions')
      .select('version_number')
      .eq('tenant_id', tenantId)
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();
      
    const nextVersion = latest ? latest.version_number + 1 : 1;

    const { data, error } = await admin
      .from('document_versions')
      .insert([{
        tenant_id: tenantId,
        document_id: documentId,
        file_path: payload.file_path,
        file_size_bytes: payload.file_size_bytes,
        uploaded_by: payload.uploaded_by,
        version_number: nextVersion
      }])
      .select()
      .single();
    if (error) throw error;

    // Update main document metadata
    await admin.from('documents').update({ 
      file_path: payload.file_path,
      file_size_bytes: payload.file_size_bytes,
      updated_at: new Date().toISOString()
    }).eq('id', documentId).eq('tenant_id', tenantId);

    return data;
  }

  async archiveDocument(tenantId: string, documentId: string) {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from('documents')
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq('id', documentId)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async addDocumentPermissions(tenantId: string, documentId: string, roles: string[]) {
    const admin = await getAdminClient();
    const payload = roles.map(role => ({
      tenant_id: tenantId,
      document_id: documentId,
      role: role,
      permission_level: 'view'
    }));
    const { error } = await admin.from('document_permissions').insert(payload);
    if (error) throw error;
  }
}
