import { useState, useEffect, useRef } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import { Loader2, File, Folder, Upload, MoreVertical, Search, Download } from 'lucide-react';
import { DocumentsService } from '@byteevolvr/api-client';

export function DocumentCenterPage() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['all']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async (folderId: string | null) => {
    try {
      const res = await DocumentsService.getDocuments(folderId || undefined);
      const docs = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocuments(currentFolder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolder]);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setShowRoleModal(true);
  };

  const handleUploadConfirm = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setShowRoleModal(false);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (currentFolder) {
        formData.append('folder_id', currentFolder);
      }
      formData.append('allowed_roles', JSON.stringify(selectedRoles));

      await DocumentsService.uploadDocument(formData);
      fetchDocuments(currentFolder);
    } catch (error) {
      console.error('Failed to upload', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setSelectedRoles(['all']);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateFolder = async () => {
    const fakeFolder = {
      name: `New Folder ${Math.floor(Math.random() * 1000)}`,
      file_path: null,
      file_type: 'folder',
      file_size_bytes: 0,
      folder_id: currentFolder,
    };
    try {
      await DocumentsService.createDocument(fakeFolder);
      fetchDocuments(currentFolder);
    } catch (error) {
      console.error('Failed to create folder', error);
    }
  };

  const handleRowClick = (doc: any) => {
    if (doc.file_type === 'folder') {
      setCurrentFolder(doc.id);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Document Center</h1>
          <p className="text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
            {currentFolder ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentFolder(null)}
                  className="h-auto p-0 text-primary"
                >
                  Root
                </Button>
                <span>/</span>
                <span>{currentFolder}</span>
              </>
            ) : (
              'Manage your enterprise files securely.'
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleCreateFolder}>
            <Folder className="h-4 w-4" /> New Folder
          </Button>
          <Button className="gap-2" onClick={handleUploadClick} disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-outline-variant rounded-xl shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest text-on-surface-variant text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Size</th>
                    <th className="p-4 font-semibold">Owner</th>
                    <th className="p-4 font-semibold">Modified</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant bg-surface">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                        This folder is empty.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr
                        key={doc.id}
                        className={`hover:bg-surface-container-lowest transition-colors ${doc.file_type === 'folder' ? 'cursor-pointer' : ''}`}
                        onClick={() => handleRowClick(doc)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {doc.file_type === 'folder' ? (
                              <Folder className="h-5 w-5 text-blue-500 fill-blue-500/20" />
                            ) : (
                              <File className="h-5 w-5 text-on-surface-variant" />
                            )}
                            <span className="font-medium text-on-surface">{doc.name}</span>
                            {doc.document_versions && doc.document_versions[0]?.count > 1 && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                                v{doc.document_versions[0].count}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-on-surface-variant">
                          {doc.file_type === 'folder' ? '--' : formatBytes(doc.file_size_bytes)}
                        </td>
                        <td className="p-4">
                          <div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] font-bold">
                            ME
                          </div>
                        </td>
                        <td className="p-4 text-sm text-on-surface-variant">
                          {new Date(doc.updated_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div
                            className="flex items-center justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {doc.file_type !== 'folder' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-on-surface-variant hover:text-primary"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-on-surface-variant"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-surface shadow-2xl border border-outline-variant">
            <h3 className="text-title-lg font-semibold text-on-surface mb-2">Upload Document</h3>
            <p className="text-body-sm text-on-surface-variant mb-6">
              Who should be able to view <strong>{selectedFile?.name}</strong>?
            </p>

            <div className="space-y-3 mb-6">
              {[
                { id: 'all', label: 'Everyone (All Roles)' },
                { id: 'manager', label: 'Managers Only' },
                { id: 'sales', label: 'Sales Team' },
                { id: 'support', label: 'Support Team' },
                { id: 'warehouse-staff', label: 'Warehouse Staff' },
              ].map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-lowest transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary rounded border-outline cursor-pointer"
                    checked={selectedRoles.includes(role.id)}
                    onChange={(e) => {
                      if (role.id === 'all') {
                        setSelectedRoles(e.target.checked ? ['all'] : []);
                      } else {
                        const newRoles = e.target.checked
                          ? [...selectedRoles.filter((r) => r !== 'all'), role.id]
                          : selectedRoles.filter((r) => r !== role.id);
                        setSelectedRoles(newRoles);
                      }
                    }}
                  />
                  <span className="text-body-md text-on-surface font-medium">{role.label}</span>
                </label>
              ))}
              <p className="text-xs text-on-surface-variant mt-3 px-1">
                * System Administrators implicitly have access to all documents.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUploadConfirm} className="gap-2">
                <Upload className="h-4 w-4" /> Confirm Upload
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
