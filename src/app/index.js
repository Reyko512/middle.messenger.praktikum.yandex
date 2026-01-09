import.meta.glob('@shared/ui/*/*.scss', { eager: true });
import.meta.glob('@pages/**/*.scss', { eager: true });
import.meta.glob('@entities/**/*.scss', { eager: true });
import.meta.glob('@widgets/**/*.scss', { eager: true });

import './assets/styles/index.scss';

import widgets from '@widgets/';
import sharedUi from '@shared/ui/';
import entities from '@entities/';

import renderRoute from './config/router';
import registerComponents from '../shared/lib/components/registerComponents';

registerComponents(widgets, sharedUi, entities);

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#app');
  root.innerHTML = renderRoute();
});
