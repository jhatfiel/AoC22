import { GridParser } from "../../lib/gridParser.js";
import pkg from '../../../node_modules/terminal-kit/lib/termkit.js'
const { Terminal } = pkg;
import ScreenBuffer from '../../../node_modules/terminal-kit/lib/ScreenBuffer.js'

let term = new Terminal();

export class Simulation {
    iteration = 0;
    boxes = new Array<Box>();
    carts = new Array<Cart>();

    crashed = false;
    firstCrashLocation = '';
    rowOffset = 2;

    parseInput(lines: Array<string>) {
        // the grid has top-left/bottom-right pieces and top-right/bottom-left pieces
        // (and also intersections and minecarts - we'll track those - and straight pieces - we don't care about those)
        // if you find the first top-right/bottom-left piece in a row after the top-left piece, you've hit the corner
        // similar for bottom-right (then bottom-left is just calculated)
        let gridParser = new GridParser(lines, [/\//g, /\\/g, /[\^v<>]/g, /\+/g]);

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
                this.boxes[pInd].intersect(box);
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
    
        this.carts.forEach(cart => {
            term(`Currently have cart ${cart.id} at ${cart.col},${cart.row} facing ${Direction[cart.dir]} (on box ${cart.currentBox.toString()})\n`)
        })

        this.background = Array.from({length: lines.length}, _ => new Array<string>(lines[0].length));

    }

    background: Array<Array<string>>;
    backgroundPrepared = false;

    drawScreen(startRow=0, startCol=0, endRow=Infinity, endCol=Infinity) {
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
            term.saveCursor();
            term.moveTo(1, 1); term(`Iteration number: ${this.iteration}`);
            this.boxes.forEach(box => {
                term.moveTo(box.left+1, box.top+this.rowOffset); term('╔'.padEnd(box.right-box.left, '═') + '╗');
                term.moveTo(box.left+1, box.bottom+this.rowOffset); term('╚'.padEnd(box.right-box.left, '═') + '╝');
                for (let n = 1; n < box.bottom-box.top; n++) {
                    term.moveTo(box.left+1, box.top+this.rowOffset+n); term('║');
                    term.moveTo(box.right+1, box.top+this.rowOffset+n); term('║');
                }
            })

            // draw the intersections last because they overwrite the tracks
            this.boxes.forEach(box => {
                Array.from(box.intersections.keys()).forEach(intersection => {
                    let [row, col] = intersection.split(',').map(Number)
                    term.moveTo(col+1, row+this.rowOffset); term('╬')
                })
            })
            //term.moveTo(1, 2); term(viewport.map(row => row.join('')).join('\n'));
            term.restoreCursor();

            this.backgroundPrepared = true;
        }
    }

/*
▲ going up
◄ going left
► going right
▼ going down
◥ turning from right to up (or up to right)
◤ turning from left to up (or up to left)
◣ turning from left to down (or down to left)
◢ turning from right to down (or down to right)
*/
    drawCarts(startRow=0, startCol=0, endRow=Infinity, endCol=Infinity) {
        term.saveCursor();
        this.carts.sort((a, b) => (a.row === b.row)?a.col-b.col:a.row-b.row).forEach(cart => {
            //term(`Currently have cart ${cart.id} at ${cart.col},${cart.row} facing ${Direction[cart.dir]} (on box ${cart.currentBox.toString()})\n`)
            let c: string;
            if (cart.dir === Direction.UP)    c = '▲';
            if (cart.dir === Direction.LEFT)  c = '◄';
            if (cart.dir === Direction.RIGHT) c = '►';
            if (cart.dir === Direction.DOWN)  c = '▼';
            term.moveTo(cart.col+1, cart.row+this.rowOffset); term(c);
        });
        term.restoreCursor();
    }

    debugCarts() {
        this.carts.sort((a, b) => (a.row === b.row)?a.col-b.col:a.row-b.row).forEach(cart => {
            term(`Currently have cart ${cart.id} at ${cart.col},${cart.row} facing ${Direction[cart.dir]} (on box ${cart.currentBox.toString()})\n`)
        });
    }

    moveCarts() {
        // sort carts by row, then by column
        console.debug(`Iteration: ${this.iteration}`)
        this.carts.sort((a, b) => (a.row === b.row)?a.col-b.col:a.row-b.row).forEach(cart => {
            cart.move();
            this.carts.filter(c => c.id !== cart.id).forEach(c => {
                if (c.row === cart.row && c.col === cart.col) {
                    this.crashed = true;
                    console.debug(`Crash!! Cart #${cart.id} and #${c.id} at ${cart.col},${cart.row}`)
                }
            })
        });
        this.iteration++;
    }
}

export class Box {
    moveAlong(row: number, col: number, dir: Direction): [number, number, Direction] {
             if (row === this.top    && col === this.left  && dir === Direction.UP)    return [row, col+1, Direction.RIGHT];
        else if (row === this.top    && col === this.left  && dir === Direction.LEFT)  return [row+1, col, Direction.DOWN];
        else if (row === this.bottom && col === this.left  && dir === Direction.DOWN)  return [row, col+1, Direction.RIGHT];
        else if (row === this.bottom && col === this.left  && dir === Direction.LEFT)  return [row-1, col, Direction.UP];
        else if (row === this.top    && col === this.right && dir === Direction.UP)    return [row, col-1, Direction.LEFT];
        else if (row === this.top    && col === this.right && dir === Direction.RIGHT) return [row+1, col, Direction.DOWN];
        else if (row === this.bottom && col === this.right && dir === Direction.DOWN)  return [row, col-1, Direction.LEFT];
        else if (row === this.bottom && col === this.right && dir === Direction.RIGHT) return [row-1, col, Direction.UP];
        else if (dir === Direction.UP)    return [row-1, col, dir];
        else if (dir === Direction.LEFT)  return [row, col-1, dir];
        else if (dir === Direction.RIGHT) return [row, col+1, dir];
        else if (dir === Direction.DOWN)  return [row+1, col, dir];
        throw new Error(`Bad directions`)
    }
    constructor(public top: number, public left: number, public right: number, public bottom: number) {}
    intersections = new Map<string, Box>(); // "row,col"

    intersect(pBox: Box) {
        this.intersectHLine(pBox, pBox.top,    pBox.left,  pBox.right); // top of box
        this.intersectVLine(pBox, pBox.left,   pBox.top,   pBox.bottom);  // left side
        this.intersectVLine(pBox, pBox.right,  pBox.top,   pBox.bottom); // right side
        this.intersectHLine(pBox, pBox.bottom, pBox.left,  pBox.right); // bottom of box
    }

    intersectHLine(pBox: Box, row: number, left: number, right: number) {
        if (this.top < row && row < this.bottom) {
            let coord = '';
            if        (left < this.left && this.left < right) {
                coord = `${row},${this.left}`;
            } else if (left < this.right && this.right < right) {
                coord = `${row},${this.right}`;
            }
            if (coord) this.intersections.set(coord, pBox);
        }
    }
    intersectVLine(pBox: Box, col: number, top: number, bottom: number) {
        if (this.left < col && col < this.right) {
            let coord = '';
            if        (top < this.top && this.top < bottom) {
                coord = `${this.top},${col}`;
            } else if (top < this.bottom && this.bottom < bottom) {
                coord = `${this.bottom},${col}`;
            }
            if (coord) this.intersections.set(coord, pBox);
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
    replacedCharacter: ' ';

    move() {
        let key = `${this.row},${this.col}`
        if (this.currentBox.intersections.has(key)) {
            let newDir = this.dir + dirOffset[this.intersectionCounter]
            newDir = ((newDir%4)+4)%4;
            this.intersectionCounter = (this.intersectionCounter+1)%dirOffset.length;
            if (newDir !== this.dir) {
                // jump to a new box
                this.dir = newDir;
                this.currentBox = this.currentBox.intersections.get(key);
                console.debug(`Cart #${this.id} has jumped to a new box`)
            }
        }

        [this.row, this.col, this.dir] = this.currentBox.moveAlong(this.row, this.col, this.dir);
    }
}