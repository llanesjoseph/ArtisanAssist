"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getProject, ProjectData, updateProject, deleteProject } from '@/app/actions';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import WoodworkingTools from '@/components/woodworking-tools';
import InspirationManager from '@/components/inspiration-manager';
import ProgressLog from '@/components/progress-log';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    
    const [project, setProject] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (typeof id !== 'string') return;
        if (authLoading) return;
        if (!user) {
            router.push('/');
            return;
        }

        getProject(id, user.uid).then(data => {
            if (data) {
                setProject(data);
            } else {
                toast({ title: 'Error', description: 'Project not found or you do not have permission to view it.', variant: 'destructive' });
                router.push('/projects');
            }
            setLoading(false);
        });
    }, [id, user, authLoading, router, toast]);

    const handleSave = async () => {
        if (!project) return;
        setIsSaving(true);
        const result = await updateProject(project.id!, project);
        if (result.success) {
            toast({ title: "Project Saved!", description: "Your changes have been saved successfully." });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        if (!project) return;
        const result = await deleteProject(project.id!);
        if (result.success) {
            toast({ title: "Project Deleted", description: `"${project.name}" has been removed.` });
            router.push('/projects');
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    const updateProjectField = (fields: Partial<ProjectData>) => {
        setProject(prev => prev ? { ...prev, ...fields } : null);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!project) {
        return null; // or a not found component
    }

    const typeIcon = project.type === 'woodworking' ? '🪵' : (project.type === 'ceramics' ? '🏺' : '🛠️');

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/projects">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back to Projects</span>
                            </Link>
                        </Button>
                        <h1 className="font-headline truncate text-xl font-bold text-foreground md:text-2xl">
                            <span className="mr-2">{typeIcon}</span>{project.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive-outline" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your project
                                    "{project.name}" and remove its data from our servers.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save
                        </Button>
                    </div>
                </div>
            </header>
            <main className="container py-8">
                <Accordion type="multiple" defaultValue={['overview']} className="w-full space-y-4">
                    <AccordionItem value="overview" className="rounded-lg border bg-card px-4">
                        <AccordionTrigger className="font-headline text-lg">Project Overview</AccordionTrigger>
                        <AccordionContent className="pt-2">
                             <div className="space-y-4">
                                <div>
                                    <Label htmlFor="projectNotes">General Notes</Label>
                                    <Textarea id="projectNotes" value={project.notes || ''} onChange={(e) => updateProjectField({ notes: e.target.value })} placeholder="General notes about your project" />
                                </div>
                                {project.type === 'woodworking' && (
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div><Label>Wood Type</Label><Input value={project.woodType || ''} onChange={e => updateProjectField({woodType: e.target.value})} /></div>
                                        <div><Label>Joinery</Label><Input value={project.joineryTechniques || ''} onChange={e => updateProjectField({joineryTechniques: e.target.value})} /></div>
                                        <div><Label>Finish</Label><Input value={project.plannedFinish || ''} onChange={e => updateProjectField({plannedFinish: e.target.value})} /></div>
                                    </div>
                                )}
                                {project.type === 'ceramics' && (
                                     <div className="grid gap-4 md:grid-cols-3">
                                        <div><Label>Clay Type</Label><Input value={project.clayType || ''} onChange={e => updateProjectField({clayType: e.target.value})} /></div>
                                        <div><Label>Glaze Details</Label><Input value={project.glazeDetails || ''} onChange={e => updateProjectField({glazeDetails: e.target.value})} /></div>
                                        <div><Label>Firing Method</Label><Input value={project.firingMethod || ''} onChange={e => updateProjectField({firingMethod: e.target.value})} /></div>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {project.type === 'woodworking' && (
                        <AccordionItem value="woodworking-tools" className="rounded-lg border bg-card px-4">
                            <AccordionTrigger className="font-headline text-lg">🪵 Woodworking Tools</AccordionTrigger>
                            <AccordionContent className="pt-2">
                                <WoodworkingTools project={project} onProjectChange={setProject} />
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    <AccordionItem value="inspiration" className="rounded-lg border bg-card px-4">
                        <AccordionTrigger className="font-headline text-lg">Inspiration &amp; Photos</AccordionTrigger>
                        <AccordionContent className="pt-2">
                            <InspirationManager project={project} onProjectChange={setProject} />
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="progress" className="rounded-lg border bg-card px-4">
                        <AccordionTrigger className="font-headline text-lg">Daily Progress Log</AccordionTrigger>
                        <AccordionContent className="pt-2">
                            <ProgressLog project={project} onProjectChange={setProject} />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </main>
        </div>
    );
}
