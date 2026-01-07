import './assets/styles/index.scss';
import.meta.glob('@shared/ui/*/*.scss', {eager: true});

import button from '@shared/ui/button/button.hbs';
import Handlebars from 'handlebars/runtime';
import Home from '@pages/Home.hbs';
import _404 from '@pages/404.hbs'

Handlebars.registerPartial('button', button);

const Templates = new Map([
    ['Home', Home],
    ['404', _404]
])

function renderRoute(){
    const hash = window.location.hash.slice(1) || 'home';

    switch(hash){
        case 'home':
            return Templates.get('Home')({});

        default:
            return Templates.get('404')({});
    }

}

document.addEventListener('DOMContentLoaded',()=>{
    const root = document.querySelector('#app');
    root.innerHTML = renderRoute();
})