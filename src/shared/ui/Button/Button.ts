import templator from '@shared/lib/components/Templator';
import Component, { type ComponentProps } from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';

export interface ButtonProps extends ComponentProps {
  type: 'submit' | 'button';
  text: string;
  disabled?: boolean;
}

export default class Button extends Component<ButtonProps> {
  constructor(props: ButtonProps) {
    super('button', {
      ...props,
      attrs: {
        class: 'button',
        type: props.type,
        role: 'button',
        ...(props.disabled ? { disabled: 'true' } : {}),
      },
    });
  }

  public override componentDidUpdate(
    oldProps: ButtonProps,
    newProps: ButtonProps,
  ): boolean {
    if (this.element instanceof HTMLButtonElement) {
      if (oldProps.type !== newProps.type) {
        this.element.type = newProps.type;
      }

      if (oldProps.disabled !== newProps.disabled) {
        this.element.disabled = Boolean(newProps.disabled);
      }
    }

    return oldProps.text !== newProps.text;
  }

  public override render(): TemplateDelegate {
    return templator('{{text}}');
  }
}
