[![Tests](https://github.com/Reyko512/middle.messenger.praktikum.yandex/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/Reyko512/middle.messenger.praktikum.yandex/actions/workflows/tests.yml)

## Messenger Byte

Проект учебного мессенджера на TypeScript + Vite с FSD-структурой, строгой типизацией, роутингом, HTTP API и WebSocket.

## Design

- https://www.figma.com/design/ejSycYEFYGPpu8EfV1jZu6/messanger-byte?node-id=1-4&t=XGArgxmmIffhONdF-1

## Netlify

- https://charming-haupia-7d6657.netlify.app/

## Функциональность

- Роутинг страниц:
  - `/` — вход
  - `/sign-up` — регистрация
  - `/settings` — профиль пользователя
  - `/messenger` — чат
- Работа браузерной истории:
  - переходы по UI;
  - кнопки браузера `Назад`/`Вперёд`;
  - восстановление страницы после `F5`.
- Авторизация:
  - регистрация;
  - вход;
  - выход.
- Профиль:
  - изменение данных пользователя;
  - изменение аватара;
  - изменение пароля.
- Чаты:
  - загрузка списка чатов;
  - создание чата;
  - добавление пользователя в чат;
  - удаление пользователя из чата.
- Сообщения:
  - real-time сообщения через WebSocket;
  - загрузка истории сообщений;
  - заглушка, если чат не выбран.
- Безопасность:
  - экранирование шаблонов Handlebars;
  - санитизация пользовательского ввода (базовая защита от XSS);
  - обработка ошибок HTTP и WebSocket.

## Технологии

- TypeScript (`strict`)
- Vite
- Handlebars
- SCSS
- ESLint + Stylelint
- Архитектура: FSD + MVC-подход

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Проверки

```bash
npm run lint:code
npm run lint:style
npx tsc --noEmit
```

## API

- Swagger: https://ya-praktikum.tech/api/v2/swagger/#/
