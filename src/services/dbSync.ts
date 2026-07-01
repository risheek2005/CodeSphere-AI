/* ============================================
   dbSync.ts — Synchronizer Service
   Connects state stores to Firestore (or local-storage fallback)
   ============================================ */
import { 
  setDocument, 
  getDocument, 
  addDocument, 
  queryDocuments, 
  deleteDocument 
} from './firebase';

export interface ProjectData {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  lastModified: number;
  language: string;
  fileTree: any[];
  tabs: any[];
  activeTabId: string | null;
}

export interface ActivityLog {
  id?: string;
  userId: string;
  message: string;
  icon: string;
  type: string;
  time: string;
  timestamp: number;
}

export interface EditorSessionLog {
  id?: string;
  userId: string;
  projectId: string;
  durationSeconds: number;
  timestamp: number;
}

export interface ExecutionLog {
  id?: string;
  userId: string;
  projectId: string;
  language: string;
  status: string;
  timestamp: number;
  stdout: string;
  stderr: string;
}

/* ============================================
   PROJECT PERSISTENCE
   ============================================ */
export async function saveUserProject(userId: string, project: Omit<ProjectData, 'userId'>): Promise<void> {
  const payload: ProjectData = {
    ...project,
    userId,
    lastModified: Date.now()
  };
  await setDocument('projects', project.id, payload);
}

export async function loadUserProjects(userId: string): Promise<ProjectData[]> {
  return await queryDocuments<ProjectData>('projects', 'userId', '==', userId);
}

export async function deleteUserProject(projectId: string): Promise<void> {
  await deleteDocument('projects', projectId);
}

/* ============================================
   ACTIVITY FEED
   ============================================ */
export async function logUserActivity(
  userId: string, 
  message: string, 
  icon: string, 
  type: string
): Promise<void> {
  const log: ActivityLog = {
    userId,
    message,
    icon,
    type,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now()
  };
  await addDocument('activities', log);
}

export async function loadUserActivities(userId: string): Promise<ActivityLog[]> {
  const logs = await queryDocuments<ActivityLog>('activities', 'userId', '==', userId);
  return logs.sort((a, b) => b.timestamp - a.timestamp);
}

/* ============================================
   EDITOR SESSION TRACKING
   ============================================ */
export async function saveEditorSession(
  userId: string,
  projectId: string,
  durationSeconds: number
): Promise<void> {
  if (durationSeconds <= 0) return;
  const session: EditorSessionLog = {
    userId,
    projectId,
    durationSeconds,
    timestamp: Date.now()
  };
  await addDocument('editorSessions', session);
}

export async function loadUserSessions(userId: string): Promise<EditorSessionLog[]> {
  return await queryDocuments<EditorSessionLog>('editorSessions', 'userId', '==', userId);
}

/* ============================================
   CODE EXECUTIONS
   ============================================ */
export async function logCodeExecution(
  userId: string,
  projectId: string,
  language: string,
  status: string,
  stdout: string,
  stderr: string
): Promise<void> {
  const log: ExecutionLog = {
    userId,
    projectId,
    language,
    status,
    stdout,
    stderr,
    timestamp: Date.now()
  };
  await addDocument('executions', log);
}

export async function loadUserExecutions(userId: string): Promise<ExecutionLog[]> {
  return await queryDocuments<ExecutionLog>('executions', 'userId', '==', userId);
}
