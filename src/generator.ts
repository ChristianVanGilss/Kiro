export type CellData = { b?: boolean; n?: number; i?: string };
export type Point = { r: number; c: number };

export type SolverStep = {
  id: number;
  clueId?: number;
  title: string;
  description: string;
  cells: { r: number; c: number; state: 'blocker' | 'safe' | 'item' | 'path' | 'maybe-blocker' | 'maybe-item' | 'maybe-path' | 'unknown'; n?: number; item?: string }[];
  gridSnapshot?: any[][];
};

export type PuzzleData = {
  grid: CellData[][];
  path: Point[];
  story: string[];
  clues: { id: number; text: string; type: 'blocker' | 'item' | 'order' | 'rune' | 'rule' }[];
  solverSteps: SolverStep[];
  seed: string;
  solution: Record<string, { r: number, c: number }>;
  items: string[];
};

function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function generateSeedString(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function seedStringToNumber(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

const ITEM_DESCRIPTIONS: Record<string, string> = {
  'Torii': 'The gateway to the spirit world.',
  'Lantern': 'A light to guide the way.',
  'Compass': 'To find the true path.',
  'Seal': 'A mark of authority.',
  'Hourglass': 'Time flows like sand.',
  'Scroll': 'Ancient wisdom inscribed.',
  'Key': 'Unlocks hidden truths.',
  'Mirror': 'Reflects the soul.',
  'Sword': 'Cuts through deception.',
  'Jewel': 'Shines with inner light.',
  'Passage': 'The way forward.'
};

export function generatePuzzle(
  size: number, 
  numBlockers: number, 
  inputItems: string[],
  rowLabels: string[],
  colLabels: string[],
  movementType: 'orthogonal' | 'diagonal' = 'orthogonal',
  seedString?: string
): PuzzleData {
  let attempts = 0;
  let currentSeed = seedString || generateSeedString();
  let bestPuzzle: PuzzleData | null = null;

  while (attempts < 100) {
    attempts++;
    const prng = mulberry32(seedStringToNumber(currentSeed));

    // Shuffle items (except first and last)
    const middleItems = inputItems.slice(1, -1);
    for (let i = middleItems.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [middleItems[i], middleItems[j]] = [middleItems[j], middleItems[i]];
    }
    const items = [inputItems[0], ...middleItems, inputItems[inputItems.length - 1]];

    const targetLength = size * size - numBlockers;
    let path: Point[] = [];
    let blockers: boolean[][] = [];
    
    // Try generating until successful path
    while (true) {
      blockers = Array.from({ length: size }, () => Array(size).fill(false));
      let placed = 0;
      while (placed < numBlockers) {
        const r = Math.floor(prng() * size);
        const c = Math.floor(prng() * size);
        if (!blockers[r][c]) {
          blockers[r][c] = true;
          placed++;
        }
      }
      path = tryGeneratePathWithBlockers(size, targetLength, blockers, movementType, prng);
      if (path.length === targetLength) break;
    }

    // Initialize grid
    const grid: CellData[][] = Array.from({ length: size }, (_, r) => 
      Array.from({ length: size }, (_, c) => ({ b: blockers[r][c] }))
    );

    // Fill path
    path.forEach((p, idx) => {
      grid[p.r][p.c] = { b: false, n: idx + 1 };
    });

    // Distribute items
    const middleItemsCount = items.length - 2;
    const availableIndices = Array.from({ length: targetLength - 2 }, (_, i) => i + 1);
    
    for (let i = availableIndices.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
    }
    
    const selectedIndices = availableIndices.slice(0, middleItemsCount).sort((a, b) => a - b);
    
    grid[path[0].r][path[0].c].i = items[0];
    selectedIndices.forEach((pathIdx, i) => {
      const p = path[pathIdx];
      grid[p.r][p.c].i = items[i + 1];
    });
    const lastP = path[targetLength - 1];
    grid[lastP.r][lastP.c].i = items[items.length - 1];

    const story = generateStory(items, movementType, prng);
    const { clues, solverSteps, isSolved } = generateLogicAndSolverSteps(grid, path, items, rowLabels, colLabels, size, movementType, prng);

    const solution: Record<string, { r: number, c: number }> = {};
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = grid[r][c];
        if (cell.b) {
          solution[`blocker-${r * size + c}`] = { r, c };
        } else if (cell.n) {
          solution[`number-${cell.n}`] = { r, c };
          if (cell.i) {
            solution[cell.i] = { r, c };
          }
        }
      }
    }

    const puzzle = { grid, path, story, clues, solverSteps, seed: currentSeed, solution, items };
    
    if (isSolved) {
      return puzzle;
    }
    
    bestPuzzle = puzzle; // Keep the last one just in case
    if (seedString) break; // Don't loop if a specific seed was requested
    currentSeed = generateSeedString();
  }

  return bestPuzzle!;
}

function generateStory(items: string[], movementType: 'orthogonal' | 'diagonal', prng: () => number): string[] {
  const intros = [
    "Deep within the mist-shrouded peaks of the Iron Mountains lies the Kiro Fort, a shifting labyrinth of stone and shadow. For centuries, it has guarded the Shogun's most forbidden secrets, its corridors rearranging themselves like a living beast to trap the unworthy. You stand before its heavy gates, a shadow operative tasked with a mission that history has forgotten.",
    "The monks of the Crimson Path were masters of silence and stone. They left behind no maps, only riddles etched into the very foundations of the Kiro Fort. This parchment, found clutched in the cold, stone hands of a guardian who has stood watch for a thousand years, is the only key to the journey ahead. It speaks of a path that breathes, a serpent of light that must be traced through the darkness.",
    "A whisper in the dark, a shadow that moves when you do not. The old gods of the fort demand a specific sequence to unlock the way forward. The air here is thick with the scent of ancient incense and damp earth. Tread carefully, for the secret rooms—the voids where the fort's heart does not beat—hold only the echoes of those who failed before you."
  ];
  const intro = intros[Math.floor(prng() * intros.length)];
  
  const pathDesc = movementType === 'orthogonal' 
    ? "The Serpent's Path is rigid and absolute. It moves only in straight lines—North, South, East, or West—mirroring the cardinal winds. It never deigns to move diagonally, and it never crosses its own wake, for to touch its own tail is to vanish into the void forever."
    : "The Serpent's Path is fluid and unpredictable, crossing boundaries both straight and diagonal like a mountain stream. It slips through the corners of reality, yet it remains a single, unbroken line. It never crosses its own wake, for the path behind you is consumed by the shadows as you move.";

  const itemOrder = `Your journey begins at the **${items[0]}**, the threshold between the known world and the labyrinth. From there, you must gather the sacred relics in the precise order dictated by the ancient rites of the fort. Do not falter, for the relics respond only to the correct sequence. Only when the final artifact is clutched in your hands will the **${items[items.length-1]}** manifest to grant you passage back to the light.`;

  return [intro, pathDesc, itemOrder];
}

const ORDINAL_NUMBERS = [
  'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
  'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth',
  'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth'
];

function generateLogicAndSolverSteps(
  grid: CellData[][], 
  path: Point[], 
  items: string[], 
  rowLabels: string[], 
  colLabels: string[],
  size: number,
  movementType: 'orthogonal' | 'diagonal',
  prng: () => number
): { clues: any[], solverSteps: SolverStep[], isSolved: boolean } {
  const clues: any[] = [];
  const solverSteps: SolverStep[] = [];
  let clueId = 1;
  let stepId = 1;

  type SolverCell = {
    state: 'unknown' | 'safe' | 'blocker' | 'path' | 'item';
    possibleItems: Set<string>;
    pencilMarks: Set<string>;
    maybeBlocker: boolean;
    maybeSafe: boolean;
    item?: string;
    n?: number;
  };

  const solverGrid: SolverCell[][] = Array.from({ length: size }, () => 
    Array.from({ length: size }, () => ({
      state: 'unknown',
      possibleItems: new Set(items),
      pencilMarks: new Set(),
      maybeBlocker: false,
      maybeSafe: false
    }))
  );

  const cloneGrid = (g: SolverCell[][]) => g.map(row => row.map(c => ({
    state: c.state,
    possibleItems: Array.from(c.possibleItems),
    pencilMarks: Array.from(c.pencilMarks),
    maybeBlocker: c.maybeBlocker,
    maybeSafe: c.maybeSafe,
    item: c.item,
    n: c.n
  })));

  const rowCounts = Array(size).fill(0);
  const colCounts = Array(size).fill(0);
  const itemLocations: Record<string, Point> = {};
  const runeLocations: Record<number, Point> = {};

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].b) {
        rowCounts[r]++;
        colCounts[c]++;
      }
      if (grid[r][c].i) itemLocations[grid[r][c].i!] = { r, c };
      if (grid[r][c].n) runeLocations[grid[r][c].n!] = { r, c };
    }
  }

  const placedItems = new Set<string>();
  const knownRows = new Set<number>();
  const knownCols = new Set<number>();

  const runBasicDeductions = (): { changed: boolean; steps: SolverStep[] } => {
    let totalChanged = false;
    const steps: SolverStep[] = [];
    let changed = true;

    while (changed) {
      changed = false;

      // 1. Item Intersection
      for (const item of items) {
        if (placedItems.has(item)) continue;
        const candidates: Point[] = [];
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (solverGrid[r][c].state !== 'blocker' && solverGrid[r][c].possibleItems.has(item)) {
              candidates.push({ r, c });
            }
          }
        }
        if (candidates.length === 1) {
          const p = candidates[0];
          solverGrid[p.r][p.c].state = 'safe';
          solverGrid[p.r][p.c].maybeBlocker = false;
          solverGrid[p.r][p.c].maybeSafe = false;
          solverGrid[p.r][p.c].item = item;
          solverGrid[p.r][p.c].possibleItems.clear();
          solverGrid[p.r][p.c].possibleItems.add(item);
          solverGrid[p.r][p.c].pencilMarks.clear();
          placedItems.add(item);
          // Remove item from all other cells
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (r !== p.r || c !== p.c) {
                solverGrid[r][c].possibleItems.delete(item);
                solverGrid[r][c].pencilMarks.delete(item);
              }
            }
          }
          steps.push({
            id: stepId++,
            title: `Locate ${item}`,
            description: `By cross-referencing clues, the ${item} can only be at ${colLabels[p.c]}/${rowLabels[p.r]}.`,
            cells: [{ r: p.r, c: p.c, state: 'item', item, n: grid[p.r][p.c].n }],
            gridSnapshot: cloneGrid(solverGrid)
          });
          changed = true;
          totalChanged = true;
        }
      }

      // 2. Row Counts
      for (let r = 0; r < size; r++) {
        if (!knownRows.has(r)) continue;
        const target = rowCounts[r];
        let blockers = 0;
        let unknowns: Point[] = [];
        for (let c = 0; c < size; c++) {
          if (solverGrid[r][c].state === 'blocker') blockers++;
          else if (solverGrid[r][c].state === 'unknown') unknowns.push({ r, c });
        }
        if (unknowns.length > 0) {
          if (blockers === target) {
            unknowns.forEach(p => {
              solverGrid[p.r][p.c].state = 'safe';
              solverGrid[p.r][p.c].maybeBlocker = false;
            });
            steps.push({
              id: stepId++,
              title: `Clear ${rowLabels[r]} Row`,
              description: `The ${rowLabels[r]} row already has its ${target} secret rooms. The rest are safe.`,
              cells: unknowns.map(p => ({ ...p, state: 'safe' })),
              gridSnapshot: cloneGrid(solverGrid)
            });
            changed = true;
            totalChanged = true;
          } else if (blockers + unknowns.length === target) {
            unknowns.forEach(p => {
              solverGrid[p.r][p.c].state = 'blocker';
              solverGrid[p.r][p.c].maybeBlocker = false;
              solverGrid[p.r][p.c].pencilMarks.clear();
              solverGrid[p.r][p.c].possibleItems.clear();
            });
            steps.push({
              id: stepId++,
              title: `Seal ${rowLabels[r]} Row`,
              description: `The ${rowLabels[r]} row needs ${target} secret rooms. The remaining spots must be secret.`,
              cells: unknowns.map(p => ({ ...p, state: 'blocker' })),
              gridSnapshot: cloneGrid(solverGrid)
            });
            changed = true;
            totalChanged = true;
          }
        }
      }

      // 3. Col Counts
      for (let c = 0; c < size; c++) {
        if (!knownCols.has(c)) continue;
        const target = colCounts[c];
        let blockers = 0;
        let unknowns: Point[] = [];
        for (let r = 0; r < size; r++) {
          if (solverGrid[r][c].state === 'blocker') blockers++;
          else if (solverGrid[r][c].state === 'unknown') unknowns.push({ r, c });
        }
        if (unknowns.length > 0) {
          if (blockers === target) {
            unknowns.forEach(p => {
              solverGrid[p.r][p.c].state = 'safe';
              solverGrid[p.r][p.c].maybeBlocker = false;
            });
            steps.push({
              id: stepId++,
              title: `Clear ${colLabels[c]} Column`,
              description: `The ${colLabels[c]} column already has its ${target} secret rooms. The rest are safe.`,
              cells: unknowns.map(p => ({ ...p, state: 'safe' })),
              gridSnapshot: cloneGrid(solverGrid)
            });
            changed = true;
            totalChanged = true;
          } else if (blockers + unknowns.length === target) {
            unknowns.forEach(p => {
              solverGrid[p.r][p.c].state = 'blocker';
              solverGrid[p.r][p.c].maybeBlocker = false;
              solverGrid[p.r][p.c].pencilMarks.clear();
              solverGrid[p.r][p.c].possibleItems.clear();
            });
            steps.push({
              id: stepId++,
              title: `Seal ${colLabels[c]} Column`,
              description: `The ${colLabels[c]} column needs ${target} secret rooms. The remaining spots must be secret.`,
              cells: unknowns.map(p => ({ ...p, state: 'blocker' })),
              gridSnapshot: cloneGrid(solverGrid)
            });
            changed = true;
            totalChanged = true;
          }
        }
      }

      // 4. Dead Ends
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (solverGrid[r][c].state === 'unknown') {
            let openNeighbors = 0;
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            if (movementType === 'diagonal') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
            for (const [dr, dc] of dirs) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size && solverGrid[nr][nc].state !== 'blocker') {
                openNeighbors++;
              }
            }
            
            const canBeStartOrEnd = solverGrid[r][c].possibleItems.has(items[0]) || solverGrid[r][c].possibleItems.has(items[items.length - 1]);
            
            if (openNeighbors <= 1 && !canBeStartOrEnd) {
              solverGrid[r][c].state = 'blocker';
              solverGrid[r][c].maybeBlocker = false;
              solverGrid[r][c].pencilMarks.clear();
              solverGrid[r][c].possibleItems.clear();
              steps.push({
                id: stepId++,
                title: `Path Logic: Dead End`,
                description: `The chamber at ${colLabels[c]}/${rowLabels[r]} is a dead end. Since it cannot hold the Torii or Passage, the Serpent cannot enter it. It must be secret.`,
                cells: [{ r, c, state: 'blocker' }],
                gridSnapshot: cloneGrid(solverGrid)
              });
              changed = true;
              totalChanged = true;
            }
          }
        }
      }

      // 5. Distance Parity & Reachability
      for (let i = 1; i < items.length; i++) {
        const prevItem = items[i - 1];
        const currItem = items[i];
        const prevIdx = path.findIndex(p => grid[p.r][p.c].i === prevItem);
        const currIdx = path.findIndex(p => grid[p.r][p.c].i === currItem);
        const dist = currIdx - prevIdx;

        if (placedItems.has(prevItem)) {
          const p1 = itemLocations[prevItem];
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (solverGrid[r][c].possibleItems.has(currItem)) {
                const distMin = movementType === 'orthogonal' 
                  ? Math.abs(r - p1.r) + Math.abs(c - p1.c)
                  : Math.max(Math.abs(r - p1.r), Math.abs(c - p1.c));
                
                let impossible = distMin > dist;
                if (movementType === 'orthogonal' && distMin % 2 !== dist % 2) {
                  impossible = true;
                }

                if (impossible) {
                  solverGrid[r][c].possibleItems.delete(currItem);
                  solverGrid[r][c].pencilMarks.delete(currItem);
                  changed = true;
                  totalChanged = true;
                }
              }
            }
          }
        }
        
        if (placedItems.has(currItem)) {
          const p2 = itemLocations[currItem];
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (solverGrid[r][c].possibleItems.has(prevItem)) {
                const distMin = movementType === 'orthogonal' 
                  ? Math.abs(r - p2.r) + Math.abs(c - p2.c)
                  : Math.max(Math.abs(r - p2.r), Math.abs(c - p2.c));
                
                let impossible = distMin > dist;
                if (movementType === 'orthogonal' && distMin % 2 !== dist % 2) {
                  impossible = true;
                }

                if (impossible) {
                  solverGrid[r][c].possibleItems.delete(prevItem);
                  solverGrid[r][c].pencilMarks.delete(prevItem);
                  changed = true;
                  totalChanged = true;
                }
              }
            }
          }
        }
      }
    }
    return { changed: totalChanged, steps };
  };

  type ClueDefinition = {
    id: number;
    text: string;
    type: 'blocker' | 'item' | 'rune' | 'rule';
    runePoint?: { n: number, p: Point };
    apply: () => { changed: boolean; title: string; description: string; cells: any[] };
  };

  const cluePool: ClueDefinition[] = [];

  const totalSecretRooms = grid.flat().filter(cell => cell.b).length;

  // Helper for ordinals
  function getOrdinalSuffix(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  const getThematicRow = (name: string, lowercase = false) => {
    const phrases = [
      `spanning the realm of the **${name}**`,
      `in the light of the **${name}**`,
      `across the horizon of the **${name}**`,
      `following the trail of the **${name}**`
    ];
    const phrase = phrases[Math.floor(prng() * phrases.length)];
    return lowercase ? phrase : phrase.charAt(0).toUpperCase() + phrase.slice(1);
  };

  const getThematicCol = (name: string, lowercase = false) => {
    const phrases = [
      `within the domain of the **${name}**`,
      `descending the path of the **${name}**`,
      `under the gaze of the **${name}**`,
      `beneath the **${name}**`
    ];
    const phrase = phrases[Math.floor(prng() * phrases.length)];
    return lowercase ? phrase : phrase.charAt(0).toUpperCase() + phrase.slice(1);
  };

  const getThematicTile = (n: number) => {
    const suffix = getOrdinalSuffix(n);
    const phrases = [
      `the **${n}${suffix} glowing rune-tile**`,
      `the **${n}${suffix} unstable stone**`,
      `the **${n}${suffix} slippery step**`,
      `the **${n}${suffix} ancient rune**`
    ];
    return phrases[Math.floor(prng() * phrases.length)];
  };

  const getThematicSecretRoom = (count: number) => {
    if (count === 0) {
      const phrases = [
        `no hidden chambers`,
        `no secret rooms`,
        `no sealed voids`
      ];
      return phrases[Math.floor(prng() * phrases.length)];
    }
    const s = count === 1 ? '' : 's';
    const phrases = [
      `**${count} hidden chamber${s}**`,
      `**${count} secret room${s}**`,
      `**${count} sealed void${s}**`
    ];
    return phrases[Math.floor(prng() * phrases.length)];
  };

  const getThematicNoRelics = () => {
    const phrases = [
      `no relics were found by anyone`,
      `holds no sacred artifacts`,
      `is devoid of any relics`,
      `contains no relics`
    ];
    return phrases[Math.floor(prng() * phrases.length)];
  };

  const getThematicOnlyRelics = (items: string[]) => {
    const joined = items.join('** and the **');
    const phrases = [
      `hides **only** the **${joined}**`,
      `protects **only** the **${joined}**`,
      `reveals **only** the **${joined}**`
    ];
    return phrases[Math.floor(prng() * phrases.length)];
  };

  // 1. Row Clues
  for (let r = 0; r < size; r++) {
    const itemsInRow = items.filter(it => itemLocations[it]?.r === r);
    const count = rowCounts[r];
    const id = clueId++;
    
    const rowPhrase = getThematicRow(rowLabels[r]);
    let text = "";
    if (totalSecretRooms === 0) {
      if (itemsInRow.length > 0) {
        text = `${rowPhrase} ${getThematicOnlyRelics(itemsInRow)}.`;
      } else {
        text = `${rowPhrase}, ${getThematicNoRelics()}.`;
      }
    } else {
      if (itemsInRow.length > 0 && count > 0) {
        text = `${rowPhrase} lies ${getThematicSecretRoom(count)} and it ${getThematicOnlyRelics(itemsInRow)}.`;
      } else if (itemsInRow.length > 0) {
        text = `${rowPhrase} lies ${getThematicSecretRoom(0)}, but it ${getThematicOnlyRelics(itemsInRow)}.`;
      } else if (count > 0) {
        text = `${rowPhrase} lies ${getThematicSecretRoom(count)} and it ${getThematicNoRelics()}.`;
      } else {
        text = `${rowPhrase} lies ${getThematicSecretRoom(0)} and it ${getThematicNoRelics()}.`;
      }
    }
    text = text.charAt(0).toUpperCase() + text.slice(1);

    cluePool.push({
      id,
      type: 'item',
      text,
      apply: () => {
        knownRows.add(r);
        let changed = false;
        const cells: any[] = [];
        
        if (count === 0) {
          for (let c = 0; c < size; c++) {
            if (solverGrid[r][c].state === 'unknown') {
              solverGrid[r][c].state = 'safe';
              solverGrid[r][c].maybeBlocker = false;
              solverGrid[r][c].maybeSafe = false;
              cells.push({ r, c, state: 'safe' });
              changed = true;
            }
          }
        }

        for (let c = 0; c < size; c++) {
          items.forEach(it => {
            if (!itemsInRow.includes(it)) {
              if (solverGrid[r][c].possibleItems.has(it)) {
                solverGrid[r][c].possibleItems.delete(it);
                solverGrid[r][c].pencilMarks.delete(it);
                changed = true;
              }
            }
          });
          itemsInRow.forEach(it => {
            if (solverGrid[r][c].state !== 'blocker' && solverGrid[r][c].possibleItems.has(it)) {
              solverGrid[r][c].pencilMarks.add(it);
              cells.push({ r, c });
              changed = true;
            }
          });
        }

        itemsInRow.forEach(itemInRow => {
          for (let r2 = 0; r2 < size; r2++) {
            if (r2 !== r) {
              for (let c = 0; c < size; c++) {
                if (solverGrid[r2][c].possibleItems.has(itemInRow)) {
                  solverGrid[r2][c].possibleItems.delete(itemInRow);
                  solverGrid[r2][c].pencilMarks.delete(itemInRow);
                  changed = true;
                }
              }
            }
          }
        });

        if (count > 0) {
          for (let c = 0; c < size; c++) {
            if (solverGrid[r][c].state === 'unknown') {
              solverGrid[r][c].maybeBlocker = true;
              solverGrid[r][c].maybeSafe = false;
              cells.push({ r, c });
              changed = true;
            }
          }
        }

        return {
          changed,
          title: `Clue ${id}: ${rowLabels[r]} Row`,
          description: text,
          cells
        };
      }
    });
  }

  // 2. Column Clues
  for (let c = 0; c < size; c++) {
    const itemsInCol = items.filter(it => itemLocations[it]?.c === c);
    const count = colCounts[c];
    const id = clueId++;
    
    const colPhrase = getThematicCol(colLabels[c]);
    let text = "";
    if (totalSecretRooms === 0) {
      if (itemsInCol.length > 0) {
        text = `${colPhrase} ${getThematicOnlyRelics(itemsInCol)}.`;
      } else {
        text = `${colPhrase}, ${getThematicNoRelics()}.`;
      }
    } else {
      if (itemsInCol.length > 0 && count > 0) {
        text = `${colPhrase} lies ${getThematicSecretRoom(count)} and it ${getThematicOnlyRelics(itemsInCol)}.`;
      } else if (itemsInCol.length > 0) {
        text = `${colPhrase} lies ${getThematicSecretRoom(0)}, but it ${getThematicOnlyRelics(itemsInCol)}.`;
      } else if (count > 0) {
        text = `${colPhrase} lies ${getThematicSecretRoom(count)} and it ${getThematicNoRelics()}.`;
      } else {
        text = `${colPhrase} lies ${getThematicSecretRoom(0)} and it ${getThematicNoRelics()}.`;
      }
    }
    text = text.charAt(0).toUpperCase() + text.slice(1);
      
    cluePool.push({
      id,
      type: 'item',
      text,
      apply: () => {
        knownCols.add(c);
        let changed = false;
        const cells: any[] = [];
        
        if (count === 0) {
          for (let r = 0; r < size; r++) {
            if (solverGrid[r][c].state === 'unknown') {
              solverGrid[r][c].state = 'safe';
              solverGrid[r][c].maybeBlocker = false;
              solverGrid[r][c].maybeSafe = false;
              cells.push({ r, c, state: 'safe' });
              changed = true;
            }
          }
        }

        for (let r = 0; r < size; r++) {
          items.forEach(it => {
            if (!itemsInCol.includes(it)) {
              if (solverGrid[r][c].possibleItems.has(it)) {
                solverGrid[r][c].possibleItems.delete(it);
                solverGrid[r][c].pencilMarks.delete(it);
                changed = true;
              }
            }
          });
          itemsInCol.forEach(it => {
            if (solverGrid[r][c].state !== 'blocker' && solverGrid[r][c].possibleItems.has(it)) {
              solverGrid[r][c].pencilMarks.add(it);
              cells.push({ r, c });
              changed = true;
            }
          });
        }

        itemsInCol.forEach(itemInCol => {
          for (let c2 = 0; c2 < size; c2++) {
            if (c2 !== c) {
              for (let r = 0; r < size; r++) {
                if (solverGrid[r][c2].possibleItems.has(itemInCol)) {
                  solverGrid[r][c2].possibleItems.delete(itemInCol);
                  solverGrid[r][c2].pencilMarks.delete(itemInCol);
                  changed = true;
                }
              }
            }
          }
        });
        
        if (count > 0) {
          for (let r = 0; r < size; r++) {
            if (solverGrid[r][c].state === 'unknown') {
              solverGrid[r][c].maybeBlocker = true;
              solverGrid[r][c].maybeSafe = false;
              cells.push({ r, c });
              changed = true;
            }
          }
        }

        return {
          changed,
          title: `Clue ${id}: ${colLabels[c]} Column`,
          description: text,
          cells
        };
      }
    });
  }

  // 3. Item-to-Item Clues
  const distanceCluesMap: Record<string, number> = {};
  
  const getDirectionName = (p1: Point, p2: Point) => {
    const dr = p2.r - p1.r;
    const dc = p2.c - p1.c;
    if (dr === -1 && dc === 0) return 'North';
    if (dr === 1 && dc === 0) return 'South';
    if (dr === 0 && dc === -1) return 'West';
    if (dr === 0 && dc === 1) return 'East';
    if (dr === -1 && dc === -1) return 'North-West';
    if (dr === -1 && dc === 1) return 'North-East';
    if (dr === 1 && dc === -1) return 'South-West';
    if (dr === 1 && dc === 1) return 'South-East';
    return 'Unknown';
  };

  for (let i = 1; i < items.length; i++) {
    const prevItem = items[i - 1];
    const currItem = items[i];
    const prevIdx = path.findIndex(p => grid[p.r][p.c].i === prevItem);
    const currIdx = path.findIndex(p => grid[p.r][p.c].i === currItem);
    const dist = currIdx - prevIdx;
    distanceCluesMap[currItem] = dist;
    
    let text = '';
    
    if (dist === 1) {
      if (movementType === 'diagonal') {
        const pA = path[prevIdx];
        const pB = path[currIdx];
        const dr = Math.abs(pA.r - pB.r);
        const dc = Math.abs(pA.c - pB.c);
        
        if (prng() > 0.5) {
          const dir = getDirectionName(pA, pB);
          text = `The Great Serpent slithers directly **${dir}** from the **${prevItem}** to the **${currItem}** (1 step).`;
        } else {
          const moveType = (dr === 1 && dc === 1) ? 'diagonally' : 'orthogonally (straight)';
          text = `The Serpent glides **${moveType}** from the **${prevItem}** to the **${currItem}** (1 step).`;
        }
      } else {
        text = `The Great Serpent slithers directly from the **${prevItem}** to the **${currItem}** (1 step).`;
      }
    } else {
      text = `The **${currItem}** is exactly **${dist} steps** after the **${prevItem}** along the Serpent's winding path.`;
      
      if (movementType === 'diagonal' && dist <= 3) {
        let isStraight = true;
        const firstStep = { r: path[prevIdx+1].r - path[prevIdx].r, c: path[prevIdx+1].c - path[prevIdx].c };
        for (let k = 1; k < dist; k++) {
          const step = { r: path[prevIdx+k+1].r - path[prevIdx+k].r, c: path[prevIdx+k+1].c - path[prevIdx+k].c };
          if (step.r !== firstStep.r || step.c !== firstStep.c) {
            isStraight = false;
            break;
          }
        }
        
        if (prng() > 0.5) {
          if (isStraight) {
            text += ` The path between them is a perfectly straight line.`;
          } else {
            let turns = 0;
            let currentDir = { r: path[prevIdx+1].r - path[prevIdx].r, c: path[prevIdx+1].c - path[prevIdx].c };
            for (let k = 1; k < dist; k++) {
              const nextDir = { r: path[prevIdx+k+1].r - path[prevIdx+k].r, c: path[prevIdx+k+1].c - path[prevIdx+k].c };
              if (nextDir.r !== currentDir.r || nextDir.c !== currentDir.c) {
                turns++;
                currentDir = nextDir;
              }
            }
            text += ` The path between them makes exactly **${turns}** turn${turns === 1 ? '' : 's'}.`;
          }
        }
      }
    }
    
    const id = clueId++;
    cluePool.push({
      id,
      type: 'item',
      text,
      apply: () => {
        let changed = false;
        const cells: any[] = [];
        const prevLocs: Point[] = [];
        const currLocs: Point[] = [];
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (solverGrid[r][c].possibleItems.has(prevItem)) prevLocs.push({ r, c });
            if (solverGrid[r][c].possibleItems.has(currItem)) currLocs.push({ r, c });
          }
        }
        if (prevLocs.length === 1) {
          const p = prevLocs[0];
          currLocs.forEach(c => cells.push({ r: c.r, c: c.c, highlight: true }));
          cells.push({ r: p.r, c: p.c, highlight: true });
        } else if (currLocs.length === 1) {
          const c = currLocs[0];
          prevLocs.forEach(p => cells.push({ r: p.r, c: p.c, highlight: true }));
          cells.push({ r: c.r, c: c.c, highlight: true });
        }
        return { changed: cells.length > 0, title: `Clue ${id}: Distance Hint`, description: text, cells };
      }
    });
  }

  // 4. Initial Rune Clues
  const pathIndices: number[] = [];
  for (let i = 1; i < path.length - 1; i++) {
    const p = path[i];
    if (!grid[p.r][p.c].i) { // Only generate rune clues for empty tiles, not relics
      pathIndices.push(i);
    }
  }
  for (let i = pathIndices.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [pathIndices[i], pathIndices[j]] = [pathIndices[j], pathIndices[i]];
  }
  
  const numRuneClues = Math.min(3, pathIndices.length);
  for (let i = 0; i < numRuneClues; i++) {
    const rIdx = pathIndices[i];
    const p = path[rIdx];
    const n = rIdx + 1;
    const id = clueId++;
    
    if (prng() > 0.5) {
      cluePool.push({
        id, type: 'rune',
        runePoint: { n, p },
        text: `You will step on ${getThematicTile(n)} at the intersection of **${rowLabels[p.r]}** and **${colLabels[p.c]}**.`,
        apply: () => {
          let changed = false;
          if (solverGrid[p.r][p.c].state !== 'safe') {
            solverGrid[p.r][p.c].state = 'safe';
            solverGrid[p.r][p.c].maybeBlocker = false;
            solverGrid[p.r][p.c].maybeSafe = false;
            solverGrid[p.r][p.c].pencilMarks.clear();
            solverGrid[p.r][p.c].possibleItems.clear();
            changed = true;
          }
          return { changed, title: `Rune Step ${n}`, description: `The ${n}th step is at ${rowLabels[p.r]}/${colLabels[p.c]}.`, cells: [{ r: p.r, c: p.c, state: 'safe', n }] };
        }
      });
    } else {
      const isRow = prng() > 0.5;
      const label = isRow ? rowLabels[p.r] : colLabels[p.c];
      const thematicLoc = isRow ? getThematicRow(label, true) : getThematicCol(label, true);
      const tileText = getThematicTile(n);
      const capitalizedTile = tileText.charAt(0).toUpperCase() + tileText.slice(1);
      cluePool.push({
        id, type: 'rune',
        text: `${capitalizedTile} is located somewhere ${thematicLoc}.`,
        apply: () => {
          const cells = [];
          for (let k = 0; k < size; k++) {
            cells.push(isRow ? { r: p.r, c: k, highlight: true } : { r: k, c: p.c, highlight: true });
          }
          return { changed: false, title: `Rune Step ${n} in ${label}`, description: `The ${n}th step is in the ${label} ${isRow ? 'row' : 'column'}.`, cells };
        }
      });
    }
  }

  const blockersMap = grid.map(row => row.map(cell => cell.b));

  function hasUniquePath(revealedRunes: Record<number, Point>): boolean {
    let pathCount = 0;
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    const targetLength = size * size - blockersMap.flat().filter(b => b).length;
    
    let currentItemIdx = 0;
    const itemSteps: Record<string, number> = {};
    let iterations = 0;
    const MAX_ITERATIONS = 100000; // Prevent freezing

    function dfs(r: number, c: number, step: number) {
      if (pathCount > 1 || iterations > MAX_ITERATIONS) return;
      iterations++;
      
      if (revealedRunes[step]) {
        if (revealedRunes[step].r !== r || revealedRunes[step].c !== c) return;
      }
      
      let isItemLoc = false;
      let foundItem = '';
      for (const item of items) {
        if (itemLocations[item].r === r && itemLocations[item].c === c) {
          isItemLoc = true;
          foundItem = item;
          break;
        }
      }
      
      if (isItemLoc) {
        if (foundItem !== items[currentItemIdx]) return;
        
        if (currentItemIdx > 0) {
          const prevItem = items[currentItemIdx - 1];
          const expectedDist = distanceCluesMap[foundItem];
          if (expectedDist !== undefined) {
            const actualDist = step - itemSteps[prevItem];
            if (actualDist !== expectedDist) return;
          }
        }
        
        itemSteps[foundItem] = step;
        currentItemIdx++;
      }
      
      visited[r][c] = true;
      
      if (step === targetLength) {
        if (isItemLoc && foundItem === items[items.length - 1]) {
          pathCount++;
        }
      } else {
        const dirs = movementType === 'orthogonal' 
          ? [[-1, 0], [1, 0], [0, -1], [0, 1]]
          : [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
          
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc] && !blockersMap[nr][nc]) {
            dfs(nr, nc, step + 1);
          }
        }
      }
      
      visited[r][c] = false;
      if (isItemLoc) {
        currentItemIdx--;
        delete itemSteps[foundItem];
      }
    }
    
    const startLoc = itemLocations[items[0]];
    dfs(startLoc.r, startLoc.c, 1);
    
    // If we hit the iteration limit, assume it's NOT unique to be safe and force more clues
    if (iterations > MAX_ITERATIONS) return false;
    
    return pathCount === 1;
  }

  // --- SOLVER LOOP ---
  const finalClues: any[] = [];
  const revealedRunes: Record<number, Point> = {};
  
  // Shuffle pool to vary puzzles
  for (let i = cluePool.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [cluePool[i], cluePool[j]] = [cluePool[j], cluePool[i]];
  }

  // Reset clueId to 1 for the final sequence
  clueId = 1;

  let isSolved = false;

  for (const clueDef of cluePool) {
    // Assign ID now, in order of execution
    const currentId = clueId++;
    
    // Update the title in the apply function result if needed, 
    // but since we construct the step here, we can just use currentId.
    
    finalClues.push({ id: currentId, text: clueDef.text, type: clueDef.type });
    
    const result = clueDef.apply();
    if (clueDef.runePoint) {
      revealedRunes[clueDef.runePoint.n] = clueDef.runePoint.p;
    }
    
    // Update the title to use the new ID
    // We need to parse the title to replace the old ID if it was baked in, 
    // or just reconstruct it.
    // The previous titles were "Clue {id}: ..." or "Pencil Marks: ...".
    // Let's standardize the title here.
    
    let title = result.title;
    // If the title was generic "Pencil Marks...", prefix it.
    // If it was "Clue {oldId}: ...", replace it.
    if (title.startsWith('Clue ')) {
      title = title.replace(/Clue \d+:/, `Clue ${currentId}:`);
    } else {
      title = `Clue ${currentId}: ${title}`;
    }

    solverSteps.push({
      id: stepId++,
      clueId: currentId,
      title: title,
      description: result.description,
      cells: result.cells,
      gridSnapshot: cloneGrid(solverGrid)
    });

    const deductions = runBasicDeductions();
    deductions.steps.forEach(s => {
      (s as any).clueId = currentId;
      solverSteps.push(s);
    });

    // Check if solved
    isSolved = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (solverGrid[r][c].state === 'unknown') isSolved = false;
      }
    }
    if (placedItems.size < items.length) isSolved = false;

    if (isSolved) {
      if (!hasUniquePath({})) {
        isSolved = false;
      }
    }
    
    if (isSolved) break;
  }

  // If not solved with just row/col clues, add Rune clues
  if (!isSolved) {
    // Try adding rune clues one by one until solved
    const pathIndices: number[] = [];
    for (let i = 1; i < path.length - 1; i++) {
      const p = path[i];
      if (!grid[p.r][p.c].i) { // Only generate rune clues for empty tiles, not relics
        pathIndices.push(i);
      }
    }
    
    // Shuffle indices
    for (let i = pathIndices.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [pathIndices[i], pathIndices[j]] = [pathIndices[j], pathIndices[i]];
    }

    let runesAdded = 0;

    const revealedRunes: Record<number, Point> = {};

    for (const rIdx of pathIndices) {
      const p = path[rIdx];
      const n = rIdx + 1;
      
      // Skip if this cell is already known/safe
      if (solverGrid[p.r][p.c].state !== 'unknown') continue;

      const currentId = clueId++;
      const clue = {
        id: currentId,
        type: 'rune',
        text: `The **${n}${getOrdinalSuffix(n)} step** of the path is found at the intersection of **${rowLabels[p.r]}** and **${colLabels[p.c]}**.`,
      };
      finalClues.push(clue);
      revealedRunes[n] = { r: p.r, c: p.c };
      
      solverGrid[p.r][p.c].state = 'safe';
      solverGrid[p.r][p.c].maybeBlocker = false;
      solverGrid[p.r][p.c].maybeSafe = false;
      solverGrid[p.r][p.c].pencilMarks.clear();
      solverGrid[p.r][p.c].possibleItems.clear();

      solverSteps.push({
        id: stepId++,
        clueId: currentId,
        title: `Clue ${currentId}: Rune Step ${n}`,
        description: clue.text,
        cells: [{ r: p.r, c: p.c, state: 'safe', n }],
        gridSnapshot: cloneGrid(solverGrid)
      });

      runesAdded++;

      const deductions = runBasicDeductions();
      deductions.steps.forEach(s => {
        (s as any).clueId = currentId;
        solverSteps.push(s);
      });

      // Check if solved
      let nowSolved = true;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (solverGrid[r][c].state === 'unknown') nowSolved = false;
        }
      }
      if (placedItems.size < items.length) nowSolved = false;

      if (nowSolved) {
        if (!hasUniquePath(revealedRunes)) {
          nowSolved = false;
        }
      }

      if (nowSolved) {
        isSolved = true;
        break;
      }
    }
  }

  // Removed Golden Rule from clues as it is redundant with game rules

  // Update solverGrid with the final path for the snapshot
  path.forEach((p, idx) => {
    solverGrid[p.r][p.c].state = 'path';
    solverGrid[p.r][p.c].n = idx + 1;
    if (grid[p.r][p.c].i) {
      solverGrid[p.r][p.c].state = 'item';
      solverGrid[p.r][p.c].item = grid[p.r][p.c].i;
    }
  });

  solverSteps.push({
    id: stepId++,
    clueId: -1, // No specific clue, derived from rules
    title: 'Trace the Serpent',
    description: 'With all blockers and items placed, and the order known, there is only one valid Hamiltonian path that visits every single open chamber without crossing itself.',
    cells: path.map((p, idx) => {
      const item = grid[p.r][p.c].i;
      return { 
        r: p.r, 
        c: p.c, 
        state: item ? 'item' : 'path', 
        n: idx + 1,
        item: item
      };
    }),
    gridSnapshot: cloneGrid(solverGrid)
  });
  
  return { clues: finalClues.sort((a,b) => a.id - b.id), solverSteps, isSolved };
}

function tryGeneratePathWithBlockers(size: number, targetLength: number, blockers: boolean[][], movementType: 'orthogonal' | 'diagonal', prng: () => number): Point[] {
  const visited = Array.from({ length: size }, (_, r) => 
    Array.from({ length: size }, (_, c) => blockers[r][c])
  );
  
  let path: Point[] = [];
  let iterations = 0;
  const MAX_ITERATIONS = 5000;

  // Find valid starting points
  const validStarts: Point[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!blockers[r][c]) validStarts.push({ r, c });
    }
  }

  // Shuffle valid starts
  for (let i = validStarts.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [validStarts[i], validStarts[j]] = [validStarts[j], validStarts[i]];
  }

  function dfs(r: number, c: number): boolean {
    if (iterations > MAX_ITERATIONS) return false;
    iterations++;

    visited[r][c] = true;
    path.push({ r, c });

    if (path.length === targetLength) return true;

    const dirs = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    if (movementType === 'diagonal') {
      dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    const neighbors = dirs
      .map(([dr, dc]) => ({ r: r + dr, c: c + dc }))
      .filter(n => n.r >= 0 && n.r < size && n.c >= 0 && n.c < size && !visited[n.r][n.c]);

    // Shuffle neighbors to ensure randomness
    for (let i = neighbors.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
    }

    // Warnsdorff's heuristic: prefer neighbors with FEWER available neighbors 
    neighbors.sort((a, b) => {
      const degA = countFreeNeighbors(a.r, a.c, size, visited, movementType);
      const degB = countFreeNeighbors(b.r, b.c, size, visited, movementType);
      return degA - degB;
    });

    for (const n of neighbors) {
      if (dfs(n.r, n.c)) return true;
    }

    // Backtrack
    visited[r][c] = false;
    path.pop();
    return false;
  }

  for (const start of validStarts) {
    iterations = 0;
    path = [];
    // Reset visited array (except blockers)
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        visited[r][c] = blockers[r][c];
      }
    }
    if (dfs(start.r, start.c)) {
      return path;
    }
  }

  return [];
}

function countFreeNeighbors(r: number, c: number, size: number, visited: boolean[][], movementType: 'orthogonal' | 'diagonal'): number {
  let count = 0;
  const dirs = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];
  if (movementType === 'diagonal') {
    dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
      count++;
    }
  }
  return count;
}
