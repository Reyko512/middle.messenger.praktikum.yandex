import Component, { type ComponentProps } from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import templator from '@shared/lib/components/Templator';
import { ChatItem } from '@entities/chat';
interface ChatPreview {
  id: number;
  name: string;
  time: string;
  lastMessage?: string | null;
  counter?: string | number | null;
  avatarUrl: string | null;
  isActive: boolean;
}

interface ChatFeedProps extends ComponentProps {
  chats: ChatPreview[];
  selectedChatId: number | null;
  onSelect: (chatId: number) => void;
}

interface InnerChatFeedProps extends Omit<ChatFeedProps, 'chats'> {
  chats: ChatItem[];
}

export default class ChatFeed extends Component<InnerChatFeedProps> {
  constructor(props: ChatFeedProps) {
    super('ul', {
      chats: props.chats.map((chat) =>
        new ChatItem({
          ...chat,
          onSelect: props.onSelect,
          isActive: chat.id === props.selectedChatId,
        }),
      ),
      selectedChatId: props.selectedChatId,
      onSelect: props.onSelect,
      attrs: { class: 'chat-list' },
    });
  }

  public setChats(
    chats: ChatPreview[],
    selectedChatId: number | null,
    onSelect: (chatId: number) => void,
  ) {
    this.setProps({
      chats: chats.map((chat) =>
        new ChatItem({
          ...chat,
          onSelect,
          isActive: chat.id === selectedChatId,
        }),
      ),
      selectedChatId,
      onSelect,
    });
  }

  public override render(): TemplateDelegate {
    return templator('{{{chats}}}');
  }
}
