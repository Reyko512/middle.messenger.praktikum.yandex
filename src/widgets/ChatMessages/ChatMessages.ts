import Component, { type ComponentProps } from '@shared/lib/components/Component';
import templator from '@shared/lib/components/Templator';
import ChatMessagesTemplate from './ChatMessages.hbs';
import type { TemplateDelegate } from 'handlebars';
import { MessageItem } from '@entities/message';
import type { WSMessageData } from '@entities/chat';
import { API_RESOURCES } from '@shared/config/api';

interface ChatMessagesProps extends ComponentProps {
  messages: WSMessageData[];
  currentUserId: number | null;
  senderNamesById: Record<number, string>;
  onLoadMore: () => Promise<boolean | void> | boolean | void;
}

interface DateDivider {
  type: 'date-divider';
  label: string;
}

type ChatMessagesGroupItem = WSMessageData | DateDivider;

interface DateDividerItemProps extends ComponentProps {
  label: string;
}

class DateDividerItem extends Component<DateDividerItemProps> {
  constructor(props: DateDividerItemProps) {
    super('li', {
      ...props,
      attrs: {
        class: 'chat-messages__date-divider',
      },
    });
  }

  public override render(): TemplateDelegate {
    return templator('<span>{{label}}</span>');
  }
}

type ChatMessagesRenderableItem = MessageItem | DateDividerItem;

interface InnerChatMessagesProps
  extends Omit<ChatMessagesProps, 'messages'> {
  items: ChatMessagesRenderableItem[];
  messageCount: number;
}

const SCROLL_THRESHOLD = 24;

const MESSAGES_LOCALE = 'ru-RU';

function formatMessageTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString(MESSAGES_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildResourceURL(path: string | undefined) {
  if (!path) {
    return null;
  }

  return `${API_RESOURCES}${path}`;
}

function getFileExtension(fileName: string | undefined) {
  if (!fileName) {
    return 'file';
  }

  const [, extension = 'file'] = fileName.split(/\.(?=[^.]+$)/);
  return extension;
}

function isImageFile(contentType: string | undefined) {
  return Boolean(contentType?.startsWith('image/'));
}

function getDateKey(value: string) {
  const date = new Date(value);

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatDateDividerLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDate(date, today)) {
    return '\u0421\u0435\u0433\u043e\u0434\u043d\u044f';
  }

  if (isSameDate(date, yesterday)) {
    return '\u0412\u0447\u0435\u0440\u0430';
  }

  return date.toLocaleDateString(MESSAGES_LOCALE, {
    month: 'long',
    day: 'numeric',
  });
}

function isDateDivider(
  item: ChatMessagesGroupItem,
): item is DateDivider {
  return item.type === 'date-divider';
}

function buildSenderNamesById(
  currentUserId: number | null,
  senderNamesById: Record<number, string>,
  message: WSMessageData,
) {
  if (message.user_id === currentUserId) {
    return undefined;
  }

  return senderNamesById[message.user_id] ?? `User ${message.user_id}`;
}

function buildMessageItem(
  message: WSMessageData,
  currentUserId: number | null,
  senderNamesById: Record<number, string>,
) {
  const senderName = buildSenderNamesById(
    currentUserId,
    senderNamesById,
    message,
  );

  return new MessageItem({
    content: String(message.content),
    fileExtension: getFileExtension(message.file?.filename),
    fileName: message.file?.filename ?? 'Attached file',
    fileUrl: buildResourceURL(message.file?.path),
    isFile: message.type === 'file',
    isImage: isImageFile(message.file?.content_type),
    ...(senderName ? { senderName } : {}),
    time: formatMessageTime(message.time),
    isOwn: message.user_id === currentUserId,
  });
}

export function groupMessagesByDate(
  messages: readonly WSMessageData[],
): ChatMessagesGroupItem[] {
  const items: ChatMessagesGroupItem[] = [];
  let currentDateKey: string | null = null;

  for (const message of messages) {
    const nextDateKey = getDateKey(message.time);

    if (currentDateKey !== nextDateKey) {
      items.push({
        type: 'date-divider',
        label: formatDateDividerLabel(message.time),
      });
      currentDateKey = nextDateKey;
    }

    items.push(message);
  }

  return items;
}

function buildRenderableItems(
  messages: readonly WSMessageData[],
  currentUserId: number | null,
  senderNamesById: Record<number, string>,
) {
  return groupMessagesByDate(messages).map((item) => {
    if (isDateDivider(item)) {
      return new DateDividerItem({
        label: item.label,
      });
    }

    return buildMessageItem(item, currentUserId, senderNamesById);
  });
}

export default class ChatMessages extends Component<InnerChatMessagesProps> {
  private observer: IntersectionObserver | null = null;
  private isFetching = false;
  private restoreScrollFrameId: number | null = null;
  private pendingScrollRestore:
    | {
        scrollOffset: number;
      }
    | null = null;

  constructor(props: ChatMessagesProps) {
    super('ul', {
      ...props,
      items: buildRenderableItems(
        props.messages,
        props.currentUserId,
        props.senderNamesById,
      ),
      messageCount: props.messages.length,
      attrs: {
        class: 'chat-messages',
      },
    });
  }

  private setupIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (!entry?.isIntersecting) {
            return;
          }

          void this.handleLoadMore();
        },
        {
          root: this.element,
          threshold: 0.1,
        },
      );
    }

    if (!this.observer) {
      return;
    }

    this.observer.disconnect();

    const sentinel = this.element?.querySelector('[data-role="sentinel"]');
    if (!(sentinel instanceof HTMLElement)) {
      return;
    }

    this.observer.observe(sentinel);
  }

  private async handleLoadMore() {
    if (this.isFetching) {
      return;
    }

    const list = this.element;
    if (!list) {
      return;
    }

    if (list.scrollTop > SCROLL_THRESHOLD) {
      return;
    }

    const onLoadMore = this.props['onLoadMore'] as
      | (() => Promise<boolean | void> | boolean | void)
      | undefined;

    if (!onLoadMore) {
      return;
    }

    this.isFetching = true;
    this.pendingScrollRestore = {
      scrollOffset: list.scrollHeight - list.scrollTop,
    };

    try {
      await onLoadMore();
    } finally {
      this.isFetching = false;
    }
  }

  public override componentDidMount() {
    this.setupIntersectionObserver();
  }

  public override componentDidUpdate(
    oldProps: InnerChatMessagesProps,
    newProps: InnerChatMessagesProps,
  ): boolean {
    const shouldRestoreScroll =
      this.pendingScrollRestore !== null &&
      newProps.messageCount > oldProps.messageCount;

    if (this.pendingScrollRestore && !shouldRestoreScroll) {
      this.pendingScrollRestore = null;
    }

    if (this.restoreScrollFrameId !== null) {
      window.cancelAnimationFrame(this.restoreScrollFrameId);
    }

    this.restoreScrollFrameId = window.requestAnimationFrame(() => {
      this.restoreScrollFrameId = null;
      const list = this.element;
      if (!list) {
        return;
      }

      if (shouldRestoreScroll && this.pendingScrollRestore) {
        const { scrollOffset } = this.pendingScrollRestore;
        list.scrollTop = list.scrollHeight - scrollOffset;
        this.pendingScrollRestore = null;
      }

      this.setupIntersectionObserver();
    });

    return true;
  }

  public override beforeComponentUnmount() {
    if (this.restoreScrollFrameId !== null) {
      window.cancelAnimationFrame(this.restoreScrollFrameId);
      this.restoreScrollFrameId = null;
    }

    this.observer?.disconnect();
    this.observer = null;
  }

  public setMessages(
    messages: WSMessageData[],
    currentUserId: number | null,
    senderNamesById: Record<number, string>,
  ) {
    this.setProps({
      currentUserId,
      senderNamesById,
      items: buildRenderableItems(
        messages,
        currentUserId,
        senderNamesById,
      ),
      messageCount: messages.length,
    });
  }

  public override render(): TemplateDelegate {
    return ChatMessagesTemplate;
  }
}
