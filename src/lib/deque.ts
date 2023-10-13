export type DequeNode<T> = {
    value: T;
    prev?: DequeNode<T>;
    next?: DequeNode<T>;
};
  
export class Deque<T = any> implements Iterable<T> {
    front?: DequeNode<T>;
    back?: DequeNode<T>;
    length = 0;

    constructor(...initialValues: T[]) {
        initialValues.forEach(initialValue => this.addBack(initialValue) );
    }

    *[Symbol.iterator](): IterableIterator<T> {
        let f=this.back;
        while (f) {
            yield f.value;
            f = f.next;
        }
    }

    rotate(cnt=1) {
        if (this.front && this.front !== this.back) {
            // take the shortest path to rotate (from the front or the back)
            cnt = cnt % this.length;
            if (Math.abs(cnt) > cnt + this.length) cnt += this.length;
            
            if (cnt !== 0) {
                let newBack: DequeNode<T>;
                let newFront: DequeNode<T>;
                if (cnt > 0) {
                    newBack = this.front;
                    while (--cnt > 0) newBack = newBack.prev;
                    newFront = newBack.prev
                } else {
                    newFront = this.back;
                    while (++cnt < 0) newFront = newFront.next;
                    newBack = newFront.next

                }

                this.front.next = this.back; // \__ join the front to the back
                this.back.prev = this.front; // / 

                newFront.next = undefined; // \__ terminate the list
                newBack.prev = undefined; //  /

                this.front = newFront; // \__ update front/back
                this.back = newBack; //   /
            }
        }
    }

    addFront(value: T) {
        this.length++;
        if (!this.front) {
            this.front = this.back = { value };
        } else {
            this.front = this.front.next = { value, prev: this.front };
        }
    }

    removeFront() {
        this.length--;
        let value: T;
        if (this.front) {
            value = this.peekFront();

            if (this.front === this.back) {
                this.front = undefined;
                this.back = undefined;
            } else {
                (this.front = this.front.prev).next = undefined;
            }
        }
        return value;
    }

    peekFront() { return this.front?.value; }

    addBack(value: T) {
        this.length++;
        if (!this.front) {
            this.front = this.back = { value };
        } else {
            this.back = this.back.prev = { value, next: this.back };
        }
    }

    removeBack() {
        this.length--;
        let value: T;
        if (this.back) {
            value = this.peekBack();
            if (this.front === this.back) {
                this.front = undefined;
                this.back = undefined;
            } else {
                (this.back = this.back.next).prev = undefined;
            }
        }
        return value;
    }

    peekBack() { return this.back?.value; }
}