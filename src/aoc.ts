import { readFileSync } from "fs";

const classname = process.argv[2];
let year = classname.substring(1, 5);
let day = classname.substring(5, 7);

const dir = `${year}/${day}`;
const javafile = `./${dir}/${classname}.js`;
const datafile = `./data/${dir}/${process.argv[3]}`;
console.debug(`@@@@@@@@@@ DATAFILE: ${datafile} @@@@@@@@@@`); 
import(javafile).then(clazz => {
    console.time(classname);
    let puzzle = new clazz[classname](process.argv[3]);

    puzzle.loadData(readFileSync(datafile, 'utf8').toString().split('\n'));

    while (puzzle.runStep()) { }

    console.log(`Final result: ${puzzle.result}`);
    console.timeEnd(classname);
})
