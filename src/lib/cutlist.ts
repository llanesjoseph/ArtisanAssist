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

interface CutlistInput {
    parts: Part[];
    boards: Board[];
    kerf: number;
    wasteFactor: number; // as percentage
}

// A simple First Fit Decreasing algorithm for 1D bin packing
export function optimizeCutlist({ parts, boards, kerf, wasteFactor }: CutlistInput) {
    if (!parts || parts.length === 0 || !boards || boards.length === 0) {
        return { totalBoardFeet: 0, boardPlans: {}, unplacedParts: parts || [] };
    }

    // Sort parts by length, descending, to improve packing
    const sortedParts = [...parts].sort((a, b) => b.length - a.length);

    const boardPlans: { [key: string]: { board: Board; cuts: Part[] } } = {};
    boards.forEach((board, index) => {
        boardPlans[`board_${index}`] = { board, cuts: [] };
    });

    const boardRemainingLengths = boards.map(b => b.length);
    const unplacedParts: Part[] = [];
    
    // Attempt to place each part
    sortedParts.forEach(part => {
        let placed = false;
        // Find the first board that can fit the part
        for (let i = 0; i < boards.length; i++) {
            // Simple check: does it fit thickness-wise and width-wise?
            const board = boards[i];
            if (part.thickness <= board.thickness && part.width <= board.width) {
                 if (part.length <= boardRemainingLengths[i]) {
                    boardPlans[`board_${i}`].cuts.push(part);
                    boardRemainingLengths[i] -= (part.length + kerf);
                    placed = true;
                    break;
                }
            }
        }
        if (!placed) {
            unplacedParts.push(part);
        }
    });
    
    let totalVolume = 0;
    Object.values(boardPlans).forEach(plan => {
        plan.cuts.forEach(cut => {
            totalVolume += cut.length * cut.width * cut.thickness;
        });
    });

    // Calculate total board feet needed
    // This is a simplified calculation based on the volume of placed parts + waste factor
    const totalBoardFeet = (totalVolume / 144) * (1 + wasteFactor / 100);

    return { totalBoardFeet, boardPlans, unplacedParts };
}
