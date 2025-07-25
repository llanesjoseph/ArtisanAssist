"use client";

import { useState } from 'react';
import { ProjectData } from '@/app/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2, Link as LinkIcon, ImagePlus, Upload, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface InspirationManagerProps {
    project: ProjectData;
    onProjectChange: React.Dispatch<React.SetStateAction<ProjectData | null>>;
}

export default function InspirationManager({ project, onProjectChange }: InspirationManagerProps) {
    const { toast } = useToast();
    const [linkInput, setLinkInput] = useState('');
    const [photoUrlInput, setPhotoUrlInput] = useState('');

    const handleProjectChange = (field: keyof ProjectData, value: any) => {
        onProjectChange(p => p ? { ...p, [field]: value } : null);
    };

    const addLink = () => {
        if (!linkInput) return;
        const newLinks = [...(project.inspirationLinks || []), linkInput];
        handleProjectChange('inspirationLinks', newLinks);
        setLinkInput('');
    };
    
    const removeLink = (index: number) => {
        const newLinks = [...(project.inspirationLinks || [])];
        newLinks.splice(index, 1);
        handleProjectChange('inspirationLinks', newLinks);
    };

    const addPhotoUrl = () => {
        if (!photoUrlInput) return;
        const newPhotos = [...(project.inspirationPhotos || []), photoUrlInput];
        handleProjectChange('inspirationPhotos', newPhotos);
        setPhotoUrlInput('');
    };

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // Max 2MB
            toast({ title: "File too large", description: "Maximum file size is 2MB.", variant: "destructive" });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const newPhotos = [...(project.inspirationPhotos || []), dataUrl];
            handleProjectChange('inspirationPhotos', newPhotos);
        };
        reader.readAsDataURL(file);
    };

    const removePhoto = (index: number) => {
        const photos = [...(project.inspirationPhotos || [])];
        const removedPhotoUrl = photos.splice(index, 1)[0];
        handleProjectChange('inspirationPhotos', photos);

        if (project.coverPhotoUrl === removedPhotoUrl) {
            handleProjectChange('coverPhotoUrl', photos.length > 0 ? photos[0] : '');
        }
    };
    
    const setCoverPhoto = (url: string) => {
        handleProjectChange('coverPhotoUrl', url);
    };

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
                <h4 className="font-semibold">Inspiration Links</h4>
                <div className="flex gap-2">
                    <Input value={linkInput} onChange={e => setLinkInput(e.target.value)} placeholder="https://example.com" />
                    <Button onClick={addLink}><LinkIcon className="mr-2 h-4 w-4"/>Add Link</Button>
                </div>
                <ul className="space-y-2">
                    {project.inspirationLinks?.map((link, i) => (
                        <li key={i} className="flex items-center justify-between rounded-md bg-secondary p-2">
                            <a href={link} target="_blank" rel="noopener noreferrer" className="truncate text-sm hover:underline">{link}</a>
                            <Button variant="ghost" size="icon" onClick={() => removeLink(i)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold">Inspiration Photos</h4>
                 <div className="flex gap-2">
                    <Input value={photoUrlInput} onChange={e => setPhotoUrlInput(e.target.value)} placeholder="Paste image URL..."/>
                    <Button onClick={addPhotoUrl}><ImagePlus className="mr-2 h-4 w-4"/>Add URL</Button>
                </div>
                <div>
                    <Label htmlFor="photo-upload" className="w-full">
                        <Button onClick={() => document.getElementById('photo-upload')?.click()} variant="outline" className="w-full">
                            <Upload className="mr-2 h-4 w-4"/> Upload Photo
                        </Button>
                    </Label>
                    <Input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {project.inspirationPhotos?.map((photo, i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-md">
                            <Image src={photo} alt={`Inspiration ${i+1}`} layout="fill" className="object-cover" />
                             <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => setCoverPhoto(photo)}>
                                    <Star className={`h-5 w-5 ${project.coverPhotoUrl === photo ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                </Button>
                                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => removePhoto(i)}>
                                    <Trash2 className="h-5 w-5"/>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
