import Component from '@shared/lib/components/Component';

import SendMessageTemp from './SendMessageForm.hbs';

import type { TemplateDelegate } from 'handlebars';
import { FileInput } from '@shared/ui/FileInput';
import { MessageInput } from '@shared/ui/MessageInput';
import { ButtonSend } from '@shared/ui/ButtonSend';

export default class SendMessageForm extends Component {
  private state: { 'attach-file': File | undefined; message: string };

  constructor() {
    const stateDefault = {
      'attach-file': undefined,
      message: '',
    };
    super('form', {
      attrs: {
        class: 'send-message-form',
      },

      FileInput: new FileInput({
        name: 'attach-file',
        id: 'attach-file',
        events: {
          change: (e: Event) => {
            this.state['attach-file'] = undefined;

            const element = e.target as HTMLInputElement;

            const files = element.files as FileList;

            this.state['attach-file'] = files[0];
          },
        },
      }),
      MessageInput: new MessageInput({
        placeholder: 'Write a message...',
        value: stateDefault.message,

        events: {
          input: (e: Event) => {
            const value = (e.target as HTMLInputElement).value;
            this.state.message = value;
          },
        },
      }),
      ButtonSend: new ButtonSend({
        events: {
          click: (e: Event) => {
            e.preventDefault();
            if (this.state['attach-file'] || this.state.message) {
              console.log(this.state);
            }
          },
        },
      }),
    });
    this.state = stateDefault;
  }

  public override render(): TemplateDelegate {
    return SendMessageTemp;
  }
}
