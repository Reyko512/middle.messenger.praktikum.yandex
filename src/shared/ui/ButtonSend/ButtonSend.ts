import Component, { type ComponentProps } from '@shared/lib/components/Component';
import ButtonTemp from './ButtonSend.hbs';

import type { TemplateDelegate } from 'handlebars';

export default class ButtonSend extends Component<ComponentProps> {
  constructor(props: ComponentProps = {}) {
    super('button', {
      ...props,
      attrs: {
        class: 'send-message-button',
        type: 'submit',
      },
    });
  }

  public override render(): TemplateDelegate {
    return ButtonTemp;
  }
}
