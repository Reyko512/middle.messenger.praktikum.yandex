import _template from '@shared/lib/components/_templator';
import Component from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';

interface ButtonProps extends Record<string, unknown> {
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
