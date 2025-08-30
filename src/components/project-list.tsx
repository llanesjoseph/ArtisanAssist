"use client";

import { ProjectData, deleteProject } from "@/app/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";


function ProjectCard({ project }: { project: ProjectData }) {
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const result = await deleteProject(project.id!);
        if (result.success) {
            toast({ title: "Project Deleted", description: `"${project.name}" has been removed.` });
            router.refresh();
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };

    const typeIcon = project.type === 'woodworking' ? '🪵' : (project.type === 'ceramics' ? '🏺' : '🛠️');
    
    return (
        <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
            <Link href={`/projects/${project.id}`} className="flex flex-col h-full">
                <CardHeader className="flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle className="font-headline text-xl">{typeIcon} {project.name}</CardTitle>
                        <CardDescription>
                            {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                        </CardDescription>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
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
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                        <Image 
                            src={project.coverPhotoUrl || "https://placehold.co/400x225/EEE/31343C?text=No+Image"} 
                            alt={project.name}
                            fill
                            className="object-cover"
                            data-ai-hint="craft project"
                            unoptimized
                        />
                    </div>
                     {project.progressLog && project.progressLog.length > 0 && (
                        <div className="mt-4 text-sm text-muted-foreground border-t pt-2">
                            <p className="font-semibold">Latest Update ({format(new Date(project.progressLog[project.progressLog.length - 1].date), "PP")}):</p>
                            <p className="truncate">{project.progressLog[project.progressLog.length - 1].note}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        Created: {project.timestamp ? format(new Date(project.timestamp), "PPP") : "N/A"}
                    </p>
                </CardFooter>
            </Link>
        </Card>
    );
}

export function ProjectList({ projects }: { projects: ProjectData[] }) {
    if (projects.length === 0) {
        return (
            <div className="text-center py-20">
                <h3 className="font-headline text-2xl font-bold">No Projects Yet</h3>
                <p className="text-muted-foreground mt-2">Click "Start Something New" on the dashboard to create your first project.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
}
