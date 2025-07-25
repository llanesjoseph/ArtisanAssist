"use client";
import { useAuth } from "@/components/providers/auth-provider";
import { ProjectList } from "@/components/project-list";
import { getProjects, ProjectData } from "@/app/actions";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProjectsPage() {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getProjects(user.uid)
                .then(data => {
                    setProjects(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
        if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    return (
        <div className="flex min-h-screen flex-col bg-background">
             <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Dashboard</span>
                        </Link>
                    </Button>
                    <h1 className="font-headline text-2xl font-bold text-foreground">Your Projects</h1>
                </div>
                </div>
            </header>
            <main className="container py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : (
                    <ProjectList projects={projects} />
                )}
            </main>
        </div>
    );
}
