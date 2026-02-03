import { Chats } from '@pages/Chats/';
import { Auth } from '@pages/Auth/';
import { Register } from '@pages/Register/';
import { _404 } from '@pages/_404/';
import { _500 } from '@pages/_500/';

import { default as ChangePasswordModal } from '@widgets/ChangePasswordModal/ChangePasswordModal';
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
  [COMPONENTS_NAMES._404, _404],
  [COMPONENTS_NAMES.Auth, new Auth()],
  [COMPONENTS_NAMES._500, _500],
  [COMPONENTS_NAMES.Register, new Register()],
  [COMPONENTS_NAMES.UserModal, UserModal()],
  [COMPONENTS_NAMES.ChangePasswordModal, ChangePasswordModal()],
  [COMPONENTS_NAMES.ChangeCommonInfoModal, ChangeCommonInfoModal()],
]);

export default function renderRoute(): Component<Record<string, unknown>> {
  const hash = window.location.pathname.split('/');
  const path = hash[hash.length - 1] ?? '';

  switch (path) {
    case '':
      return Templates.get(COMPONENTS_NAMES.Chats) as Component<
        Record<string, unknown>
      >;

    case 'sign-in':
      return Templates.get(COMPONENTS_NAMES.Auth) as Component<
        Record<string, unknown>
      >;

    case 'sign-up':
      return Templates.get(COMPONENTS_NAMES.Register) as Component<
        Record<string, unknown>
      >;

    case '500':
      return Templates.get(COMPONENTS_NAMES._500) as Component<
        Record<string, unknown>
      >;

    case 'user-data':
      return Templates.get(COMPONENTS_NAMES.UserModal) as Component<
        Record<string, unknown>
      >;

    case 'change-password':
      return Templates.get(
        COMPONENTS_NAMES.ChangePasswordModal,
      ) as Component<Record<string, unknown>>;

    case 'change-info':
      return Templates.get(
        COMPONENTS_NAMES.ChangeCommonInfoModal,
      ) as Component<Record<string, unknown>>;

    default:
      return Templates.get(COMPONENTS_NAMES._404) as Component<
        Record<string, unknown>
      >;
  }
}
