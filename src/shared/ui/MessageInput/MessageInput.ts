import Component, {
  type ComponentEvents,
  type ComponentProps,
} from '@shared/lib/components/Component';
import MessageInputTemp from './MessageInput.hbs';

import type { TemplateDelegate } from 'handlebars';

interface MessageInputProps extends ComponentProps {
  value: string;
  placeholder: string;
  events?: ComponentEvents;
}

export default class MessageInput extends Component<MessageInputProps> {
  constructor(props: MessageInputProps) {
    super('div', {
      ...props,
      attrs: {
        class: 'message-input',
      },
      events: props.events ?? {},
    });
  }

  public override componentDidUpdate(
    oldProps: MessageInputProps,
    newProps: MessageInputProps,
  ): boolean {
    if (oldProps.value !== newProps.value) {
      const textarea = this.element?.querySelector('textarea');

      if (
        textarea instanceof HTMLTextAreaElement &&
        textarea.value !== newProps.value
      ) {
        textarea.value = newProps.value;
      }

      return false;
    }

    return false;
  }

  public override render(): TemplateDelegate {
    return MessageInputTemp;
  }
}
