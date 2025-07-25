"use client";

import { useState } from 'react';
import { ProjectData } from '@/app/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';

interface ProgressLogProps {
    project: ProjectData;
    onProjectChange: React.Dispatch<React.SetStateAction<ProjectData | null>>;
}

interface LogEntry {
    date: string;
    note: string;
    photoUrl?: string;
}

export default function ProgressLog({ project, onProjectChange }: ProgressLogProps) {
    const { toast } = useToast();
    const [noteInput, setNoteInput] = useState('');
    const [photoUrlInput, setPhotoUrlInput] = useState('');
    
    const handleProjectChange = (field: keyof ProjectData, value: any) => {
        onProjectChange(p => p ? { ...p, [field]: value } : null);
    };

    const addProgressUpdate = (photoUrl = '') => {
        if (!noteInput.trim()) {
            toast({ title: 'Note is required', description: 'Please enter a note for your progress update.', variant: 'destructive' });
            return;
        }

        const newLogEntry: LogEntry = {
            date: new Date().toISOString(),
            note: noteInput.trim(),
            photoUrl: photoUrl.trim() || undefined,
        };

        const newLog = [
            ...(project.progressLog || []),
            newLogEntry,
        ];
        handleProjectChange('progressLog', newLog);
        setNoteInput('');
        setPhotoUrlInput('');
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!noteInput.trim()) {
            toast({ title: 'Add a note first', description: 'Please write a note before uploading a photo.', variant: 'destructive' });
            event.target.value = '';
            return;
        }
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // Max 2MB
             toast({ title: "File too large", description: "Maximum file size is 2MB.", variant: "destructive" });
             return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            addProgressUpdate(dataUrl);
        };
        reader.readAsDataURL(file);
    };
    
    const removeLogEntry = (index: number) => {
        const newLog = [...(project.progressLog || [])];
        newLog.splice(index, 1);
        handleProjectChange('progressLog', newLog);
    };
    
    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div>
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <h4 className="font-semibold">Add New Update</h4>
                        <div>
                            <Label htmlFor="progress-note">Note</Label>
                            <Textarea id="progress-note" value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="What did you accomplish today?"/>
                        </div>
                        <div>
                            <Label htmlFor="progress-photo-url">Photo URL (Optional)</Label>
                            <Input id="progress-photo-url" value={photoUrlInput} onChange={e => setPhotoUrlInput(e.target.value)} placeholder="Paste image URL"/>
                        </div>
                        <Button onClick={() => addProgressUpdate(photoUrlInput)} className="w-full">
                           <Plus className="mr-2 h-4 w-4"/> Add Note
                        </Button>
                        <Label htmlFor="progress-photo-upload" className="w-full">
                            <Button variant="outline" className="w-full" onClick={() => document.getElementById('progress-photo-upload')?.click()}>
                               <Upload className="mr-2 h-4 w-4"/> Add Note + Upload Photo
                            </Button>
                        </Label>
                        <Input id="progress-photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload}/>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {[...(project.progressLog || [])].reverse().map((log, i) => {
                    const originalIndex = (project.progressLog || []).length - 1 - i;
                    return (
                        <Card key={originalIndex} className="p-4">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-semibold text-muted-foreground">{format(new Date(log.date), 'PPP p')}</p>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLogEntry(originalIndex)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                            <p className="mt-2 text-sm whitespace-pre-wrap">{log.note}</p>
                            {log.photoUrl && (
                                <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-md">
                                    <Image src={log.photoUrl} alt="Progress" layout="fill" className="object-contain" />
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
