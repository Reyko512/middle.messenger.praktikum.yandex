import Component, { type ComponentProps } from '@shared/lib/components/Component';
import ChatItemTemp from './chat-item.hbs';
import type { TemplateDelegate } from 'handlebars';
import { Avatar } from '@shared/ui/Avatar';

export interface ChatItemProps extends ComponentProps {
  id: number;
  name: string;
  time: string;
  lastMessage?: string | null;
  counter?: string | number | null;
  avatarUrl: string | null;
  isActive: boolean;
  onSelect: (chatId: number) => void;
  Avatar?: Avatar;
}

export default class ChatItem extends Component<ChatItemProps> {
  constructor(props: ChatItemProps) {
    super('li', {
      ...props,
      attrs: {
        class: props.isActive ? 'chat-item chat-item_active' : 'chat-item',
      },
      events: {
        click: () => {
          props.onSelect(props.id);
        },
      },
      Avatar: new Avatar({ avatarUrl: props.avatarUrl }),
    });
  }

  public override componentDidUpdate(
    oldProps: ChatItemProps,
    newProps: ChatItemProps,
  ): boolean {
    if (oldProps.isActive !== newProps.isActive) {
      this.element?.classList.toggle('chat-item_active', newProps.isActive);
    }

    if (oldProps.avatarUrl !== newProps.avatarUrl) {
      const avatar = this.children['Avatar'] as Avatar | undefined;
      avatar?.setProps({
        avatarUrl: newProps.avatarUrl,
      });
    }

    return (
      oldProps.name !== newProps.name ||
      oldProps.time !== newProps.time ||
      oldProps.lastMessage !== newProps.lastMessage ||
      oldProps.counter !== newProps.counter
    );
  }

  public override render(): TemplateDelegate {
    return ChatItemTemp;
  }
}
