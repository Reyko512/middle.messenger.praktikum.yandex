import Component from '@shared/lib/components/Component';
import type { TemplateDelegate } from 'handlebars';
import AvatarTemp from './Avatar.hbs';

interface AvatarProps extends Record<string, unknown> {
  avatarUrl?: string | null;
}

export default class Avatar extends Component<AvatarProps> {
  constructor(props: AvatarProps) {
    super('div', {
      ...props,
      attrs: {
        class: 'avatar',
      },
    });
  }

  public override render(): TemplateDelegate {
    return AvatarTemp;
  }
}
