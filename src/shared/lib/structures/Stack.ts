class StackNode<T> {
  public readonly value: T;
  public next: StackNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export default class Stack<T> {
  private topNode: StackNode<T> | null = null;
  private length = 0;

  public push(value: T) {
    const node = new StackNode(value);
    node.next = this.topNode;
    this.topNode = node;
    this.length += 1;
  }

  public pop() {
    if (!this.topNode) {
      return null;
    }

    const node = this.topNode;
    this.topNode = node.next;
    this.length -= 1;
    return node.value;
  }

  public isEmpty() {
    return this.length === 0;
  }

  public clear() {
    this.topNode = null;
    this.length = 0;
  }
}
