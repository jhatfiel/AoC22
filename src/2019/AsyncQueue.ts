export class AsyncQueue<T=number> {
  private pulls: ((v: T) => void)[] = [];
  private items: (T)[] = [];
  private closed = false;

  enqueue(item: T) {
    if (this.closed) throw new Error('enqueue on closed queue');
    if (this.pulls.length) {
      const resolve = this.pulls.shift();
      resolve(item);
    } else {
      this.items.push(item);
    }
  }

  async dequeue(): Promise<T> {
    if (this.items.length) return this.items.shift();
    if (this.closed) return null;
    return new Promise(resolve => this.pulls.push(resolve));
  }

  close() {
    this.closed = true;
    while (this.pulls.length) this.pulls.shift()(null);
  }
}