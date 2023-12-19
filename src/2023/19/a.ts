import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

class Workflow {
    constructor(line: string) {
        let arr = line.replace(/}/, '').split(/[{:,]/);
        this.name = arr[0];

        for (let i=0; i<arr.length-2; i+=2) {
            // todo
            let rule = arr[i+1];
            let workflow = arr[1+i+1];
            let prop = rule.substring(0, 1);
            let isLessThan = rule.substring(1, 2) === '<';
            let value = Number(rule.substring(2));
            this.conditionArr.push({
                check: (p: PartRating) => { return isLessThan?p[prop]<value:p[prop]>value; },
                workflow
            })
        }

        this.defaultWorkflow = arr[arr.length-1];
    }

    public name: string;
    public conditionArr = new Array<{check: (p: PartRating) => boolean, workflow: string}>();
    public defaultWorkflow: string;

    public getNewWorkflow(pr: PartRating): string {
        let newWorkflow = this.defaultWorkflow;

        for (let i=0; i<this.conditionArr.length; i++) {
            let c = this.conditionArr[i];
            if (c.check(pr)) {
                newWorkflow = c.workflow;
                break;
            }
        }

        return newWorkflow;
    }
}

type PartRating = {
    x: number;
    m: number;
    a: number;
    s: number;
}

//let prWfMapping = new Map<string, Array<PartRating>>();
let workflowSet = new Map<string, Workflow>();

await puzzle.run()
    .then((lines: Array<string>) => {
        let wfDone = false;
        let initialState = 'in';
        let total = 0;
        lines.forEach(line => {
            if (line === '') {
                wfDone = true;
            } else {
                if (!wfDone) {
                    // process workflows
                    let wf = new Workflow(line);
                    //prWfMapping.set(wf.name, new Array<PartRating>());
                    workflowSet.set(wf.name, wf);
                } else {
                    // process parts
                    let arr = line.replace(/[{}]/g, '').split(/[:,=]/);
                    let pr = {x: Number(arr[1]), m: Number(arr[3]), a: Number(arr[5]), s: Number(arr[7])};
                    //console.debug(arr);

                    //prWfMapping.get(initialState).push(pr);
                    let currentWorkflowName = initialState;
                    while ('AR'.indexOf(currentWorkflowName) === -1) {
                        currentWorkflowName = workflowSet.get(currentWorkflowName).getNewWorkflow(pr)
                    }
                    //console.debug(`currentWorkflowName ${currentWorkflowName}`);
                    if (currentWorkflowName === 'A') {
                        total += pr.x + pr.m + pr.a + pr.s;
                    }
                }
            }
        });
        console.log(`Final total: ${total}`)
    });
