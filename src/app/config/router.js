import Chats from '@pages/Chats/Chats.hbs';
import Auth from '@pages/Auth/Auth.hbs';
import Register from "@pages/Register/Register.hbs";
import _404 from '@pages/_404/404.hbs';
import _500 from '@pages/_500/500.hbs';

const Templates = new Map([
    ['Chats', Chats],
    ['404', _404],
    ['Auth', Auth],
    ['500', _500],
    ['Register', Register]
])

export default function renderRoute(){
    const hash = window.location.pathname.split('/');
    switch(hash[hash.length - 1]){
        case '':
            return Templates.get('Chats')({});

        case 'sign-in':
            return Templates.get('Auth')({});

        case 'sign-up':
            return Templates.get('Register')({});

        case '500':
            return Templates.get('500')({});

        default:
            return Templates.get('404')({});
    }

}