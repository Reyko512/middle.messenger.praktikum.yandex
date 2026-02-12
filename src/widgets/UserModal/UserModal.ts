import _template from '@shared/lib/components/_templator';
import Component from '@shared/lib/components/Component';
import UserModalTmp from './UserModal.hbs';

import type { TemplateDelegate } from 'handlebars';
import { Modal } from '@shared/ui/Modal';
import { DataRow } from '@shared/ui/DataRow';
import { Link } from '@shared/ui/Link';
import { UpdateAvatarForm } from '@features/updateProfile';
import { Routes } from '@shared/lib/router/routes';

const userDataArray: { name: string; value: string }[] = [
  {
    name: 'email',
    value: 'byte@gmail.com',
  },
  {
    name: 'login',
    value: 'byte',
  },
  {
    name: 'first name',
    value: 'Jhon',
  },
  {
    name: 'last name',
    value: 'Jhonson',
  },
  {
    name: 'nickname',
    value: 'byters',
  },
  {
    name: 'phone',
    value: '+7 (999) 999 99 99',
  },
];

const linkArray: { text: string; href: string }[] = [
  {
    text: 'Change user data',
    href: `${Routes.ChangeInfo}`,
  },
  {
    text: 'Change password',
    href: `${Routes.ChangePassword}`,
  },
  {
    text: 'Logout',
    href: `${Routes.SignIn}`,
  },
];

class UserModal extends Component {
  constructor() {
    super('section', {
      UpdateAvatarForm: new UpdateAvatarForm(),
      userData: userDataArray.map((item) => new DataRow(item)),
      links: linkArray.map((item) => new Link(item)),

      attrs: {
        class: 'user-information',
      },
    });
  }

  public override render(): TemplateDelegate {
    return UserModalTmp;
  }
}

export default class UserModalPage extends Modal {
  constructor() {
    super({ Content: new UserModal() });
  }
}
