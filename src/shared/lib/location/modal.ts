const MODAL_QUERY_KEY = 'modal';
export const MODAL_CHANGE_EVENT = 'modalchange';

function createURL() {
  return new URL(window.location.href);
}

export function getActiveModal() {
  return createURL().searchParams.get(MODAL_QUERY_KEY);
}

export function isModalActive(modalId: string) {
  return getActiveModal() === modalId;
}

export function openModal(modalId: string) {
  const url = createURL();
  if (url.searchParams.get(MODAL_QUERY_KEY) === modalId) {
    return;
  }

  url.searchParams.set(MODAL_QUERY_KEY, modalId);
  window.history.pushState({}, '', `${url.pathname}${url.search}`);
  window.dispatchEvent(new Event(MODAL_CHANGE_EVENT));
}

export function closeModal(modalId: string) {
  if (!isModalActive(modalId)) {
    return;
  }

  window.history.back();
}
