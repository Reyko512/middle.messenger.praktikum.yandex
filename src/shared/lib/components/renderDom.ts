import type Component from './Component';

export function render(query: string, block: Component) {
  const root = document.querySelector(query);
  const element = block.getContent();
  root?.appendChild(element as Node);

  block.dispatchComponentDidMount();

  return root;
}
