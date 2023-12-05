import { Puzzle } from "../../lib/puzzle.js";

type Range = {
    from: number;
    to: number;
}

enum CategoryType { SEED, SOIL, FERTILIZER, LIGHT, WATER, TEMP, HUMIDITY, LOCATION }
const CATEGORIES = Object.keys(CategoryType).filter(key => Number.isInteger(Number(key))).map(Number);
const NUM_CATEGORIES = CATEGORIES.length;

class Mapping {
    constructor() {
        CATEGORIES.forEach(cat => this.mapping[cat] = {from: 0, to: Infinity})
    }
    
    splitRange(category: CategoryType, from: number): Mapping {
        let newMapping = this.clone();
        // update this to stop at from-1
        let diff = from-1 - this.mapping[category].from
        CATEGORIES.forEach(cat => this.mapping[cat].to = this.mapping[cat].from + diff);

        // update newMapping to start at from
        CATEGORIES.forEach(cat => newMapping.mapping[cat].from = this.mapping[cat].from + diff + 1);
        return newMapping;
    }

    updateMapping(category: CategoryType, originalFrom: number, originalTo: number) {
        let delta = this.mapping[category].from - originalFrom;
        let length = this.mapping[category+1].to - this.mapping[category+1].from;
        this.mapping[category+1].from = originalTo + delta;
        this.mapping[category+1].to   = this.mapping[category+1].from + length;
        CATEGORIES.filter(c => c > category+1).forEach(c => {
            this.mapping[c].from = this.mapping[c-1].from;
            this.mapping[c].to   = this.mapping[c-1].to;
        })
    }

    clone(): Mapping {
        let newMapping = new Mapping();
        CATEGORIES.forEach(cat => newMapping.mapping[cat] = {from: this.mapping[cat].from, to: this.mapping[cat].to});
        return newMapping;
    }

    mapping = new Array<Range>(NUM_CATEGORIES);
}

class SeedMapping {
    constructor() {
        this.mappings.push(new Mapping());
    }

    process(category: CategoryType, originalFrom: number, newFrom: number, length: number) {
        let i=0;
        let originalTo = originalFrom+length-1;
        // first, split any mappings that contain originalFrom or originalTo
        while (i < this.mappings.length) {
            let m = this.mappings[i];
            if (m.mapping[category].from < originalFrom && originalFrom <= m.mapping[category].to) {
                let newMapping = m.splitRange(category, originalFrom);
                if (newMapping.mapping[category].to >= newMapping.mapping[category].from) this.mappings.splice(i+1, 0, newMapping);
            }
            if (m.mapping[category].from <= originalTo && originalTo < m.mapping[category].to) {
                let newMapping = m.splitRange(category, originalTo+1);
                if (newMapping.mapping[category].to >= newMapping.mapping[category].from) this.mappings.splice(i+1, 0, newMapping);
            }

            i++;
        }
        // once the mappings are all split where they need to be, handle converting from original numbers to new numbers
        this.mappings.filter(m => originalFrom <= m.mapping[category].from && m.mapping[category].to <= originalTo).forEach(m => {
            m.updateMapping(category, originalFrom, newFrom);
        })
    }

    mappings = new Array<Mapping>();
}

const puzzle = new Puzzle(process.argv[2]);
let requestedRanges = new Array<Range>;
let seedMapping = new SeedMapping();

await puzzle.run()
    .then((lines: Array<string>) => {
        let sourceArr = lines[0].split(':')[1].trim().split(' ').map(Number);
        for (let i=0; i<sourceArr.length/2; i++) {
            let from = sourceArr[i*2];
            let to   = from + sourceArr[i*2 + 1];
            requestedRanges.push({from, to});
        }

        //debugState();

        let category = CategoryType.SEED;
        lines.slice(2).forEach(line => {
            if (line === '') category++;
            else if (!line.endsWith('map:')) {
                // process mapping numbers
                //console.debug(`${CategoryType[category]} ${line}`);
                let arr = line.split(' ').map(Number);
                seedMapping.process(category, arr[1], arr[0], arr[2]);
                //puzzle.waitForEnter();
            }
        });

        //debugState();

        let overallLowestLocation = Infinity;
        requestedRanges.forEach(requestRange => {
            // for each requested range of seeds
            let from = requestRange.from;
            let to = requestRange.to;
            // look for any seed mappings that cover this range
            seedMapping.mappings.filter(mapping => {
                return (from <= mapping.mapping[CategoryType.SEED].from && mapping.mapping[CategoryType.SEED].from <= to) ||
                       (from <= mapping.mapping[CategoryType.SEED].to   && mapping.mapping[CategoryType.SEED].to <= to)
            }).forEach(mapping => {
                // for each of those mappings, find the lowest location that seeds from this range could have mapped to.
                // the lowest location is the FIRST seed in this mapping if our requested range of seeds completely covers the mapping
                //   or it's just the delta between this mapping's first seed and our requested range's first seed
                let seedMappingFrom = mapping.mapping[CategoryType.SEED].from;
                let locationMappingFrom = mapping.mapping[CategoryType.LOCATION].from;
                let lowestLocation = Infinity;
                if (seedMappingFrom >= from) {
                    // just use the locationMappingFrom since the requested range covers the whole mapping
                    lowestLocation = locationMappingFrom;
                } else {
                    // otherwise, we have to take the difference between seedMappingFrom and from
                    lowestLocation = locationMappingFrom + (from-seedMappingFrom);
                }
                if (lowestLocation < overallLowestLocation) {
                    overallLowestLocation = lowestLocation;
                }
            })
        })
        console.log(`Overall lowest location is: ${overallLowestLocation}`)
    });

function debugState(clearScreen = true) {
    const CAT_WIDTH=37; // 17
    const NUM_WIDTH=(CAT_WIDTH-1)/2;
    //const PRINT_CATEGORIES=CATEGORIES; 
    const PRINT_CATEGORIES=[CategoryType.SEED, CategoryType.LOCATION];
    if (process.stdout.isTTY) {
        if (clearScreen) {
            process.stdout.cursorTo(0, 0);
            process.stdout.clearScreenDown();
        }

        console.debug(`Current Mapping`);
        let line = '';
        PRINT_CATEGORIES.forEach(i => {
            let categoryString = CategoryType[i];
            line += categoryString.padStart(categoryString.length + Math.ceil((CAT_WIDTH-categoryString.length)/2), ' ').padEnd(CAT_WIDTH, ' ') + ' ';
        })
        console.debug(line);
        seedMapping.mappings.forEach(mapping => {
            line = '';
            PRINT_CATEGORIES.forEach(i => {
                line += mapping.mapping[i].from.toString().padStart(NUM_WIDTH, ' ') + '-' + mapping.mapping[i].to.toString().padEnd(NUM_WIDTH, ' ') + ' ';
            })
            console.debug(line);
        })
    }
}
