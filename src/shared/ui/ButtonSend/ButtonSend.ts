import Component, { type ComponentProps } from '@shared/lib/components/Component';
import ButtonTemp from './ButtonSend.hbs';

import type { TemplateDelegate } from 'handlebars';

interface ButtonSendProps extends ComponentProps {}

export default class ButtonSend extends Component<ButtonSendProps> {
  constructor(props: ButtonSendProps = {}) {
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
