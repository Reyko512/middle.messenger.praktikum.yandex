import Component from '@shared/lib/components/Component';
import ButtonTemp from './ButtonSend.hbs';

import type { TemplateDelegate } from 'handlebars';

export default class ButtonSend extends Component {
  constructor() {
    super('button', {
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
