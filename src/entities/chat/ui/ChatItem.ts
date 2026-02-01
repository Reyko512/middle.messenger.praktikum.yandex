import Component from '@shared/lib/components/Component';
import ChatItemTemp from './chat-item.hbs';

import type { TemplateDelegate } from 'handlebars';
import { Avatar } from '@shared/ui/Avatar';

interface ChatItemProps extends Record<string, unknown> {
  name: string;
  time: string;
  lastMessage?: string | null;
  counter?: string | number | null;
  avatarUrl: string | null;
}

export default class ChatItem extends Component<ChatItemProps> {
  constructor(props: ChatItemProps) {
    super('li', {
      ...props,
      attrs: {
        class: 'chat-item',
      },
      Avatar: new Avatar({ avatarUrl: props.avatarUrl }),
    });
  }

  public override render(): TemplateDelegate {
    return ChatItemTemp;
  }
}
