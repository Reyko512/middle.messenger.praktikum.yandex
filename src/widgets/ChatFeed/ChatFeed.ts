import Component from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import { ChatItem } from '@entities/chat';
import _template from '@shared/lib/components/_templator';
import Handlebars from 'handlebars';

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

export default class ChatFeed extends Component<ChatFeedProps> {
  constructor(props: ChatFeedProps) {
    super('ul', {
      ...props,
      attrs: { class: 'chat-list' },
    });
  }

  override _beforeInit(): void {
    this.createChildren(this.props.chats, (item) => new ChatItem(item));
  }

  public override componentDidUpdate(_oldProps: ChatFeedProps, _newProps: ChatFeedProps): boolean {
    if (_newProps.chats === _oldProps.chats) {
      return false;
    }

    this.createChildren(_newProps.chats, (item) => new ChatItem(item));

    return true;
  }

  override render(): TemplateDelegate {
    return Handlebars.compile(`
      ${this.getChildrenString() || '<li>no chats</li>'}
  `);
  }
}
