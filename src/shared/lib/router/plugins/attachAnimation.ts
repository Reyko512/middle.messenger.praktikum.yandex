import { Router } from '../router';

export default function attachAnimation(router: Router) {
  router._eventBus.on(Router.EVENTS.START, () => {
    document.body.classList.add('router-animating');
  });

  router._eventBus.on(Router.EVENTS.END, () => {
    document.body.classList.remove('router-animating');
  });
}
