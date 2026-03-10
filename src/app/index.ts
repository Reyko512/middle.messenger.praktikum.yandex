import.meta.glob('@shared/ui/*/*.scss', { eager: true });
import.meta.glob('@pages/**/*.scss', { eager: true });
import.meta.glob('@entities/**/*.scss', { eager: true });
import.meta.glob('@widgets/**/*.scss', { eager: true });
import.meta.glob('@features/**/*.scss', { eager: true });

import './assets/styles/index.scss';

import { Router } from '@shared/lib/router/router';
import { render } from '@shared/lib/components/renderDom';
import { _404 } from '@pages/_404';
import { _500 } from '@pages/_500';
import { Auth } from '@pages/Auth';
import { Chats } from '@pages/Chats';
import { Register } from '@pages/Register';
import { Routes } from '@shared/lib/router/routes';
import attachAnimation from '@shared/lib/router/plugins/attachAnimation';
import { sessionService } from '@features/auth/model/sessionService';
import { appStore } from '@app/model';
import GlobalToast from '@shared/ui/GlobalToast/GlobalToast';
import { chatsService } from '@features/chats';

const router = new Router('#app');
const globalToast = new GlobalToast();
const protectedRoutes = new Set<string>([
  Routes.Messenger,
  Routes.UserData,
  Routes.ChangeInfo,
  Routes.ChangePassword,
]);
const guestRoutes = new Set<string>([Routes.SignIn, Routes.SignUp]);
const SESSION_EXPIRED_MESSAGE = 'Session expired. Sign in again.';

const authGuard = () => {
  const state = appStore.getState();
  if (!state.isAuthChecked) {
    return false;
  }

  if (state.isAuthenticated && state.user) {
    return true;
  }

  return Routes.SignIn;
};

const guestGuard = () => {
  const state = appStore.getState();
  if (!state.isAuthChecked) {
    return false;
  }

  return state.isAuthenticated && state.user ? Routes.Messenger : true;
};

const modalRouteGuard = () => {
  const state = appStore.getState();
  if (!state.isAuthChecked) {
    return false;
  }

  return state.isAuthenticated && state.user
    ? Routes.Messenger
    : Routes.SignIn;
};

function syncRouteAccess() {
  const state = appStore.getState();
  if (!state.isAuthChecked) {
    return;
  }

  const pathname = window.location.pathname;

  if (!state.isAuthenticated || !state.user) {
    if (protectedRoutes.has(pathname)) {
      router.go(Routes.SignIn, { replace: true });
    }
    return;
  }

  if (guestRoutes.has(pathname)) {
    router.go(Routes.Messenger, { replace: true });
  }
}

router
  .use(Routes.Messenger, Chats, { guard: authGuard })
  .use(Routes.UserData, Chats, { guard: modalRouteGuard })
  .use(Routes.ChangeInfo, Chats, { guard: modalRouteGuard })
  .use(Routes.ChangePassword, Chats, { guard: modalRouteGuard })
  .use(Routes.SignIn, Auth, { guard: guestGuard })
  .use(Routes.SignUp, Register, { guard: guestGuard })
  .use(Routes._500, _500)
  .use('*', _404);

async function bootstrap() {
  attachAnimation(router);
  render('body', globalToast);
  sessionService.registerCleanupHandler(() => {
    chatsService.disconnect();
  });
  appStore.subscribe((state, prevState) => {
    if (
      state.isAuthenticated &&
      state.globalError === SESSION_EXPIRED_MESSAGE &&
      prevState.globalError !== SESSION_EXPIRED_MESSAGE
    ) {
      sessionService.expire(SESSION_EXPIRED_MESSAGE);
      return;
    }

    syncRouteAccess();
  });
  await sessionService.restore();
  router.start();
  syncRouteAccess();
}

document.addEventListener('DOMContentLoaded', () => {
  void bootstrap();
});
