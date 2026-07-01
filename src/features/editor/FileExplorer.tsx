/* ============================================
   FileExplorer.tsx — Premium File Explorer Tree
   Interactive, with file addition, deletion, folder expansions
   ============================================ */
import { useState } from 'react';
import { 
  Folder, FolderOpen, File, FileCode, Plus, FolderPlus, 
  Trash2, Edit, ChevronDown, ChevronRight, Upload, Download 
} from 'lucide-react';
import { useEditorStore, type FileNode } from '@/stores/editorStore';
import { useUIStore } from '@/stores/uiStore';
import { getLanguageByExtension } from '@/utils/languages';

export default function FileExplorer() {
  const { fileTree, setFileTree, addTab, activeTabId } = useEditorStore();
  const { addToast } = useUIStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Find and update nodes helper
  const updateNodeInTree = (
    nodes: FileNode[], 
    targetId: string, 
    updateFn: (node: FileNode) => Partial<FileNode> | null
  ): FileNode[] => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        const update = updateFn(node);
        return update === null ? (null as any) : { ...node, ...update };
      }
      if (node.children) {
        return {
          ...node,
          children: updateNodeInTree(node.children, targetId, updateFn).filter(Boolean),
        };
      }
      return node;
    }).filter(Boolean);
  };

  const handleToggleFolder = (folderId: string) => {
    const nextTree = updateNodeInTree(fileTree, folderId, (node) => ({
      isOpen: !node.isOpen
    }));
    setFileTree(nextTree);
  };

  const handleCreateNew = (parentId: string, type: 'file' | 'folder') => {
    const id = `node-${Math.random().toString(36).substring(2, 9)}`;
    const name = type === 'file' ? 'untitled.js' : 'new-folder';
    const extension = '.' + name.split('.').pop();
    const detectedLang = type === 'file' ? (getLanguageByExtension(extension)?.id || 'javascript') : undefined;

    const newNode: FileNode = {
      id,
      name,
      type,
      language: detectedLang,
      content: type === 'file' ? '// Write your code here' : undefined,
      children: type === 'folder' ? [] : undefined,
      isOpen: type === 'folder' ? true : undefined,
    };

    const nextTree = fileTree.map(rootNode => {
      if (rootNode.id === parentId) {
        return { ...rootNode, children: [...(rootNode.children || []), newNode] };
      }
      const insertRecursive = (node: FileNode): FileNode => {
        if (node.id === parentId) {
          return { ...node, children: [...(node.children || []), newNode] };
        }
        if (node.children) {
          return { ...node, children: node.children.map(insertRecursive) };
        }
        return node;
      };
      return insertRecursive(rootNode);
    });

    setFileTree(nextTree);
    setEditingId(id);
    setEditName(name);

    addToast({
      type: 'info',
      title: `${type === 'file' ? 'File' : 'Folder'} Scaffolding`,
      message: `Rename your new item in the explorer.`,
    });
  };

  const handleDelete = (id: string) => {
    const nextTree = updateNodeInTree(fileTree, id, () => null);
    setFileTree(nextTree);
    addToast({
      type: 'success',
      title: 'Deleted Successfully',
      message: 'File reference removed.',
    });
  };

  const handleStartRename = (node: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(node.id);
    setEditName(node.name);
  };

  const handleFinishRename = (id: string) => {
    if (!editName.trim()) return;
    const extension = '.' + editName.split('.').pop();
    const detectedLang = getLanguageByExtension(extension)?.id || 'javascript';

    const nextTree = updateNodeInTree(fileTree, id, (node) => ({
      name: editName,
      language: node.type === 'file' ? detectedLang : undefined,
    }));

    setFileTree(nextTree);
    setEditingId(null);
  };

  const handleSelectFile = (node: FileNode) => {
    if (node.type === 'folder') {
      handleToggleFolder(node.id);
      return;
    }

    addTab({
      id: node.id,
      name: node.name,
      language: node.language || 'javascript',
      content: node.content || '',
    });
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => {
      const isEditing = editingId === node.id;
      const isSelected = activeTabId === node.id;

      return (
        <div key={node.id} className="explorer-node-wrapper">
          <div 
            className={`explorer-node ${isSelected ? 'selected' : ''}`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => handleSelectFile(node)}
          >
            {node.type === 'folder' ? (
              <span className="explorer-arrow">
                {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            ) : (
              <span className="explorer-spacer-arrow" />
            )}

            <span className="node-icon">
              {node.type === 'folder' ? (
                node.isOpen ? <FolderOpen size={16} className="folder-icon" /> : <Folder size={16} className="folder-icon" />
              ) : (
                <FileCode size={16} className="file-icon" />
              )}
            </span>

            {isEditing ? (
              <input
                type="text"
                className="node-rename-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleFinishRename(node.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleFinishRename(node.id)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="node-name">{node.name}</span>
            )}

            <div className="node-actions">
              {node.type === 'folder' && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); handleCreateNew(node.id, 'file'); }} title="New File">
                    <Plus size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleCreateNew(node.id, 'folder'); }} title="New Folder">
                    <FolderPlus size={14} />
                  </button>
                </>
              )}
              <button onClick={(e) => handleStartRename(node, e)} title="Rename">
                <Edit size={14} />
              </button>
              {node.id !== 'root' && (
                <button onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }} title="Delete">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {node.type === 'folder' && node.isOpen && node.children && (
            <div className="folder-children">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="file-explorer-container">
      <div className="explorer-header">
        <span>Workspace Files</span>
        <div className="explorer-header-actions">
          <button onClick={() => addToast({ type: 'info', title: 'Export', message: 'Exporting workspace ZIP...' })} title="Export ZIP">
            <Download size={14} />
          </button>
          <button onClick={() => addToast({ type: 'info', title: 'GitHub', message: 'Ready to import GitHub repo...' })} title="Git Sync">
            <Upload size={14} />
          </button>
        </div>
      </div>
      <div className="explorer-tree">
        {renderTree(fileTree)}
      </div>
    </div>
  );
}
