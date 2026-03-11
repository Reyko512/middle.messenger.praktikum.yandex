import { expect } from 'chai';
import type { TemplateDelegate } from 'handlebars';
import { afterEach, beforeEach, describe, it } from 'mocha';
import type { DOMEnvironment } from '../test/setupDom';
import { setupDom } from '../test/setupDom';
import Component, { type ComponentProps } from './Component';

interface TestComponentProps extends ComponentProps {
  label?: string;
  child?: Component<ComponentProps>;
  items?: string[];
  onUnmount?: () => void;
}

class TestComponent extends Component<TestComponentProps> {
  constructor(props: TestComponentProps = {}) {
    super('div', props);
  }

  public override render(): TemplateDelegate {
    return ((props: TestComponentProps) => `
      <span class="label">${props.label ?? ''}</span>
      <div class="child-slot">${props.child ?? ''}</div>
      <div class="list-slot">${props.items ?? ''}</div>
    `) as TemplateDelegate;
  }

  public override componentDidUnmount() {
    this.props.onUnmount?.();
  }
}

describe('Component', () => {
  let domEnvironment: DOMEnvironment;

  beforeEach(() => {
    domEnvironment = setupDom('<!doctype html><html><body></body></html>');
  });

  afterEach(() => {
    domEnvironment.cleanup();
  });

  it('renders props, attributes, children, lists and DOM events', () => {
    let clickCount = 0;

    const child = new TestComponent({
      label: 'Child',
    });
    const component = new TestComponent({
      label: 'Parent',
      className: 'root-component',
      attrs: {
        'data-testid': 'parent',
      },
      child,
      items: ['one', 'two'],
      events: {
        click: () => {
          clickCount += 1;
        },
      },
    });

    document.body.append(component.getContent() as HTMLElement);
    component.getContent()?.dispatchEvent(new Event('click'));

    expect(component.getContent()?.className).to.equal('root-component');
    expect(component.getContent()?.getAttribute('data-testid')).to.equal('parent');
    expect(component.getContent()?.textContent).to.contain('Parent');
    expect(component.getContent()?.textContent).to.contain('Child');
    expect(component.getContent()?.textContent).to.contain('one');
    expect(component.getContent()?.textContent).to.contain('two');
    expect(clickCount).to.equal(1);
  });

  it('re-renders the DOM when props change', () => {
    const component = new TestComponent({
      label: 'Before update',
    });

    expect(component.getContent()?.textContent).to.contain('Before update');

    component.setProps({
      label: 'After update',
    });

    expect(component.getContent()?.textContent).to.contain('After update');
  });

  it('unmounts child components and removes its DOM node on destroy', () => {
    let childUnmountCount = 0;

    const child = new TestComponent({
      label: 'Nested child',
      onUnmount: () => {
        childUnmountCount += 1;
      },
    });
    const component = new TestComponent({
      label: 'Parent',
      child,
    });

    document.body.append(component.getContent() as HTMLElement);

    component.destroy();

    expect(childUnmountCount).to.equal(1);
    expect(component.getContent()).to.equal(null);
    expect(document.body.textContent).to.not.contain('Parent');
  });
});
