import { readFileSync, appendFileSync } from "fs";
import { performance } from "perf_hooks";

const classname = process.argv[2];
const input = process.argv[3];
if (!classname || !/^[a-zA-Z]\d{6}$/.test(classname) || !input) {
    throw new Error('Select a puzzle file such as a202601.ts and an input file before launching.');
}

let year = classname.substring(1, 5);
let day = classname.substring(5, 7);

const dir = `${year}/${day}`;
const puzzlefile = `./${dir}/${classname}.${import.meta.url.endsWith('.ts') ? 'ts' : 'js'}`;
const datafile = `./data/${dir}/${input}`;
const benchfile = `./src/${dir}/bench.txt`;
console.debug(`@@@@@@@@@@ DATAFILE: ${datafile} @@@@@@@@@@`); 
import(puzzlefile).then(clazz => {
    if (typeof clazz[classname] !== 'function') {
        throw new Error(`Puzzle module ${puzzlefile} does not export ${classname}.`);
    }
    performance.mark("start");
    let puzzle = new clazz[classname](input);

    puzzle.loadData(readFileSync(datafile, 'utf8').toString().split(/\r?\n/));

    while (puzzle.runStep()) { }

    console.log(`Final result: ${puzzle.result}`);
    appendFileSync(benchfile, `[${(process.env['HOSTNAME'] ?? process.env['COMPUTERNAME'] ?? 'UNKNOWN').padStart(20, ' ').substring(0, 20)}] / ${(new Date()).toISOString()}: [${performance.measure(classname, "start").duration.toFixed(2).toString().padStart(10, ' ')}ms] Ran ${classname} with ${datafile} resulting in ${puzzle.result}\n`);
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
