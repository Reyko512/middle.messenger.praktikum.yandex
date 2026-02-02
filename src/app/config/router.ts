import { Chats } from '@pages/Chats/';
// import Auth from '@pages/Auth/Auth.hbs';
// import Register from '@pages/Register/Register.hbs';
import _404 from '@pages/_404/404.hbs';
import _500 from '@pages/_500/500.hbs';

// import { default as UserModal } from '@widgets/UserModal/UserModal.hbs';
// import { default as ChangePasswordModal } from '@widgets/ChangePasswordModal/ChangePasswordModal.hbs';
import { ChangeCommonInfoModal } from '@widgets/ChangeCommonInfoModal/';
import type Component from '@shared/lib/components/Component';
import { UserModal } from '@widgets/UserModal';

enum COMPONENTS_NAMES {
  'Chats' = 'Chats',
  '_404' = '_404',
  'Auth' = 'Auth',
  '_500' = '_500',
  'Register' = 'Register',
  'UserModal' = 'UserModal',
  'ChangePasswordModal' = 'ChangePasswordModal',
  'ChangeCommonInfoModal' = 'ChangeCommonInfoModal',
}

const Templates = new Map<COMPONENTS_NAMES, Component>([
  [COMPONENTS_NAMES.Chats, Chats],
  // [COMPONENTS_NAMES._404, _404],
  // [COMPONENTS_NAMES.Auth, Auth],
  // [COMPONENTS_NAMES._500, _500],
  // [COMPONENTS_NAMES.Register, Register],
  [COMPONENTS_NAMES.UserModal, UserModal()],
  // [COMPONENTS_NAMES.ChangePasswordModal, ChangePasswordModal],
  [COMPONENTS_NAMES.ChangeCommonInfoModal, ChangeCommonInfoModal()],
]);

export default function renderRoute() {
  const hash = window.location.pathname.split('/');
  const path = hash[hash.length - 1] ?? '';

  switch (path) {
    case '':
      return Templates.get(COMPONENTS_NAMES.Chats);

    case 'sign-in':
      return Templates.get(COMPONENTS_NAMES.Auth);

    case 'sign-up':
      return Templates.get(COMPONENTS_NAMES.Register);

    case '500':
      return Templates.get(COMPONENTS_NAMES._500);

    case 'user-data':
      return Templates.get(COMPONENTS_NAMES.UserModal);

    case 'change-password':
      return Templates.get(COMPONENTS_NAMES.ChangePasswordModal);

    case 'change-info':
      return Templates.get(COMPONENTS_NAMES.ChangeCommonInfoModal);

    default:
      return Templates.get(COMPONENTS_NAMES._404);
  }
}
