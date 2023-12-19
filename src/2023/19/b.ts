import { nextTick } from "process";
import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

class WorkflowCondition {
    constructor(public prop: string, public isLessThan: boolean, public value: number) {
    }
    check(p: PartRating): boolean {
        return this.checkValue(p[this.prop]);
    }
    checkValue(n: number): boolean {
        return this.isLessThan?n<this.value:n>this.value;
    }
}

class Workflow {
    constructor(line: string) {
        let arr = line.replace(/}/, '').split(/[{:,]/);
        this.name = arr[0];

        for (let i=0; i<arr.length-2; i+=2) {
            let rule = arr[i+1];
            let workflow = arr[1+i+1];
            let prop = rule.substring(0, 1);
            let isLessThan = rule.substring(1, 2) === '<';
            let value = Number(rule.substring(2));
            this.conditionArr.push({
                condition: new WorkflowCondition(prop, isLessThan, value),
                workflow
            })
        }

        this.defaultWorkflow = arr[arr.length-1];
    }

    public name: string;
    public conditionArr = new Array<{condition: WorkflowCondition, workflow: string}>();
    public defaultWorkflow: string;

    public shapeRange(prv: PartRatingValid): Array<PartRatingValid> {
        let result = new Array<PartRatingValid>();
        let defaultPrv: PartRatingValid = {
            workflowHistory: prv.workflowHistory + prv.workflowName + '->',
            workflowName: this.defaultWorkflow,
            xValid: new Set(prv.xValid),
            mValid: new Set(prv.mValid),
            aValid: new Set(prv.aValid),
            sValid: new Set(prv.sValid),
        }

        this.conditionArr.forEach(ca => {
            let workflowCondition = ca.condition;
            let newWorkflowName = ca.workflow;
            let prvRatingName = workflowCondition.prop + 'Valid';
            let newPrv: PartRatingValid = {
                workflowHistory: prv.workflowHistory + prv.workflowName + '->',
                workflowName: newWorkflowName,
                xValid: new Set(prv.xValid),
                mValid: new Set(prv.mValid),
                aValid: new Set(prv.aValid),
                sValid: new Set(prv.sValid),
            };
            newPrv[prvRatingName] = new Set<number>();

            Array.from<number>(prv[prvRatingName].keys()).forEach(n => {
                if (workflowCondition.checkValue(n)) {
                    newPrv[prvRatingName].add(n);
                    defaultPrv[prvRatingName].delete(n);
                    prv[prvRatingName].delete(n);
                }
            })

            result.push(newPrv);
        })
        result.push(defaultPrv);
        return result;
    }
}

type PartRating = {
    x: number;
    m: number;
    a: number;
    s: number;
}

type PartRatingValid = {
    workflowHistory: string;
    workflowName: string;
    xValid: Set<number>;
    mValid: Set<number>;
    aValid: Set<number>;
    sValid: Set<number>;
}

let workflowSet = new Map<string, Workflow>();

await puzzle.run()
    .then((lines: Array<string>) => {
        let wfDone = false;
        let total = 0;
        lines.forEach(line => {
            if (line === '') {
                wfDone = true;
            } else if (!wfDone) {
                // process workflows
                let wf = new Workflow(line);
                workflowSet.set(wf.name, wf);
            }
        });

        let prvToProcess = new Array<PartRatingValid>();
        prvToProcess.push({
            workflowHistory: '',
            workflowName: 'in',
            xValid: new Set(Array.from({length: 4000}, (v, ind) => ind+1)),
            mValid: new Set(Array.from({length: 4000}, (v, ind) => ind+1)),
            aValid: new Set(Array.from({length: 4000}, (v, ind) => ind+1)),
            sValid: new Set(Array.from({length: 4000}, (v, ind) => ind+1)),
        });
        let acceptPRV = new Array<PartRatingValid>();
        let rejectPRV = new Array<PartRatingValid>();
        while (prvToProcess.length) {
            console.debug(`Length of prvToProcess: ${prvToProcess.length}`);
            //debugPRV(prvToProcess);
            //debugPRV(rejectPRV);
            //debugPRV(acceptPRV);
            let prv = prvToProcess.pop();
            workflowSet.get(prv.workflowName).shapeRange(prv).forEach(newPrv => {
                if (newPrv.workflowName === 'A') {
                    acceptPRV.push(newPrv);
                } else if (newPrv.workflowName === 'R') {
                    rejectPRV.push(newPrv);
                } else {
                    prvToProcess.push(newPrv);
                }
            })
        }
        console.debug(`Done`);

        debugPRV(acceptPRV);
        acceptPRV.forEach(prv => {
            total += prv.xValid.size * prv.mValid.size * prv.aValid.size * prv.sValid.size;
        })
         
        console.debug(`Total accept PRVs: ${acceptPRV.length}`)

        console.log(`Final total: ${total}`)
    });

function debugPRV(prvList: Array<PartRatingValid>) {
    prvList.forEach(prv => {
        console.debug(`${prv.workflowHistory}${prv.workflowName} x:${prv.xValid.size}, m:${prv.mValid.size}, a:${prv.aValid.size}, s:${prv.sValid.size}`);
    });
}