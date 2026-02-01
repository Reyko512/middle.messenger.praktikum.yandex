import Component from '@shared/lib/components/Component';

import SendMessageTemp from './SendMessageForm.hbs';

import type { TemplateDelegate } from 'handlebars';
import { FileInput } from '@shared/ui/FileInput';
import { MessageInput } from '@shared/ui/MessageInput';
import { ButtonSend } from '@shared/ui/ButtonSend';

export default class SendMessageForm extends Component {
  constructor() {
    super('form', {
      attrs: {
        class: 'send-message-form',
      },

      FileInput: new FileInput({ name: 'attach-file', id: 'attach-file' }),
      MessageInput: new MessageInput({ placeholder: 'Write a message...', value: '' }),
      ButtonSend: new ButtonSend(),
    });
  }

  public override render(): TemplateDelegate {
    return SendMessageTemp;
  }
}
