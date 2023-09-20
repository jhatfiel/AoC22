import { assert } from "console";
import { Puzzle } from "../../lib/puzzle.js";
import { TSP } from "../../lib/tsp.js";

const tsp = new TSP();

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    const arr = line.split(/[ \.]/);
    console.log(line);
    let change = (arr[2]==='gain')?Number(arr[3]):-1*Number(arr[3]);
    tsp.addSingleEdge(arr[0], arr[10], change);
};

p.onClose = () => {
    //let path = tsp.getLongestPath();
    let change = 0;
    //console.log(`Result ${path}`);
    /*
    path.forEach((s, ind, arr) => {
        const prev = arr[(ind+(tsp.nodes.size-1))%tsp.nodes.size];
        const next = arr[(ind+1)%tsp.nodes.size];
        change += tsp.edges.get(s)!.get(prev)! + tsp.edges.get(s)!.get(next)!;
        console.log(`${s} is between ${prev} [${tsp.edges.get(s)!.get(prev)!}] and ${next} [${tsp.edges.get(s)!.get(next)!}]`);
    })
    */
    /*
    path.push(path[0]);
    change += tsp.getPathCost(path);
    change += tsp.getPathCost(path.reverse());
    console.log(`Result ${change}`);
    */
    // 511, 668 is too low
    // 733 is the right answer.  Why doesn't tsp get it right?  Because the costs are different per direction.

    change = 0;

    let n1 = new Set(tsp.nodes);
    n1.forEach((a) => {
        let n2 = new Set(n1); n2.delete(a);
        n2.forEach((b) => {
            let n3 = new Set(n2); n3.delete(b);
            n3.forEach((c) => {
                let n4 = new Set(n3); n4.delete(c);
                n4.forEach((d) => {
                    let n5 = new Set(n4); n5.delete(d);
                    n5.forEach((e) => {
                        let n6 = new Set(n5); n6.delete(e);
                        n6.forEach((f) => {
                            let n7 = new Set(n6); n7.delete(f);
                            n7.forEach((g) => {
                                let n8 = new Set(n7); n8.delete(g);
                                // n8 should only have one possibility here
                                assert(n8.size === 1, 'Hopefully this is true');
                                let h = n8.entries().next().value[0];
                                let result = tsp.getPathCost([a, b, c, d, e, f, g, h, a]);
                                result += tsp.getPathCost([h, g, f, e, d, c, b, a, h]);
                                if (result > change) {
                                    console.log(a, b, c, d, e, f, g, h, ` change is ${result}`);
                                    change = result;
                                }
                            })
                        })
                    })
                })
            })
        })
    });
};

p.run();