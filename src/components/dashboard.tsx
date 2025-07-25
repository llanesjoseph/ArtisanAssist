"use client";

import type { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { ProjectWizard } from "@/components/project-wizard";
import { useState } from "react";
import Link from "next/link";
import { FilePlus2, FolderKanban } from "lucide-react";

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div className="container py-12 text-center">
      <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Welcome to Your Workshop, {user.displayName?.split(" ")[0]}!
      </h2>
      <p className="mt-4 text-lg text-muted-foreground">What will you create today?</p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button size="lg" className="text-lg" onClick={() => setIsWizardOpen(true)}>
          <FilePlus2 className="mr-2 h-5 w-5" />
          Start Something New
        </Button>
        <Button variant="secondary" size="lg" className="text-lg" asChild>
          <Link href="/projects">
            <FolderKanban className="mr-2 h-5 w-5" />
            View All Projects
          </Link>
        </Button>
      </div>
      <ProjectWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />
    </div>
  );
}
