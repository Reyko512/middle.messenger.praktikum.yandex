import { UpdatePasswordForm } from '@features/updateProfile';
import templator from '@shared/lib/components/Templator';
import Component, { type ComponentProps } from '@shared/lib/components/Component';
import { Routes } from '@shared/lib/router/routes';
import { Link } from '@shared/ui/Link';
import { Modal } from '@shared/ui/Modal';
import type { TemplateDelegate } from 'handlebars';

interface ChangePasswordModalProps extends ComponentProps {
  UpdatePasswordForm: UpdatePasswordForm;
  Link: Link;
}

class ChangePasswordModal extends Component<ChangePasswordModalProps> {
  constructor() {
    super('section', {
      UpdatePasswordForm: new UpdatePasswordForm(),
      Link: new Link({ text: '< back', href: `${Routes.UserData}` }),
      attrs: {
        class: 'change-password',
      },
    });
  }

  public override render(): TemplateDelegate {
    return templator('{{{UpdatePasswordForm}}} {{{Link}}}');
  }
}

export default class ChangeCommonInfoPage extends Modal {
  constructor() {
    super({ Content: new ChangePasswordModal() });
  }
}
