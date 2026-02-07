import Component from '@shared/lib/components/Component';
import MessageInputTemp from './MessageInput.hbs';

import type { TemplateDelegate } from 'handlebars';

interface MessageInputProps extends Record<string, unknown> {
  value: string;
  placeholder: string;
}

export default class MessageInput extends Component<MessageInputProps> {
  constructor(props: MessageInputProps) {
    super('div', {
      ...props,
      attrs: {
        class: 'message-input',
      },
    });
  }

  public override render(): TemplateDelegate {
    return MessageInputTemp;
  }
}
