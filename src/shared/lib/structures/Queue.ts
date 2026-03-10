class QueueNode<T> {
  public readonly value: T;
  public next: QueueNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export default class Queue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private length = 0;

  public enqueue(value: T) {
    const node = new QueueNode(value);

    if (!this.tail) {
      this.head = node;
      this.tail = node;
      this.length = 1;
      return;
    }

    this.tail.next = node;
    this.tail = node;
    this.length += 1;
  }

  public dequeue() {
    if (!this.head) {
      return null;
    }

    const node = this.head;
    this.head = node.next;

    if (!this.head) {
      this.tail = null;
    }

    this.length -= 1;
    return node.value;
  }

  public isEmpty() {
    return this.length === 0;
  }

  public clear() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
}
