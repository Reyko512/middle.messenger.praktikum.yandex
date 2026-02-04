import Component from '@shared/lib/components/Component';
import ChangeCommonInfoModalTemp from './ChangeCommonInfoModal.hbs';
import type { TemplateDelegate } from 'handlebars';
import { UpdateCommonInfoForm } from '@features/updateProfile';
import { Link } from '@shared/ui/Link';
import { Modal } from '@shared/ui/Modal';
import { Routes } from '@shared/lib/router/routes';

class ChangeCommonInfoModal extends Component {
  constructor() {
    super('section', {
      UpdateCommonInfoForm: new UpdateCommonInfoForm(),
      Link: new Link({ text: '< back', href: `/${Routes.UserData}` }),
      attrs: {
        class: 'change-common-info',
      },
    });
  }

  public override render(): TemplateDelegate {
    return ChangeCommonInfoModalTemp;
  }
}

export default (_props?: unknown) =>
  new Modal({ Content: new ChangeCommonInfoModal() });
