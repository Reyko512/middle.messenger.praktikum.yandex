import.meta.glob('@shared/ui/*/*.scss', { eager: true });
import.meta.glob('@pages/**/*.scss', { eager: true });
import.meta.glob('@entities/**/*.scss', { eager: true });
import.meta.glob('@widgets/**/*.scss', { eager: true });
import.meta.glob('@features/**/*.scss', { eager: true });

import './assets/styles/index.scss';

import sharedUi from '@shared/ui';
import registerComponents from '@shared/lib/components/registerComponents';
import { Router } from '@shared/lib/router/router';
import { _404 } from '@pages/_404';
import { _500 } from '@pages/_500';
import { Auth } from '@pages/Auth';
import { Chats } from '@pages/Chats';
import { Register } from '@pages/Register';
import { Routes } from '@shared/lib/router/routes';
import UserModalPage from '@widgets/UserModal/UserModal';
import { ChangeCommonInfoPage } from '@widgets/ChangeCommonInfoModal';
import ChangePasswordPage from '@widgets/ChangePasswordModal/ChangePasswordModal';

const router = new Router('#app');
router
  .use(Routes.Messenger, Chats)
  .use(Routes.SignIn, Auth)
  .use(Routes.SignUp, Register)
  .use(Routes.UserData, UserModalPage)
  .use(Routes.ChangeInfo, ChangeCommonInfoPage)
  .use(Routes.ChangePassword, ChangePasswordPage)
  .use(Routes._500, _500)
  .use('*', _404)
  .start();

registerComponents(sharedUi);
document.addEventListener('DOMContentLoaded', () => {
  router.start();
});
