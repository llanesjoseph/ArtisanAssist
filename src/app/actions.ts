"use server";

import { db } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";

export interface ProjectData {
    id?: string;
    userId: string;
    name: string;
    type: string;
    projectDescription?: string;
    overallWidth?: string;
    overallDepth?: string;
    overallHeight?: string;
    woodType?: string;
    joineryTechniques?: string;
    plannedFinish?: string;
    clayType?: string;
    glazeDetails?: string;
    firingMethod?: string;
    timestamp?: number;
    notes?: string;
    parts?: any[];
    boards?: any[];
    kerf?: number;
    wasteFactor?: number;
    inspirationLinks?: string[];
    inspirationPhotos?: string[];
    coverPhotoUrl?: string;
    progressLog?: any[];
}

// Fallback local JSON datastore for environments without Firebase Admin credentials.
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "projects.json");

async function ensureDataFile(): Promise<void> {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.access(DATA_FILE).catch(async () => {
            await fs.writeFile(DATA_FILE, JSON.stringify([]), "utf8");
        });
    } catch (error) {
        console.error("Error ensuring data file:", error);
    }
}

async function readAllProjects(): Promise<ProjectData[]> {
    if (!db) {
        await ensureDataFile();
        const raw = await fs.readFile(DATA_FILE, "utf8").catch(() => "[]");
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    // When Firestore is available, this function isn't used directly.
    return [];
}

async function writeAllProjects(projects: ProjectData[]): Promise<void> {
    if (!db) {
        await ensureDataFile();
        await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), "utf8");
    }
}

function generateId(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}


export async function createProject(data: Omit<ProjectData, 'id' | 'timestamp'>) {
    try {
        const projectData: Omit<ProjectData, 'id'> = {
            ...data,
            timestamp: Date.now(),
            notes: '',
            parts: [],
            boards: [],
            kerf: 0.125,
            wasteFactor: 10,
            inspirationLinks: [],
            inspirationPhotos: [],
            coverPhotoUrl: '',
            progressLog: [],
        };
        if (db) {
            const docRef = await db.collection('projects').add(projectData as any);
            revalidatePath('/projects');
            return { success: true, id: docRef.id };
        } else {
            const projects = await readAllProjects();
            const id = generateId();
            const newProject: ProjectData = { id, ...projectData } as ProjectData;
            projects.push(newProject);
            await writeAllProjects(projects);
            revalidatePath('/projects');
            return { success: true, id };
        }
    } catch (error: any) {
        console.error("Error creating project:", error);
        return { success: false, error: error.message };
    }
}

export async function getProjects(userId: string): Promise<ProjectData[]> {
    try {
        if (db) {
            const snapshot = await db
                .collection('projects')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .get();
            if (snapshot.empty) {
                return [];
            }
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));
        } else {
            const all = await readAllProjects();
            return all
                .filter(p => p.userId === userId)
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        }
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

export async function getProject(projectId: string, userId: string): Promise<ProjectData | null> {
    try {
        if (db) {
            const doc = await db.collection('projects').doc(projectId).get();
            if (!doc.exists) {
                return null;
            }
            const projectData = doc.data() as ProjectData;
            if (projectData.userId !== userId) {
                // Basic security check
                return null;
            }
            return { id: doc.id, ...projectData };
        } else {
            const all = await readAllProjects();
            const proj = all.find(p => p.id === projectId && p.userId === userId) || null;
            return proj;
        }
    } catch (error) {
        console.error("Error fetching project:", error);
        return null;
    }
}

export async function updateProject(projectId: string, data: Partial<ProjectData>) {
    try {
        if (db) {
            await db.collection('projects').doc(projectId).update(data);
        } else {
            const all = await readAllProjects();
            const idx = all.findIndex(p => p.id === projectId);
            if (idx === -1) {
                return { success: false, error: "Project not found" };
            }
            all[idx] = { ...all[idx], ...data } as ProjectData;
            await writeAllProjects(all);
        }
        revalidatePath(`/projects/${projectId}`);
        revalidatePath('/projects');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating project:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteProject(projectId: string) {
    try {
        if (db) {
            await db.collection('projects').doc(projectId).delete();
        } else {
            const all = await readAllProjects();
            const next = all.filter(p => p.id !== projectId);
            await writeAllProjects(next);
        }
        revalidatePath('/projects');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting project:", error);
        return { success: false, error: error.message };
    }
}
