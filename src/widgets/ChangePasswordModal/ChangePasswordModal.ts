import { UpdatePasswordForm } from '@features/updateProfile';
import _template from '@shared/lib/components/_templator';
import Component from '@shared/lib/components/Component';
import { Link } from '@shared/ui/Link';
import { Modal } from '@shared/ui/Modal';
import type { TemplateDelegate } from 'handlebars';

class ChangePasswordModal extends Component {
  constructor() {
    super('section', {
      UpdatePasswordForm: new UpdatePasswordForm(),
      Link: new Link({ text: '< back', href: '/user-data' }),
      attrs: {
        class: 'change-password',
      },
    });
  }

  public override render(): TemplateDelegate {
    return _template('{{{UpdatePasswordForm}}} {{{Link}}}');
  }
}

export default (_props?: unknown) =>
  new Modal({ Content: new ChangePasswordModal() });
