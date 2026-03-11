[![Tests](https://github.com/Reyko512/middle.messenger.praktikum.yandex/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/Reyko512/middle.messenger.praktikum.yandex/actions/workflows/tests.yml)

## Messenger Byte

Учебный мессенджер на TypeScript и Vite с FSD-структурой, собственной компонентной системой, роутером, HTTP API и WebSocket-чатом.

## Дизайн

- Figma: https://www.figma.com/design/ejSycYEFYGPpu8EfV1jZu6/messanger-byte?node-id=1-4&t=XGArgxmmIffhONdF-1

## Демо

- Netlify: https://charming-haupia-7d6657.netlify.app/

## Функциональность

- Аутентификация: регистрация, вход, выход, восстановление сессии.
- Роутинг: `/`, `/sign-up`, `/messenger`, `/settings`, `/change-info`, `/change-password`, `/500`, fallback на `404`.
- Защита маршрутов: гостевые и приватные гард-маршруты, редиректы при истечении сессии.
- Чаты: загрузка списка, создание чатов, просмотр участников, добавление и удаление пользователей.
- Сообщения: отправка текста и файлов, загрузка истории, real-time обновления через WebSocket.
- Профиль: обновление общих данных, аватара и пароля.
- UI: модальные окна, toast-уведомления, анимации переходов между страницами.
- Безопасность: санитизация пользовательского ввода и экранирование шаблонов для базовой защиты от XSS.

## Технологии

- TypeScript (`strict`)
- Vite
- Handlebars
- SCSS
- Feature-Sliced Design
- ESLint
- Stylelint
- Mocha + Chai
- Husky

## Установка и запуск

```bash
npm install
npm run dev
```

После `npm install` автоматически настраивается `husky`, и `pre-commit` начинает запускать линтеры и тесты.

## Сборка

```bash
npm run build
npm run preview
```

## Тесты и проверки

```bash
npm test
npx tsc --noEmit
npm run lint
```

Тесты лежат рядом с тестируемыми модулями:

- `src/shared/lib/router/router.spec.ts`
- `src/shared/lib/components/Component.spec.ts`
- `src/shared/lib/http/http.spec.ts`

## API

- Swagger: https://ya-praktikum.tech/api/v2/swagger/#/
