import './assets/styles/index.scss';
import.meta.glob('@shared/ui/*/*.scss', {eager: true});

import Button from '@shared/ui/button/button.hbs';
import Input from '@shared/ui/input/input.hbs';

import Handlebars from 'handlebars/runtime';
import Home from '@pages/Home.hbs';
import _404 from '@pages/404.hbs'

Handlebars.registerPartial('Button', Button);
Handlebars.registerPartial('Input', Input);

const Templates = new Map([
    ['Home', Home],
    ['404', _404]
])

function renderRoute(){
    const hash = window.location.pathname.split('/');
    switch(hash[hash.length - 1]){
        case '':
            return Templates.get('Home')({});

        default:
            return Templates.get('404')({});
    }

}

document.addEventListener('DOMContentLoaded',()=>{
    const root = document.querySelector('#app');
    root.innerHTML = renderRoute();
})