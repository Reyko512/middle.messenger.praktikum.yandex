import Component from '@shared/lib/components/Component';

import type { TemplateDelegate } from 'handlebars';

import ChatBarTemp from './ChatInfobar.hbs';
import { Avatar } from '@shared/ui/Avatar';

interface ChatBarProps extends Record<string, unknown> {
  name: string;
  avatarUrl: string | null;
}

export default class ChatInfoBar extends Component<ChatBarProps> {
  constructor(props: ChatBarProps) {
    super('section', {
      ...props,
      attrs: {
        class: 'user-bar',
      },

      Avatar: new Avatar({ avatarUrl: props.avatarUrl }),
    });
  }

  public override render(): TemplateDelegate {
    return ChatBarTemp;
  }
}
