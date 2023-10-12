import { Puzzle } from '../../lib/puzzle.js';

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

        let order = '';
        let oa = Array.from(alpha.keys()).sort();
        while (order.length < alpha.size) {
            // find first alpha that has no prereq
            let first = ''
            oa.filter(a => order.indexOf(a) === -1).some(a => { first = a; return (!prereq.has(a)) || prereq.get(a).size === 0})
            console.log(`first is ${first}`)
            oa.forEach(a => prereq.get(a) && prereq.get(a).delete(first));
            prereq.delete(first);
            order += first;
        }
        console.log(order);
    });