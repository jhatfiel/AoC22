import { GridParser } from "../../lib/gridParser.js";
import ScreenBuffer from '../../../node_modules/terminal-kit/lib/ScreenBuffer.js'
import pkg from '../../../node_modules/terminal-kit/lib/termkit.js'
const { Terminal } = pkg;

//const TL = '╔', HOR = '═', TR = '╗';
//const BL = '╚', VER = '║', BR = '╝';
//const CROSS = '╬';
//const TL = '┏', HOR = '━', TR = '┓';
//const BL = '┗', VER = '┃', BR = '┛';
//const CROSS = '╋';
const TL = '┌', HOR = '─', TR = '┐';
const BL = '└', VER = '│', BR = '┘';
const CROSS = '┼';

//const CRASH = '◙';
//const CRASH = '╳';
const CRASH = '▉';
const CART_UP = '▲';
const CART_LEFT = '◀';
const CART_RIGHT = '▶';
const CART_DOWN = '▼';

export class Simulation {
    constructor(public term: typeof Terminal) {}
    iteration = 0;
    boxes = new Array<Box>();
    carts = new Array<Cart>();

    crashLocations = new Array<string>();
    rowOffset = 2;

    numRows: number;
    numCols: number;

    crashJustHappened(): boolean { return this.carts.some(c => c.hide !== c.crashed); }
    getNumRemainingCarts(): number { return this.carts.filter(c => !c.crashed).length; }
    getAnyCrashedCarts(): boolean { return this.carts.some(c => c.crashed); }

    parseInput(lines: Array<string>) {
        // the grid has top-left/bottom-right pieces and top-right/bottom-left pieces
        // (and also intersections and minecarts - we'll track those - and straight pieces - we don't care about those)
        // if you find the first top-right/bottom-left piece in a row after the top-left piece, you've hit the corner
        // similar for bottom-right (then bottom-left is just calculated)
        let gridParser = new GridParser(lines, [/\//g, /\\/g, /[\^v<>]/g, /\+/g]);
        this.numRows = gridParser.grid.length;
        this.numCols = gridParser.grid.map(row => row.length).reduce((acc, len) => acc = Math.max(acc, len), 0);

        // find all the boxes first
        // some of these "top-left" entries can be "bottom-right", but we will remove them as we're building boxes
        // ditto with "top-right", some can be "bottom-left"
        let tlArr = gridParser.matches.filter(m => m.typeIndex === 0);
        let trArr = gridParser.matches.filter(m => m.typeIndex === 1);

        while (tlArr.length) {
            // because of how the matches are built, the FIRST entry in tlArr will always be TL of a box
            let top=0, left=0, right=0, bottom=0;
            let tl = tlArr.shift();
            top = tl.row; left = tl.first;
            // the top-right is the first trArr entry
            let tr = trArr.shift();
            right = tr.last;

            // finding the bottom-left in the trArr entry is a little more difficult, but not much.
            // It'll be the first one we come across who's "first" matches ours.
            let bl = trArr.filter(m => m.first === tl.first)[0];
            trArr = trArr.filter(m => !(m.row === bl.row && m.first === bl.first)); // remove it
            bottom = bl.row;
            this.boxes.push(new Box(top, left, right, bottom));

            // finally, bottom-right is the completion of the square
            tlArr = tlArr.filter(m => !(m.row === bottom && m.first === right)); // remove bottom-right
        }

        // find intersections
        // either we use the intersections from the input file itself (if we ask for regex of /\+/g)
        // or we compute them ourselves by doing a pairwise comparison between each box
        this.boxes.forEach((box, ind) => {
            for (let pInd=ind+1; pInd<this.boxes.length; pInd++) {
                box.intersect(this.boxes[pInd]);
                //this.boxes[pInd].intersect(box);
            }
        })

        this.carts = gridParser.matches.filter(m => m.typeIndex === 2)
            .map((gpm, index) => {
                // find what box the cart is on
                let box = this.boxes.filter(box => {
                    return box.top === gpm.row && box.left < gpm.first && gpm.first < box.right ||
                           box.bottom === gpm.row && box.left < gpm.first && gpm.first < box.right ||
                           box.left === gpm.first && box.top < gpm.row && gpm.row < box.bottom ||
                           box.right === gpm.first && box.top < gpm.row && gpm.row < box.bottom;
                })[0];
                let cart = new Cart(index, box, gpm.row, gpm.first, gpm.value);
                return cart;
            });
    
        this.background = Array.from({length: lines.length}, _ => new Array<string>(lines[0].length));
    }

    background: Array<Array<string>>;
    backgroundPrepared = false;

    prepareBackground() {
        //term.fullscreen(true);
        //term.moveTo(1, 1);
        //term("Hi");
        //setTimeout(_ => {term.fullscreen(false);}, 5000);

        // draw the boxes:
        /*
        let screenBuffer = new ScreenBuffer({dst: term, x: 1, y: 1, noFill: true});
        screenBuffer.moveTo(1, 1);
        screenBuffer.put({}, 'Testing');
        screenBuffer.draw();
        */
        if (!this.backgroundPrepared) {
            this.background = Array.from({length: this.numRows}, _ => ''.padStart(this.numCols).split(''));
            this.boxes.forEach(box => {
                this.background[box.top   ][box.left] = TL; this.background[box.top   ][box.right] = TR;
                this.background[box.bottom][box.left] = BL; this.background[box.bottom][box.right] = BR;
                for (let n = box.left+1; n < box.right; n++) {
                    this.background[box.top   ][n] = HOR;
                    this.background[box.bottom][n] = HOR;
                }
                for (let n = box.top+1; n < box.bottom; n++) {
                    this.background[n][box.left ] = VER;
                    this.background[n][box.right] = VER;
                }
            })

            // draw the intersections last because they overwrite the tracks
            this.boxes.forEach(box => {
                Array.from(box.intersections.keys()).forEach(intersection => {
                    let [row, col] = intersection.split(',').map(Number)
                    this.background[row][col] = CROSS;
                })
            })
            //term.moveTo(1, 2); term(viewport.map(row => row.join('')).join('\n'));

            this.backgroundPrepared = true;
        }
    }

    drawScreen(outputRow=1, outputCol=1, showGrid=true, startRow=0, startCol=0, height, width) {
        this.term.saveCursor();
        this.term.moveTo(outputCol, outputRow); this.term(`Iteration number: ${this.iteration} Crashes: ${this.crashLocations.join(' / ')}`);
        if (showGrid) {
            startRow = Math.max(startRow, 0);
            startCol = Math.max(startCol, 0);
            let endRow = Math.min(startRow+height, this.numRows);
            let endCol = Math.min(startCol+width, this.numCols);
            if (endRow - startRow < height) startRow = Math.max(0, endRow-height);
            if (endCol - startCol < width)  startCol = Math.max(0, endCol-width);
            for (let row=startRow; row<endRow; row++) {
                let rowArr = this.background[row].slice(startCol, endCol);
                this.carts.filter(cart => !cart.hide && cart.row === row && startCol <= cart.col && cart.col <= endCol).forEach(cart => {
                    let c: string;
                    if (cart.dir === Direction.UP)    c = CART_UP;
                    if (cart.dir === Direction.LEFT)  c = CART_LEFT;
                    if (cart.dir === Direction.RIGHT) c = CART_RIGHT;
                    if (cart.dir === Direction.DOWN)  c = CART_DOWN;
                    if (cart.crashed) c = CRASH;
                    rowArr[cart.col-startCol] = c;
                })
                this.term.moveTo(outputCol, outputRow + (row-startRow) + 1).eraseLineAfter();
                this.term(rowArr.join(''));
            }
        }
        this.term.restoreCursor();
    }

    debugCarts(outputRow=1, outputCol=1) {
        this.term.saveCursor();
        this.carts.sort((a, b) => a.id - b.id).forEach((cart, ind) => {
            this.term.moveTo(outputCol, outputRow+ind);
            if (cart.crashed) {
                this.term(`#[%[L2]s]: CRASHED - `, cart.id);
            } else {
                this.term(`#[%[L2]s]: at %[L3]s,%[L3]s facing %[L5]s (on box %[L17]s)`, cart.id, cart.col, cart.row, Direction[cart.dir], cart.currentBox.toString());
            }
        });
        this.term.restoreCursor();
    }

    moveCarts() {
        this.carts.forEach(cart => cart.hide = cart.crashed);

        // sort carts by row, then by column
        this.carts.sort((a, b) => (a.row === b.row)?a.col-b.col:a.row-b.row).forEach(cart => {
            if (!cart.crashed) {
                cart.move();
                this.carts.filter(c => !c.crashed && c.id !== cart.id).forEach(c => {
                    if (c.row === cart.row && c.col === cart.col) {
                        cart.crashed = true;
                        c.crashed = true;
                        this.crashLocations.push(`[${this.iteration}]:${cart.col},${cart.row}`);
                    }
                })
            }
        });
        this.iteration++;
    }
}

export class Box {
    moveAlong(row: number, col: number, dir: Direction): [number, number, Direction] {
             if (dir === Direction.UP)    row--;
        else if (dir === Direction.LEFT)  col--;
        else if (dir === Direction.RIGHT) col++;
        else if (dir === Direction.DOWN)  row++;

             if (row === this.top    && col === this.left  && dir === Direction.UP)    dir = Direction.RIGHT;
        else if (row === this.top    && col === this.left  && dir === Direction.LEFT)  dir = Direction.DOWN;
        else if (row === this.bottom && col === this.left  && dir === Direction.DOWN)  dir = Direction.RIGHT;
        else if (row === this.bottom && col === this.left  && dir === Direction.LEFT)  dir = Direction.UP;
        else if (row === this.top    && col === this.right && dir === Direction.UP)    dir = Direction.LEFT;
        else if (row === this.top    && col === this.right && dir === Direction.RIGHT) dir = Direction.DOWN;
        else if (row === this.bottom && col === this.right && dir === Direction.DOWN)  dir = Direction.LEFT;
        else if (row === this.bottom && col === this.right && dir === Direction.RIGHT) dir = Direction.UP;

        return [row, col, dir];
    }
    constructor(public top: number, public left: number, public right: number, public bottom: number) {}
    intersections = new Map<string, Box>(); // "row,col"

    intersect(pBox: Box) {
        this.intersectHLine(pBox, pBox.top,    pBox.left,  pBox.right);  // top of box
        this.intersectVLine(pBox, pBox.left,   pBox.top,   pBox.bottom); // left side
        this.intersectVLine(pBox, pBox.right,  pBox.top,   pBox.bottom); // right side
        this.intersectHLine(pBox, pBox.bottom, pBox.left,  pBox.right);  // bottom of box
    }

    intersectHLine(pBox: Box, row: number, left: number, right: number) {
        if (this.top < row && row < this.bottom) {
            let coords = new Array<string>();
            if (left < this.left  && this.left  < right) coords.push(`${row},${this.left}`);
            if (left < this.right && this.right < right) coords.push(`${row},${this.right}`);
            coords.forEach(c => { this.intersections.set(c, pBox); pBox.intersections.set(c, this); })
        }
    }
    intersectVLine(pBox: Box, col: number, top: number, bottom: number) {
        if (this.left < col && col < this.right) {
            let coords = new Array<string>();
            if (top < this.top    && this.top    < bottom) coords.push(`${this.top},${col}`);
            if (top < this.bottom && this.bottom < bottom) coords.push(`${this.bottom},${col}`);
            coords.forEach(c => { this.intersections.set(c, pBox); pBox.intersections.set(c, this); })
        }
    }

    toString(): string {
        return `${this.left},${this.top} - ${this.right},${this.bottom}`;
    }
}

enum Direction { RIGHT, UP, LEFT, DOWN };
const dirMapping = new Map<string, Direction>();
dirMapping.set('>', Direction.RIGHT);
dirMapping.set('^', Direction.UP);
dirMapping.set('<', Direction.LEFT);
dirMapping.set('v', Direction.DOWN);

const dirOffset = [1, 0, -1];

export class Cart {
    constructor(public id: number, public currentBox: Box, public row: number, public col: number, dir: string) {
        this.dir = dirMapping.get(dir);
    }
    dir: Direction;
    intersectionCounter = 0;
    crashed = false;
    hide = false;

    move() {
        [this.row, this.col, this.dir] = this.currentBox.moveAlong(this.row, this.col, this.dir);

        let key = `${this.row},${this.col}`;

        if (this.currentBox.intersections.has(key)) {
            let newDir = this.dir + dirOffset[this.intersectionCounter]
            newDir = ((newDir%4)+4)%4;
            this.intersectionCounter = (this.intersectionCounter+1)%dirOffset.length;
            if (newDir !== this.dir) {
                // jump to a new box
                this.dir = newDir;
                this.currentBox = this.currentBox.intersections.get(key);
            }
        }
    }

    toString(): string {
        return `Cart #${this.id} at ${this.col},${this.row}`
    }
}