import Component from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import _template from '@shared/lib/components/_templator';
import { ChatItem } from '@entities/chat';

interface IChatItem extends Record<string, unknown> {
  name: string;
  time: string;
  lastMessage?: string | null;
  counter?: string | number | null;
  avatarUrl: string | null;
}

interface ChatFeedProps extends Record<string, unknown> {
  chats?: IChatItem[] | null;
}

interface InnerChatFeedProps extends Omit<ChatFeedProps, 'chats'> {
  chats: ChatItem[] | null;
}

export default class ChatFeed extends Component<InnerChatFeedProps> {
  constructor(props: ChatFeedProps) {
    super('ul', {
      ...props,
      chats: props.chats?.map((item) => new ChatItem(item)) ?? [],
      attrs: { class: 'chat-list' },
    });
  }

  override render(): TemplateDelegate {
    return _template('{{{chats}}}');
  }
}
