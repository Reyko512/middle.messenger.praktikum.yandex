import _template from '@shared/lib/components/_templator';
import Component, { type ComponentProps } from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';

export interface ButtonProps extends ComponentProps {
  type: 'submit' | 'button';
  text: string;
}

export default class Button extends Component<ButtonProps> {
  constructor(props: ButtonProps) {
    super('button', {
      ...props,
      attrs: {
        class: 'button',
        type: props.type,
        role: 'button',
      },
    });
  }

  public override render(): TemplateDelegate {
    return _template('{{text}}');
  }
}
