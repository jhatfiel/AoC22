import { Puzzle } from '../../lib/puzzle.js';
import { Grid, Pair } from '../../lib/grid.js';

const puzzle = new Puzzle(process.argv[2]);
let grid = new Grid({x:2, y:2});

grid.grid[0][1] = true;
grid.grid[1][2] = true;
grid.grid[2][0] = true;
grid.grid[2][1] = true;
grid.grid[2][2] = true;

// simple lookup based on the key
let rules = new Map<string, Array<Array<boolean>>>();

puzzle.onLine = (line) => {
    // record the rules:
    // xx/xx => xxx/xxx/xxx
    // xxx/xxx/xxx => xxxx/xxxx/xxxx/xxxx
    //console.log(line);
    let [from, to] = line.split(' => ');
    let fromArr = from.split('/');
    let toArr = to.split('/');
    let fromRule = fromArr.map(rowStr => rowStr.split('').map(c => c==='#'))
    let toRule = toArr.map(rowStr => rowStr.split('').map(c => c==='#'))
    // record all rotations and reflections of the first part as going to the second part
    rules.set(from, toRule);
    fromRule = rotateCW(fromRule); rules.set(toKey(fromRule), toRule); rules.set(toKey(reflect(fromRule)), toRule);
    fromRule = rotateCW(fromRule); rules.set(toKey(fromRule), toRule); rules.set(toKey(reflect(fromRule)), toRule);
    fromRule = rotateCW(fromRule); rules.set(toKey(fromRule), toRule); rules.set(toKey(reflect(fromRule)), toRule);
}

puzzle.onClose = () => {
    let maxIteration = 5;
    maxIteration = 18;
    for (let i=0; i<maxIteration; i++) {
        let newGrid: Grid;
        console.log(`[${i}] Beginning of iteration`);
        grid.debug();
        // create new grid object based on math (*3/2 or *4/3)
        let widthFrom: number;
        let widthTo: number;
        if (grid.grid.length % 2 === 0) {
            widthFrom = 2;
            widthTo = 3;
        } else {
            widthFrom = 3;
            widthTo = 4;
        }
        let newSize = grid.grid.length * (widthTo/widthFrom);
        newGrid = new Grid({x: newSize-1, y: newSize-1});

        // separate the grid into chunks
        let iterations = grid.grid.length / widthFrom;
        for (let col = 0; col < iterations; col++) {
            for (let row = 0; row < iterations; row++) {
                // make a key of this part of the grid and run lookup
                let key = toKey(grid.grid.slice(row*widthFrom, (row+1)*widthFrom).map(row => row.slice(col*widthFrom, (col+1)*widthFrom)));
                let translation = rules.get(key);
                //console.log(`${col}/${row} key is ${key}, translation is ${toKey(translation)}`);
                // add resulting row/columns to existing grid (can just use simple math offsets?)
                for (let c=0; c < widthTo; c++) {
                    for (let r=0; r < widthTo; r++) {
                        newGrid.grid[row*widthTo + r][col*widthTo + c] = translation[r][c];
                    }
                }
            }
        }

        console.log(`[${i}] resulting grid`);
        grid = newGrid;
        grid.debug();
        console.log(`[${i}] End of iteration`);
    }
    console.log(`Total on: ${grid.getOn().length}`);
}

puzzle.run();

function toKey(chunk: Array<Array<boolean>>) {
    return chunk.map(row => row.map(b => b?'#':'.').join('')).join('/');
}

function debug(chunk: Array<Array<boolean>>) {
    console.log(chunk.map(row => row.map(b => b?'#':'.').join('')).join('\n'));
}

function rotateCW(chunk: Array<Array<boolean>>) {
    let maxRow = chunk.length;
    let maxCol = chunk[0].length;
    let newChunk = Array.from({length: maxCol}, () => new Array<boolean>(maxRow).fill(false));
    for (let row=0; row<maxRow; row++) {
        for (let col=0; col<maxCol; col++) {
            newChunk[col][maxRow-row-1] = chunk[row][col]
        }
    }
    return newChunk;
}

function reflect(chunk: Array<Array<boolean>>) {
    return [...chunk].reverse(); // I guess we don't want to modify the existing array or something
}