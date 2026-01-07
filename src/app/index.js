import './assets/styles/index.scss';
import.meta.glob('@shared/ui/*/*.scss', {eager: true});
import.meta.glob('@pages/*/*.scss', {eager: true});

import Button from '@shared/ui/button/button.hbs';
import Input from '@shared/ui/input/input.hbs';
import Link from '@shared/ui/link/link.hbs';

import Handlebars from 'handlebars/runtime';
import Home from '@pages/Home.hbs';
import Auth from '@pages/Auth/Auth.hbs';
import _404 from '@pages/_404/404.hbs';
import _500 from '@pages/_500/500.hbs';

Handlebars.registerPartial('Button', Button);
Handlebars.registerPartial('Input', Input);
Handlebars.registerPartial('Link', Link);

const Templates = new Map([
    ['Home', Home],
    ['404', _404],
    ['Auth', Auth],
    ['500', _500]
])

function renderRoute(){
    const hash = window.location.pathname.split('/');
    switch(hash[hash.length - 1]){
        case '':
            return Templates.get('Home')({});

        case 'sign-in':
            return Templates.get('Auth')({});
            
        case '500':
            return Templates.get('500')({});

        default:
            return Templates.get('404')({});
    }

}

document.addEventListener('DOMContentLoaded',()=>{
    const root = document.querySelector('#app');
    root.innerHTML = renderRoute();
})