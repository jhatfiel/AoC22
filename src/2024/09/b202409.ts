import { AoCPuzzle } from '../../lib/AoCPuzzle.js';

interface Block {
    id: number;
    len: number;
    freespaceAfter: number;
    nextBlock: Block;
    prevBlock: Block;
}

export class b202409 extends AoCPuzzle {
    sampleMode(): void { };
    blockHead: Block;
    blockArr: Block[] = [];

    _loadData(lines: string[]) {
        let id=0;
        let arr=lines[0].split('').map(Number);
        let lastBlock: Block = undefined;
        for (let i=0; i<arr.length; i+=2) {
            let len = arr[i];
            let freespaceAfter = arr[i+1]??0;
            let block: Block = {id, len, freespaceAfter, nextBlock: undefined, prevBlock: undefined};
            if (lastBlock === undefined) {
                this.blockHead = block;
            } else {
                lastBlock.nextBlock = block;
                block.prevBlock = lastBlock;
            }
            this.blockArr.push(block);

            lastBlock = block;
            id++;
        }
        //this.blockHead.prevBlock = lastBlock;
        //this.debug(this.disk);
    }

    toDisk(block: Block): number[] {
        let disk: number[] = [];

        while (block) {
            for (let n=0; n<block.len; n++) {
                disk.push(block.id);
            }
            for (let n=0; n<block.freespaceAfter; n++) {
                disk.push(undefined);
            }
            block = block.nextBlock;
        }
        return disk;
    }

    debug(disk: number[]) {
        this.log(`Disk: ${disk.map(n=>n===undefined?' . ':n.toString().padStart(3)).join('')}`);
    }

    defrag() {
        let currentBlock = this.blockArr.pop();
        //this.debug(this.toDisk(this.blockHead));
        while (currentBlock) {
            //this.log(`Trying to move ${currentBlock.id} len=${currentBlock.len}`);
            let insertAfterBlock = this.blockHead;
            while (insertAfterBlock !== undefined && insertAfterBlock !== currentBlock) {
                //this.log(`  Trying to move in after ${insertAfterBlock.id} who has freespace of ${insertAfterBlock.freespaceAfter}`);
                if (insertAfterBlock.freespaceAfter >= currentBlock.len) {
                    if (currentBlock.prevBlock === insertAfterBlock) {
                        // there's a bug with this when we are just trying to move the current block back into the free space right before it.
                        //just rearrange the freespace to be after currentBlock
                        currentBlock.freespaceAfter += insertAfterBlock.freespaceAfter
                        insertAfterBlock.freespaceAfter = 0;
                    } else {
                        //this.log(`Can move ${currentBlock.id} after ${insertAfterBlock.id}`);
                        //this.log(`relocate ${currentBlock.id} to after ${insertAfterBlock.id}`);
                        let currentBlockNEXT = currentBlock.nextBlock;
                        let currentBlockPREV = currentBlock.prevBlock;
                        let insertAfterBlockNEXT = insertAfterBlock.nextBlock;
                        let currentBlockFSA = currentBlock.freespaceAfter;

                        currentBlock.freespaceAfter = insertAfterBlock.freespaceAfter - currentBlock.len;
                        insertAfterBlock.freespaceAfter = 0;

                        insertAfterBlock.nextBlock = currentBlock;
                        currentBlock.prevBlock = insertAfterBlock;
                        if (insertAfterBlockNEXT) {
                            insertAfterBlockNEXT.prevBlock = currentBlock;
                            currentBlock.nextBlock = insertAfterBlockNEXT;
                        }

                        currentBlockPREV.nextBlock = currentBlockNEXT;
                        if (currentBlockNEXT) currentBlockNEXT.prevBlock = currentBlockPREV;
                        currentBlockPREV.freespaceAfter += currentBlock.len + currentBlockFSA;
                        //this.debug(this.toDisk(this.blockHead));
                    }
                }
                insertAfterBlock = insertAfterBlock.nextBlock;
            }

            currentBlock = this.blockArr.pop();
        }
    }

    checksum(disk: number[]): number {
        let result = 0;
        for (let pos=0; pos<disk.length; pos++) {
            result += pos*(disk[pos]??0);
        }

        return result;
    }

    _runStep(): boolean {
        let moreToDo = false;
        //this.debug(this.toDisk(this.blockHead));
        this.defrag();
        //this.debug(this.toDisk(this.blockHead));
        let disk = this.toDisk(this.blockHead);
        //console.log(disk.join('/'));
        this.debug(disk);
        let checksum = this.checksum(disk);

        if (!moreToDo) {
            this.result = checksum.toString();
        }
        return moreToDo;
    }
}