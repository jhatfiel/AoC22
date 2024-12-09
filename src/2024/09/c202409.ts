import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

interface Block {
    id: number;
    length: number;
    position: number;
}

export class c202409 extends AoCPuzzle {
    disk: number[] = [];
    blocks: Block[] = [];

    sampleMode(): void { };

    _loadData(lines: string[]) {
        let id=0;
        let arr=lines[0].split('').map(Number);
        for (let i=0; i<arr.length; i+=2) {
            let length=arr[i];
            let free=arr[i+1]??0;
            this.blocks.push({id, length, position: this.disk.length});
            //this.log(`${i}: ${length} ${free}`);
            for (let n=0; n<length; n++) {
                this.disk.push(id);
            }
            for (let n=0; n<free; n++) {
                this.disk.push(undefined);
            }
            id++;
        }
        //this.debug(this.disk.slice(95070));
        //this.debug(this.disk);
    }

    debug(disk: number[]) {
        this.log(`Disk: ${disk.map(n=>n===undefined?'.':n.toString()).join('/').substring(0, 175)}`);
    }

    defrag(disk: number[]) {
        while (this.blocks.length) {
            let block = this.blocks.pop();
            //this.log(`Need to relocate ${block.id} (${block.length} at ${block.position})`);
            // just scan through the disk till we get to block.position, trying to find a spot
            let insertPos: number = undefined;
            let start = 0;
            let prevBlockId: number = undefined;
            while (start < block.position) {
                if (this.disk[start] === undefined) throw new Error(`why is start undefined?`);
                prevBlockId = this.disk[start];
                while (this.disk[start] !== undefined) { prevBlockId = this.disk[start]; start++; }
                let length = 0;
                while (this.disk[start+length] === undefined && start+length < block.position) length++;
                if (length >= block.length) {
                    insertPos = start;
                    break;
                } else {
                    start += length;
                }
            }

            if (insertPos !== undefined) {
                //this.log(`relocate ${block.id} to after ${prevBlockId}`);
                for (let i=0; i<block.length; i++) {
                    this.disk[insertPos+i] = block.id;
                    this.disk[block.position+i] = undefined;
                }
                //this.debug(this.disk);
            }
        }
    }

    checksum(disk: number[]): number {
        let result = 0;
        for (let pos=0; pos < disk.length; pos++) {
            result += pos*(disk[pos]??0);
        }

        return result;
    }

    _runStep(): boolean {
        let moreToDo = false;
        this.defrag(this.disk);
        //this.debug(this.disk);
        //console.log(this.disk.join('/'));
        let checksum = this.checksum(this.disk);

        if (!moreToDo) {
            this.result = checksum.toString(); // 6360363199987
        }
        return moreToDo;
    }
}