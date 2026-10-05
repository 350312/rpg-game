import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 50 x 50 map matrix
const rows = 50;
const cols = 50;
const map = Array.from({ length: rows }, () => Array(cols).fill(1)); // default grass (1)

// Tile IDs:
// 1: grass
// 16: dense tree/boundary wall (solid)
// 17: floating boardwalk / bridge (walkable)
// 18: water (solid)
// 19: water wave (solid)
// 32: modern campus academic glass tower (solid)
// 33: stone pavement / garden path (walkable)
// 34: red brick terrace / plaza (walkable)
// 35: pavilion / wooden floor (walkable or solid)
// 36: stairs to archives/lab (walkable)

// 1. Outer boundary trees
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
      map[r][c] = 16;
    } else if (r === 1 || r === rows - 2 || c === 1 || c === cols - 2) {
      if (Math.random() < 0.6) map[r][c] = 16;
    }
  }
}

// 2. FST BUILDING (Faculty of Science & Technology) - North-West Wing
// Columns 6 to 17, Rows 2 to 7
for (let r = 2; r <= 7; r++) {
  for (let c = 6; c <= 17; c++) {
    map[r][c] = 32;
  }
}
// FST Entrance & Underground Tech Lab (Dungeon stairs at Col 11, Row 8)
map[8][11] = 36; // stairs to lab
map[8][10] = 34; // brick foyer
map[8][12] = 34;

// 3. FASS BUILDING (Faculty of Arts & Social Sciences) - North Center, set back
// Columns 21 to 28, Rows 2 to 5
for (let r = 2; r <= 5; r++) {
  for (let c = 21; c <= 28; c++) {
    map[r][c] = 32;
  }
}

// 4. FBS BUILDING (Faculty of Business Studies) - North-East Wing
// Columns 32 to 43, Rows 2 to 7
for (let r = 2; r <= 7; r++) {
  for (let c = 32; c <= 43; c++) {
    map[r][c] = 32;
  }
}
// FBS Plaza in front of building (Rows 8 to 9, Cols 33 to 42)
for (let r = 8; r <= 9; r++) {
  for (let c = 33; c <= 42; c++) {
    map[r][c] = 34;
  }
}

// 5. CENTRAL GARDEN YARD (Resolves picture 4: Place a garden instead of building!)
// Rows 6 to 13, Columns 18 to 30
// In front of FASS and between FST and FBS, where the boardwalk lands!
for (let r = 6; r <= 13; r++) {
  for (let c = 18; c <= 30; c++) {
    if (map[r][c] !== 32) {
      // Lush lawn, flowerbeds, and central brick promenade
      if (c === 23 || c === 24) {
        map[r][c] = 34; // brick garden pathway connecting directly to boardwalk
      } else if (r === 9 || r === 10) {
        map[r][c] = (c % 2 === 0) ? 33 : 1; // garden paver paths
      } else {
        map[r][c] = 1; // garden grass yard
      }
    }
  }
}
// Add some decorative garden shrubs on sides (not blocking paths)
map[7][20] = 16;
map[7][28] = 16;
map[11][19] = 16;
map[11][29] = 16;

// Red brick amphitheater steps along north shoreline (Row 14)
for (let c = 6; c <= 33; c++) {
  if (map[14][c] === 1) map[14][c] = 34;
}

// 6. THE GRAND CAMPUS LAKE (Rows 15 to 35, Columns 5 to 33)
for (let r = 15; r <= 35; r++) {
  for (let c = 5; c <= 33; c++) {
    map[r][c] = (Math.random() < 0.12) ? 19 : 18;
  }
}

// 7. THE FLOATING BOARDWALK BRIDGE (Rows 14 to 36, Columns 22, 23, 24)
for (let r = 14; r <= 36; r++) {
  map[r][22] = 17;
  map[r][23] = 17;
  map[r][24] = 17;
}

// Scenic Observation Deck / Platform (Rows 23 to 27, Columns 25 to 31)
for (let r = 23; r <= 27; r++) {
  for (let c = 25; c <= 31; c++) {
    map[r][c] = 17;
  }
}

// 8. THIRD PLACE ARENA (Resolves picture 3 & 5: Dedicated Third Place Pavilion Arena!)
// Located on the East Lakeside Shore: Columns 34 to 43, Rows 18 to 29
// Paved student plaza & elevated pavilion platform with "THIRD PLACE" sign
for (let r = 18; r <= 29; r++) {
  for (let c = 34; c <= 43; c++) {
    // Stepped patio & paver stones
    if (r >= 20 && r <= 27 && c >= 36 && c <= 42) {
      map[r][c] = 34; // elevated Third Place pavilion floor
    } else {
      map[r][c] = (r % 2 === 0 && c % 2 === 0) ? 33 : 1; // paver plaza
    }
  }
}
// Surrounding shade trees for Third Place pavilion (as seen in photo)
map[18][34] = 16;
map[18][43] = 16;
map[29][34] = 16;
map[29][43] = 16;
map[24][43] = 16;

// 9. FMS BUILDING & UNION (Faculty of Management Studies & Union Café)
// South-West Campus: Columns 6 to 14, Rows 37 to 42
for (let r = 37; r <= 42; r++) {
  for (let c = 6; c <= 14; c++) {
    if (r === 39 && c === 10) {
      map[r][c] = 17; // Café entrance doorway
    } else {
      map[r][c] = 32; // FMS building structure
    }
  }
}
// FMS Lakeside Promenade in front (Rows 36-37, Cols 6 to 21)
for (let r = 36; r <= 37; r++) {
  for (let c = 6; c <= 21; c++) {
    map[r][c] = 34;
  }
}

// 10. SOUTH CAMPUS GARDEN & LOTUS FOUNTAIN
// Columns 21 to 45, Rows 36 to 48
for (let r = 37; r <= 48; r++) {
  for (let c = 21; c <= 45; c++) {
    // Main walkway continuing south from boardwalk
    if (c === 23 || c === 24) {
      map[r][c] = 34;
    }
  }
}
// Lotus Fountain (Healing Pool) at Col 23, Row 44
map[44][23] = 34;
map[44][22] = 34;
map[44][24] = 34;

// Convert to string format (space separated)
const content = map.map(row => row.join(' ')).join('\n') + '\n';

const resMapPath = path.join(rootDir, 'res', 'maps', 'worldmap.txt');
const publicMapPath = path.join(rootDir, 'public', 'res', 'maps', 'worldmap.txt');
const distMapPath = path.join(rootDir, 'dist', 'res', 'maps', 'worldmap.txt');

fs.writeFileSync(resMapPath, content, 'utf8');
if (fs.existsSync(path.dirname(publicMapPath))) {
  fs.writeFileSync(publicMapPath, content, 'utf8');
}
if (fs.existsSync(path.dirname(distMapPath))) {
  fs.writeFileSync(distMapPath, content, 'utf8');
}

console.log('[generate-campus-map] Successfully created UIU Campus Map with FST, FASS, FBS, FMS, Central Garden Yard, and Third Place Arena!');
