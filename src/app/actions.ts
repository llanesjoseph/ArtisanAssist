"use server";

import { db } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

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
        const docRef = await db.collection('projects').add(projectData);
        revalidatePath('/projects');
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error("Error creating project:", error);
        return { success: false, error: error.message };
    }
}

export async function getProjects(userId: string): Promise<ProjectData[]> {
    try {
        const snapshot = await db.collection('projects').where('userId', '==', userId).orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectData));
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
}

export async function getProject(projectId: string, userId: string): Promise<ProjectData | null> {
    try {
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
    } catch (error) {
        console.error("Error fetching project:", error);
        return null;
    }
}

export async function updateProject(projectId: string, data: Partial<ProjectData>) {
    try {
        await db.collection('projects').doc(projectId).update(data);
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
        await db.collection('projects').doc(projectId).delete();
        revalidatePath('/projects');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting project:", error);
        return { success: false, error: error.message };
    }
}
