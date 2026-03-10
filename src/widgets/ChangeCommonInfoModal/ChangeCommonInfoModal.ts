import Component, { type ComponentProps } from '@shared/lib/components/Component';
import ChangeCommonInfoModalTemp from './ChangeCommonInfoModal.hbs';
import type { TemplateDelegate } from 'handlebars';
import { UpdateCommonInfoForm } from '@features/updateProfile';
import { Link } from '@shared/ui/Link';
import { Modal } from '@shared/ui/Modal';
import { Routes } from '@shared/lib/router/routes';

interface ChangeCommonInfoModalProps extends ComponentProps {
  UpdateCommonInfoForm: UpdateCommonInfoForm;
  Link: Link;
}

class ChangeCommonInfoModal extends Component<ChangeCommonInfoModalProps> {
  constructor() {
    super('section', {
      UpdateCommonInfoForm: new UpdateCommonInfoForm(),
      Link: new Link({ text: '< back', href: `${Routes.UserData}` }),
      attrs: {
        class: 'change-common-info',
      },
    });
  }

  public override render(): TemplateDelegate {
    return ChangeCommonInfoModalTemp;
  }
}

export default class ChangeCommonInfoPage extends Modal {
  constructor() {
    super({ Content: new ChangeCommonInfoModal() });
  }
}
