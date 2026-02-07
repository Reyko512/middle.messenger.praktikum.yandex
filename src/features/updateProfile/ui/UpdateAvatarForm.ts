import Component from '@shared/lib/components/Component';
import UpdateAvatarTemp from './UpdateAvatarForm.hbs';

import type { TemplateDelegate } from 'handlebars';

export default class UpdateAvatarForm extends Component {
  constructor() {
    super('form', {
      attrs: {
        class: 'update-avatar-form',
        action: '#',
      },
      events: {
        change: (e: InputEvent) => {
          e.preventDefault();

          const input = this.element?.querySelector(
            '[data-input="avatar"]',
          ) as HTMLInputElement;

          const files = input.files as FileList;

          console.log(files[0]);
          input.value = '';
        },
      },
    });
  }
  public override render(): TemplateDelegate {
    return UpdateAvatarTemp;
  }
}
