/**
 * Parses an array of lines and finds where the tokens (represented by the typesArr) are located
 */

export type GridParserMatch = {
    typeIndex: number;
    value: string;
    row: number;
    first: number;
    last: number;
}

export class GridParser {
    constructor(public lines: Array<string>, typeArr: Array<RegExp>) {
        lines.forEach((line, row) => {
            // process each line and find where matches are
            this.grid.push(line.split(''));
            typeArr.forEach((re, typeIndex) => {
                let matches = line.matchAll(re);
                for (const match of matches) {
                    this.matches.push({typeIndex, value: match[0], row, first: match.index, last: match.index + match[0].length-1});
                }
            })
        });
    }
    public grid = new Array<Array<string>>(); // do we need to keep track of this??
    // each RegExp in the typeArr generates a match that can be accessed here
    public matches = new Array<GridParserMatch>();

    getNeighbors(gpm: GridParserMatch, typeIndex: number|undefined): Array<GridParserMatch> {
        let rowFirst = Math.max(0, gpm.row-1);
        let rowLast = Math.min(this.grid.length-1, gpm.row+1);
        let colFirst = Math.max(0, gpm.first-1);
        let colLast = Math.min(this.grid[0].length-1, gpm.last+1);

        return this.matches.filter(m => typeIndex === undefined || m.typeIndex === typeIndex)
                           .filter(m => m.row >= rowFirst && m.row <= rowLast)
                           .filter(m => (m.first >= colFirst && m.first <= colLast) || 
                                        (m.last  >= colFirst && m.last  <= colLast));
    }

    debugGrid() {
        this.grid.forEach(row => {
            console.debug(row.join(''))
        })
    }

    public static FLOAT = new RegExp(/[0-9]+\.[0-9]*/g);
    public static NUMBER = new RegExp(/[0-9]/g);
    public static NUMBERS = new RegExp(/[0-9]+/g);
    public static LETTER = new RegExp(/[a-zA-Z]/g);
    public static LETTERS = new RegExp(/[a-zA-Z]+/g);
    public static ALPHANUM = new RegExp(/[0-9a-zA-Z]/g);
    public static ALPHANUMS = new RegExp(/[0-9a-zA-Z]+/g);
}