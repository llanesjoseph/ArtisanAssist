"use client";

import { useState } from 'react';
import { ProjectData } from '@/app/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Trash2, Plus, Minus, Download, Calculator } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { optimizeCutlist } from '@/lib/cutlist';
import jsPDF from 'jspdf';

interface WoodworkingToolsProps {
    project: ProjectData;
    onProjectChange: React.Dispatch<React.SetStateAction<ProjectData | null>>;
}

interface Part {
    name: string;
    length: number;
    width: number;
    thickness: number;
}
interface Board {
    name: string;
    length: number;
    width: number;
    thickness: number;
}

interface CutPlanResult {
    totalBoardFeet: number;
    boardPlans: any;
    unplacedParts: any[];
}

export default function WoodworkingTools({ project, onProjectChange }: WoodworkingToolsProps) {
    const [partName, setPartName] = useState('');
    const [partLength, setPartLength] = useState('');
    const [partWidth, setPartWidth] = useState('');
    const [partThickness, setPartThickness] = useState('');
    const [partQuantity, setPartQuantity] = useState(1);

    const [boardLength, setBoardLength] = useState('');
    const [boardWidth, setBoardWidth] = useState('');
    const [boardThickness, setBoardThickness] = useState('');
    const [boardQuantity, setBoardQuantity] = useState(1);
    
    const [cutPlanResult, setCutPlanResult] = useState<CutPlanResult | null>(null);

    const handleProjectChange = (field: keyof ProjectData, value: any) => {
        onProjectChange(p => p ? { ...p, [field]: value } : null);
    };

    const addPart = () => {
        if (!partName || !partLength || !partWidth || !partThickness) return;
        const newParts = [...(project.parts || [])];
        for (let i = 0; i < partQuantity; i++) {
            newParts.push({
                name: partQuantity > 1 ? `${partName} #${i + 1}` : partName,
                length: parseFloat(partLength),
                width: parseFloat(partWidth),
                thickness: parseFloat(partThickness),
            });
        }
        handleProjectChange('parts', newParts);
        setPartName(''); setPartLength(''); setPartWidth(''); setPartThickness(''); setPartQuantity(1);
    };
    
    const removePart = (index: number) => {
        const newParts = [...(project.parts || [])];
        newParts.splice(index, 1);
        handleProjectChange('parts', newParts);
    };
    
    const addBoard = () => {
        if (!boardLength || !boardWidth || !boardThickness) return;
        const newBoards = [...(project.boards || [])];
        for (let i = 0; i < boardQuantity; i++) {
            newBoards.push({
                name: `Stock Board #${(project.boards?.length || 0) + i + 1}`,
                length: parseFloat(boardLength),
                width: parseFloat(boardWidth),
                thickness: parseFloat(boardThickness),
            });
        }
        handleProjectChange('boards', newBoards);
        setBoardLength(''); setBoardWidth(''); setBoardThickness(''); setBoardQuantity(1);
    };
    
    const removeBoard = (index: number) => {
        const newBoards = [...(project.boards || [])];
        newBoards.splice(index, 1);
        handleProjectChange('boards', newBoards);
    };
    
    const generateCutPlan = () => {
        const result = optimizeCutlist({
            parts: project.parts || [],
            boards: project.boards || [],
            kerf: project.kerf || 0.125,
            wasteFactor: project.wasteFactor || 10,
        });
        setCutPlanResult(result);
    };
    
    const downloadCutSheet = () => {
        if (!cutPlanResult) return;
        const doc = new jsPDF();
        let y = 15;
        doc.setFontSize(18).text(project.name, 10, y); y+= 10;
        doc.setFontSize(12).text(`Total Board Feet Needed: ${cutPlanResult.totalBoardFeet.toFixed(2)} BF`, 10, y); y += 10;
        
        Object.values(cutPlanResult.boardPlans).forEach((plan: any) => {
            if (plan.cuts.length > 0) {
                if (y > 270) { doc.addPage(); y = 15; }
                doc.setFontSize(14).text(`From Board: ${plan.board.length}" x ${plan.board.width}" x ${plan.board.thickness}"`, 10, y); y += 7;
                plan.cuts.forEach((cut: any) => {
                    if (y > 280) { doc.addPage(); y = 15; }
                    doc.setFontSize(10).text(`- Cut ${cut.length}" x ${cut.width}" for: ${cut.name}`, 15, y); y += 5;
                });
            }
        });

        if (cutPlanResult.unplacedParts.length > 0) {
            if (y > 270) { doc.addPage(); y = 15; }
            doc.setTextColor(255, 0, 0);
            doc.setFontSize(12).text(`Unplaced Parts:`, 10, y); y += 7;
            doc.setTextColor(0, 0, 0);
             cutPlanResult.unplacedParts.forEach((part: any) => {
                if (y > 280) { doc.addPage(); y = 15; }
                doc.setFontSize(10).text(`- ${part.name} (${part.length}" x ${part.width}")`, 15, y); y += 5;
            });
        }

        doc.save(`${project.name}_cut_sheet.pdf`);
    };


    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Define Project Parts</CardTitle>
                        <CardDescription>Enter the finished dimensions for each part of your project.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                             <Label htmlFor="part-name">Part Name</Label>
                             <Input id="part-name" value={partName} onChange={(e) => setPartName(e.target.value)} placeholder="e.g., Leg" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div><Label>Length</Label><Input type="number" value={partLength} onChange={(e) => setPartLength(e.target.value)} placeholder="28" /></div>
                            <div><Label>Width</Label><Input type="number" value={partWidth} onChange={(e) => setPartWidth(e.target.value)} placeholder="1.5" /></div>
                            <div><Label>Thickness</Label><Input type="number" value={partThickness} onChange={(e) => setPartThickness(e.target.value)} placeholder="0.75" /></div>
                        </div>
                         <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>Quantity</Label>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" onClick={() => setPartQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4"/></Button>
                                    <Input type="number" readOnly value={partQuantity} className="text-center" />
                                    <Button size="icon" variant="outline" onClick={() => setPartQuantity(q => q + 1)}><Plus className="h-4 w-4"/></Button>
                                </div>
                            </div>
                            <Button onClick={addPart} className="self-end">Add Part(s)</Button>
                        </div>
                         <Table>
                            <TableHeader><TableRow><TableHead>Part</TableHead><TableHead>L</TableHead><TableHead>W</TableHead><TableHead>T</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {project.parts?.map((p, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{p.name}</TableCell><TableCell>{p.length}</TableCell><TableCell>{p.width}</TableCell><TableCell>{p.thickness}</TableCell>
                                        <TableCell><Button variant="ghost" size="icon" onClick={() => removePart(i)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>2. Available Lumber Stock</CardTitle>
                        <CardDescription>List the boards you have available to cut from.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <div><Label>Length</Label><Input type="number" value={boardLength} onChange={(e) => setBoardLength(e.target.value)} placeholder="96" /></div>
                            <div><Label>Width</Label><Input type="number" value={boardWidth} onChange={(e) => setBoardWidth(e.target.value)} placeholder="5.5" /></div>
                            <div><Label>Thickness</Label><Input type="number" value={boardThickness} onChange={(e) => setBoardThickness(e.target.value)} placeholder="0.75" /></div>
                        </div>
                         <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>Quantity</Label>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" onClick={() => setBoardQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4"/></Button>
                                    <Input type="number" readOnly value={boardQuantity} className="text-center" />
                                    <Button size="icon" variant="outline" onClick={() => setBoardQuantity(q => q + 1)}><Plus className="h-4 w-4"/></Button>
                                </div>
                            </div>
                            <Button onClick={addBoard} className="self-end">Add Board(s)</Button>
                        </div>
                         <Table>
                            <TableHeader><TableRow><TableHead>Board</TableHead><TableHead>L</TableHead><TableHead>W</TableHead><TableHead>T</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {project.boards?.map((b, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{b.name}</TableCell><TableCell>{b.length}</TableCell><TableCell>{b.width}</TableCell><TableCell>{b.thickness}</TableCell>
                                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeBoard(i)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                         <CardTitle>3. Generate Cut Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <Label>Saw Kerf (in)</Label>
                                 <Input type="number" value={project.kerf || ''} onChange={e => handleProjectChange('kerf', parseFloat(e.target.value))} step="0.001" />
                             </div>
                             <div>
                                 <Label>Waste Factor (%)</Label>
                                 <Input type="number" value={project.wasteFactor || ''} onChange={e => handleProjectChange('wasteFactor', parseFloat(e.target.value))} step="1" />
                             </div>
                         </div>
                         <Button onClick={generateCutPlan} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate Cut Plan</Button>
                    </CardContent>
                </Card>

                {cutPlanResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Optimized Cut Plan &amp; Material Estimate</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg bg-secondary p-4">
                                <h4 className="font-semibold">Material Summary</h4>
                                <p><strong>Total Rough Board Feet Needed:</strong> {cutPlanResult.totalBoardFeet.toFixed(2)} BF</p>
                                <p className="text-sm text-muted-foreground">(Includes allowances and waste factor)</p>
                            </div>
                            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                                {Object.values(cutPlanResult.boardPlans).map((plan: any, index: number) => plan.cuts.length > 0 && (
                                    <div key={index} className="rounded-md border p-2">
                                        <h5 className="font-semibold">From Board: {plan.board.length}" x {plan.board.width}"</h5>
                                        <ul className="list-disc pl-5 text-sm">
                                            {plan.cuts.map((cut: any, i: number) => (
                                                <li key={i}>Cut {cut.length}"L x {cut.width}"W for: <em>{cut.name}</em></li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                {cutPlanResult.unplacedParts.length > 0 && (
                                     <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                                        <h4 className="font-semibold">Could Not Place All Parts</h4>
                                        <ul className="list-disc pl-5">
                                            {cutPlanResult.unplacedParts.map((part: any, i) => <li key={i}>{part.name}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <Button onClick={downloadCutSheet} variant="outline" className="w-full"><Download className="mr-2 h-4 w-4"/>Download Cut Sheet PDF</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
