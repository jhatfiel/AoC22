import { GridParser } from '../../lib/gridParser.js';
import { Puzzle } from '../../lib/puzzle.js';

class Box {
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
                coord = `${this.left},${row}`;
            } else if (left < this.right && this.right < right) {
                coord = `${this.right},${row}`;
            }
            if (coord) this.intersections.set(coord, pBox);
        }
    }
    intersectVLine(pBox: Box, col: number, top: number, bottom: number) {
        if (this.left < col && col < this.right) {
            let coord = '';
            if        (top < this.top && this.top < bottom) {
                coord = `${col},${this.top}`;
            } else if (top < this.bottom && this.bottom < bottom) {
                coord = `${col},${this.bottom}`;
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

const dirOffset = [-1, 0, 1];

class Cart {
    constructor(public id: number, public currentBox: Box, public row: number, public col: number, dir: string) {
        this.dir = dirMapping.get(dir);
    }
    dir: Direction;
    intersectionCounter = 0;
}

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        // the grid has top-left/bottom-right pieces and top-right/bottom-left pieces
        // (and also intersections and minecarts - we'll track those - and straight pieces - we don't care about those)
        // if you find the first top-right/bottom-left piece in a row after the top-left piece, you've hit the corner
        // similar for bottom-right (then bottom-left is just calculated)
        let gridParser = new GridParser(lines, [/\//g, /\\/g, /[\^v<>]/g, /\+/g]);

        // find all the boxes first
        // some of these "top-left" entries can be "bottom-right", but we will remove them as we're building boxes
        // ditto with "top-right", some can be "bottom-left"
        let boxes = Array<Box>();
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
            boxes.push(new Box(top, left, right, bottom));

            // finally, bottom-right is the completion of the square
            tlArr = tlArr.filter(m => !(m.row === bottom && m.first === right)); // remove bottom-right
        }

        // find intersections
        // either we use the intersections from the input file itself (if we ask for regex of /\+/g)
        // or we compute them ourselves by doing a pairwise comparison between each box
        boxes.forEach((box, ind) => {
            for (let pInd=ind+1; pInd<boxes.length; pInd++) {
                box.intersect(boxes[pInd]);
            }
        })

        let cartArr = gridParser.matches.filter(m => m.typeIndex === 2)
            .map((gpm, index) => {
                let box = boxes.filter(box => {
                    return box.top === gpm.row && box.left < gpm.first && gpm.first < box.right ||
                           box.bottom === gpm.row && box.left < gpm.first && gpm.first < box.right ||
                           box.left === gpm.first && box.top < gpm.row && gpm.row < box.bottom ||
                           box.right === gpm.first && box.top < gpm.row && gpm.row < box.bottom;
                })[0];
                let cart = new Cart(index, box, gpm.row, gpm.first, gpm.value);
                return cart;
            });
    
        cartArr.forEach(cart => {
            console.debug(`Currently have cart ${cart.id} at ${cart.col},${cart.row} facing ${Direction[cart.dir]} (on box ${cart.currentBox.toString()})`)
        })
    });