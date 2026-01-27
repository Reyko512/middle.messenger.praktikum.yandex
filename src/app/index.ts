import.meta.glob('@shared/ui/*/*.scss', { eager: true });
import.meta.glob('@pages/**/*.scss', { eager: true });
import.meta.glob('@entities/**/*.scss', { eager: true });
import.meta.glob('@widgets/**/*.scss', { eager: true });
import.meta.glob('@features/**/*.scss', { eager: true });

import './assets/styles/index.scss';

import widgets from '@widgets/index';
import sharedUi from '@shared/ui';
import entities from '@entities/index';
import features from '@features/index';
import registerComponents from '@shared/lib/components/registerComponents';
import App from './App';

registerComponents(widgets, sharedUi, entities, features);

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#app');
  if (!root) {
    throw new Error('No root!');
  }
  root.replaceWith(App.getContent());
});
