/**
 * Monster ASCII Art Loader — supports 3D z-layers
 *
 * Format:
 *   [z: -0.4]       starts a new z-depth layer
 *   [line: x1,y1,z1 -> x2,y2,z2]   explicit 3D line segment
 *   - | / \ + X * O   same as before
 *   # comment
 */

export async function loadMonsterFromFile(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Could not load monster: ${url}`);
    return parseMonsterArt(await resp.text());
}

export function parseMonsterArt(text) {
    const rawLines = text.split('\n');
    const blocks = [];   // { z, rows[] }
    const vectors = [];  // final output

    let currentZ = 0;
    let currentRows = [];

    const flushBlock = () => {
        if (currentRows.some(r => r.trim())) {
            blocks.push({ z: currentZ, rows: [...currentRows] });
        }
        currentRows = [];
    };

    for (const raw of rawLines) {
        const t = raw.trim();
        if (t.startsWith('#') || t.startsWith('//') || t === '') continue;

        // [z: X.X]
        const zm = t.match(/^\[z:\s*([-+]?\d*\.?\d+)\]$/);
        if (zm) { flushBlock(); currentZ = parseFloat(zm[1]); continue; }

        // [line: x1,y1,z1 -> x2,y2,z2]  (spaces around commas/values are OK)
        const lm = t.match(/^\[line:\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*->\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]$/);
        if (lm) {
            vectors.push({
                p1: { x: +lm[1], y: +lm[2], z: +lm[3] },
                p2: { x: +lm[4], y: +lm[5], z: +lm[6] }
            });
            continue;
        }

        currentRows.push(raw);
    }
    flushBlock();

    // No [z:] tags → treat whole file as z=0 block
    if (blocks.length === 0) {
        blocks.push({ z: 0, rows: currentRows.filter(r => r.trim()) });
    }
    if (blocks.length === 0 || blocks.every(b => !b.rows.length)) return vectors;

    // Global x-scale: widest row across ALL blocks
    const maxCols = Math.max(1, ...blocks.flatMap(b => b.rows).map(r => r.length));

    for (const { z, rows } of blocks) {
        const numRows = rows.length;
        const numCols = maxCols;

        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < rows[r].length; c++) {
                const ch = rows[r][c];
                if (ch === ' ') continue;

                const cx =  (c + 0.5 - numCols / 2) / numCols;
                const cy =  (numRows / 2 - r - 0.5)  / numRows;
                const hw = 0.5 / numCols;
                const hh = 0.5 / numRows;

                const seg = (x1, y1, x2, y2) =>
                    vectors.push({ p1: {x:x1, y:y1, z}, p2: {x:x2, y:y2, z} });

                const H = () => seg(cx-hw, cy,    cx+hw, cy);
                const V = () => seg(cx,    cy+hh, cx,    cy-hh);
                const U = () => seg(cx-hw, cy-hh, cx+hw, cy+hh); // /
                const D = () => seg(cx-hw, cy+hh, cx+hw, cy-hh); // \

                switch (ch) {
                    case '-': case '_': H(); break;
                    case '|':           V(); break;
                    case '/':           U(); break;
                    case '\\':          D(); break;
                    case '+':           H(); V(); break;
                    case 'X':           U(); D(); break;
                    case '*':           H(); V(); U(); D(); break;
                    case 'O': case 'o':
                        seg(cx-hw, cy+hh, cx+hw, cy+hh);
                        seg(cx+hw, cy+hh, cx+hw, cy-hh);
                        seg(cx+hw, cy-hh, cx-hw, cy-hh);
                        seg(cx-hw, cy-hh, cx-hw, cy+hh);
                        break;
                    default: {
                        const d = hw * 0.5;
                        seg(cx-d, cy, cx+d, cy);
                        seg(cx, cy-d, cx, cy+d);
                    }
                }
            }
        }
    }

    return vectors;
}
