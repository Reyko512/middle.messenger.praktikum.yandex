import Component, { type ComponentProps } from '@shared/lib/components/Component';
import { HTTPTransport } from '@shared/lib/http';
import MessageItemTemplate from './message-item.hbs';
import type { TemplateDelegate } from 'handlebars';

interface MessageItemProps extends ComponentProps {
  content: string;
  fileExtension?: string;
  fileName?: string;
  fileUrl?: string | null;
  isFile?: boolean;
  isImage?: boolean;
  senderName?: string;
  time: string;
  isOwn: boolean;
}

const http = new HTTPTransport();

export default class MessageItem extends Component<MessageItemProps> {
  constructor(props: MessageItemProps) {
    const classNames = ['message-item'];

    if (props.isOwn) {
      classNames.push('message-item_own');
    }

    if (props.isFile) {
      classNames.push('message-item_file');
    }

    if (props.isImage) {
      classNames.push('message-item_image');
    }

    super('li', {
      ...props,
      attrs: {
        class: classNames.join(' '),
      },
      events: {
        click: (event: Event) => {
          const target = event.target as HTMLElement;
          if (!target.closest('[data-role="download-file"]')) {
            return;
          }

          event.preventDefault();
          void this.downloadFile();
        },
      },
    });
  }

  private async downloadFile() {
    const fileUrl = this.props['fileUrl'] as string | null | undefined;
    const fileName = this.props['fileName'] as string | undefined;

    if (!fileUrl) {
      return;
    }

    try {
      const blob = await http.get<Blob>(fileUrl, {
        responseType: 'blob',
      });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName ?? 'download';
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  }

  public override render(): TemplateDelegate {
    return MessageItemTemplate;
  }
}
