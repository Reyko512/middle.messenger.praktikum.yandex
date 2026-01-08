import Handlebars from 'handlebars/runtime';

import './assets/styles/index.scss';
import.meta.glob('@shared/ui/*/*.scss', {eager: true});
import.meta.glob('@pages/*/*.scss', {eager: true});
import.meta.glob('@entities/**/*.scss', {eager: true});

import Button from '@shared/ui/button/button.hbs';
import Input from '@shared/ui/input/input.hbs';
import Link from '@shared/ui/link/link.hbs';
import Avatar from '@shared/ui/avatar/avatar.hbs';
import Search from '@shared/ui/search/search.hbs';
import MessageInput from "@shared/ui/MessageInput/MessageInput.hbs";
import FileInput from "@shared/ui/FileInput/FileInput.hbs";

import Chats from '@pages/Chats/Chats.hbs';
import Auth from '@pages/Auth/Auth.hbs';
import _404 from '@pages/_404/404.hbs';
import _500 from '@pages/_500/500.hbs';
import { ChatItem } from '../entities/chat';

Handlebars.registerPartial('Button', Button);
Handlebars.registerPartial('Input', Input);
Handlebars.registerPartial('Link', Link);
Handlebars.registerPartial('Avatar', Avatar);
Handlebars.registerPartial('Search', Search);
Handlebars.registerPartial('MessageInput', MessageInput);
Handlebars.registerPartial('FileInput', FileInput);



Handlebars.registerPartial("ChatItem", ChatItem);

const Templates = new Map([
    ['Chats', Chats],
    ['404', _404],
    ['Auth', Auth],
    ['500', _500]
])

function renderRoute(){
    const hash = window.location.pathname.split('/');
    switch(hash[hash.length - 1]){
        case '':
            return Templates.get('Chats')({});

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