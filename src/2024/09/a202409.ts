import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

export class a202409 extends AoCPuzzle {
    disk: number[] = [];
    sampleMode(): void { };

    _loadData(lines: string[]) {
        let id=0;
        let arr=lines[0].split('').map(Number);
        for (let i=0; i<arr.length; i+=2) {
            let length=arr[i];
            let free=arr[i+1]??0;
            //this.log(`${i}: ${length} ${free}`);
            for (let n=0; n<length; n++) {
                this.disk.push(id);
            }
            for (let n=0; n<free; n++) {
                this.disk.push(undefined);
            }
            id++;
        }
        this.debug(this.disk);
    }

    debug(disk: number[]) {
        this.log(`Disk: ${disk.map(n=>n===undefined?' . ':n.toString().padStart(3)).join('')}`);
    }

    defrag(disk: number[]) {
        let end = disk.length-1;
        let start = 0;
        while (true) {
            while (disk[start] !== undefined && end > start) start++;
            while (disk[end] === undefined && end > start) end--;
            if (end <= start) break;
            disk[start] = disk[end];
            disk[end] = undefined;
            end--;
            start++;
            this.debug(disk);
        }
    }

    checksum(disk: number[]): number {
        let result = 0;
        for (let pos=0; disk[pos] !== undefined; pos++) {
            result += pos*disk[pos];
        }

        return result;
    }

    _runStep(): boolean {
        let moreToDo = false;
        this.defrag(this.disk);
        //this.debug(this.disk);
        let checksum = this.checksum(this.disk);

        if (!moreToDo) {
            this.result = checksum.toString();
        }
        return moreToDo;
    }
}