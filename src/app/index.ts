import.meta.glob('@shared/ui/*/*.scss', { eager: true });
import.meta.glob('@pages/**/*.scss', { eager: true });
import.meta.glob('@entities/**/*.scss', { eager: true });
import.meta.glob('@widgets/**/*.scss', { eager: true });
import.meta.glob('@features/**/*.scss', { eager: true });

import './assets/styles/index.scss';
import App from './App';

import sharedUi from '@shared/ui';
import registerComponents from '@shared/lib/components/registerComponents';

import { render } from '@shared/lib/components/renderDom';

registerComponents(sharedUi);
document.addEventListener('DOMContentLoaded', () => {
  render('#app', App);
});
