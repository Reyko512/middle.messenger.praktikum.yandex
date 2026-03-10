import Component, { type ComponentProps } from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import ChatBarTemp from './ChatInfobar.hbs';
import { Avatar } from '@shared/ui/Avatar';

interface ChatBarProps extends ComponentProps {
  name: string;
  avatarUrl: string | null;
  usersCount: number;
  isSettingsOpen: boolean;
  onSettingsToggle: () => void;
  Avatar?: Avatar;
}

export default class ChatInfoBar extends Component<ChatBarProps> {
  constructor(props: ChatBarProps) {
    super('section', {
      ...props,
      attrs: {
        class: 'user-bar',
      },
      events: {
        click: (event: Event) => {
          const target = event.target as HTMLElement;
          if (!target.closest('[data-role="chat-settings-toggle"]')) {
            return;
          }

          props.onSettingsToggle();
        },
      },
      Avatar: new Avatar({ avatarUrl: props.avatarUrl }),
    });
  }

  public setInfo(
    name: string,
    avatarUrl: string | null,
    usersCount: number,
    isSettingsOpen: boolean,
  ) {
    this.setProps({
      name,
      avatarUrl,
      usersCount,
      isSettingsOpen,
    });

    const avatar = this.children['Avatar'] as Avatar;
    avatar.setProps({
      avatarUrl,
    });
  }

  public override render(): TemplateDelegate {
    return ChatBarTemp;
  }
}
