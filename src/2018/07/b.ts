import { Puzzle } from '../../lib/puzzle.js';

let numWorkers = (process.argv[2] === 'sample')?2:5;
let stepLength = -1*'A'.charCodeAt(0) + ((process.argv[2] === 'sample')?1:61);
let workerStep = Array.from({length: numWorkers}, () => ({step: '', remain: 0}));
const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        let prereq = new Map<string, Set<string>>();
        let alpha = new Set<string>();
        lines.forEach((line) => {
            // Step C must be finished before step A can begin.
            let arr = line.split(' ');
            let pstep = arr[1];
            let step = arr[7];
            if (!prereq.has(step)) prereq.set(step, new Set<string>());
            prereq.get(step).add(pstep);
            alpha.add(step);
            alpha.add(pstep);
        })

        let time = 0;
        let order = '';
        let oa = Array.from(alpha.keys()).sort();
        while (order.length < alpha.size) {
            // finish jobs
            workerStep.forEach(w => { if (w.remain) w.remain--});
            workerStep.forEach(w => {
                if (w.remain === 0 && w.step !== '') {
                    console.log(`Completed ${w.step}`);
                    oa.forEach(a => prereq.get(a) && prereq.get(a).delete(w.step));
                    order += w.step;
                    w.step = '';
                }
            })
            // assign an available job to each worker
            let avail = oa.filter(a => order.indexOf(a) === -1 && (!prereq.has(a) || prereq.get(a).size === 0) && !workerStep.filter(w => w.step === a).length);
            console.log(`avail is ${avail}`);
            let availWorkers = workerStep.filter(w => w.step === '');
            console.log(`availWorkers is ${availWorkers.map(w => JSON.stringify(w))}`);

            avail.forEach(a => {
                if (availWorkers.length) {
                    prereq.delete(a);
                    let w = availWorkers.pop();
                    w.step = a;
                    w.remain = stepLength + a.charCodeAt(0)
                    console.log(`Starting ${JSON.stringify(w)}`);
                }
            })
            time++; // could be optimized to add the minimum amount of time required to complete any worker's job
        }
        console.log(order);
        console.log(`Final time: ${time-1}`)
    });