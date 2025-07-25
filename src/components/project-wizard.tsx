"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { createProject } from "@/app/actions";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialData = {
  name: "",
  type: "",
  projectDescription: "",
  overallWidth: "",
  overallDepth: "",
  overallHeight: "",
  woodType: "",
  joineryTechniques: "",
  plannedFinish: "",
  clayType: "",
  glazeDetails: "",
  firingMethod: "",
};

export function ProjectWizard({ open, onOpenChange }: ProjectWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const resetWizard = () => {
    setStep(1);
    setData(initialData);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetWizard();
    }
    onOpenChange(isOpen);
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: "You must be logged in to save a project.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const result = await createProject({ ...data, userId: user.uid });
      if (result.success) {
        toast({ title: "Project Created!", description: "Your new project has been saved." });
        handleOpenChange(false);
        router.push(`/projects`);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ title: "Error saving project", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const isStep1Valid = useMemo(() => data.name.trim() !== "" && data.type !== "", [data.name, data.type]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {step === 1 ? "New Project: What are you creating?" : `Project Details: ${data.type === 'woodworking' ? 'Woodworking' : 'Ceramics'} Specifics`}
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? "Start with the core idea of your project." : "Fill in the specific details for your chosen craft."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="wizardProjectName">Project Name</Label>
                <Input
                  id="wizardProjectName"
                  placeholder="e.g., Dovetail Keepsake Box"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Project Type</Label>
                <div className="grid grid-cols-2 gap-4 pt-2 project-type-selection">
                  <input type="radio" id="typeWoodworking" name="projectType" value="woodworking" onChange={(e) => setData({ ...data, type: e.target.value })} checked={data.type === 'woodworking'}/>
                  <label htmlFor="typeWoodworking"><span>🪵</span> Woodworking</label>
                  <input type="radio" id="typeCeramics" name="projectType" value="ceramics" onChange={(e) => setData({ ...data, type: e.target.value })} checked={data.type === 'ceramics'}/>
                  <label htmlFor="typeCeramics"><span>🏺</span> Ceramics</label>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="wizardProjectDescription">Project Description</Label>
                <Textarea id="wizardProjectDescription" rows={3} placeholder="A brief description of your project..." value={data.projectDescription} onChange={(e) => setData({ ...data, projectDescription: e.target.value })} />
              </div>
              <div>
                <Label>Overall Dimensions (Optional)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input type="number" placeholder="Width (in)" value={data.overallWidth} onChange={(e) => setData({ ...data, overallWidth: e.target.value })}/>
                  <Input type="number" placeholder="Depth (in)" value={data.overallDepth} onChange={(e) => setData({ ...data, overallDepth: e.target.value })}/>
                  <Input type="number" placeholder="Height (in)" value={data.overallHeight} onChange={(e) => setData({ ...data, overallHeight: e.target.value })}/>
                </div>
              </div>

              {data.type === 'woodworking' && (
                <div className="space-y-4 rounded-md border p-4">
                  <h3 className="font-headline font-semibold">Woodworking Specifics</h3>
                  <div>
                    <Label htmlFor="wizardWoodType">Wood Type</Label>
                    <Input id="wizardWoodType" placeholder="e.g., Walnut, Maple" value={data.woodType} onChange={(e) => setData({ ...data, woodType: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="wizardJoineryTechniques">Joinery Techniques</Label>
                    <Input id="wizardJoineryTechniques" placeholder="e.g., Dovetails, Mortise &amp; Tenon" value={data.joineryTechniques} onChange={(e) => setData({ ...data, joineryTechniques: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="wizardPlannedFinish">Planned Finish</Label>
                    <Input id="wizardPlannedFinish" placeholder="e.g., Tung Oil, Polyurethane" value={data.plannedFinish} onChange={(e) => setData({ ...data, plannedFinish: e.target.value })} />
                  </div>
                </div>
              )}

              {data.type === 'ceramics' && (
                <div className="space-y-4 rounded-md border p-4">
                  <h3 className="font-headline font-semibold">Ceramics Specifics</h3>
                  <div>
                    <Label htmlFor="wizardClayType">Clay Type</Label>
                    <Input id="wizardClayType" placeholder="e.g., Stoneware, Porcelain" value={data.clayType} onChange={(e) => setData({ ...data, clayType: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="wizardGlazeDetails">Glaze Details</Label>
                    <Input id="wizardGlazeDetails" placeholder="e.g., Celadon, Tenmoku" value={data.glazeDetails} onChange={(e) => setData({ ...data, glazeDetails: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="wizardFiringMethod">Firing Method</Label>
                    <Input id="wizardFiringMethod" placeholder="e.g., Cone 10 Reduction, Bisque" value={data.firingMethod} onChange={(e) => setData({ ...data, firingMethod: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          {step === 2 && <Button variant="secondary" onClick={handleBack}>Back</Button>}
          {step === 1 && <Button onClick={handleNext} disabled={!isStep1Valid}>Next</Button>}
          {step === 2 && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Project
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
