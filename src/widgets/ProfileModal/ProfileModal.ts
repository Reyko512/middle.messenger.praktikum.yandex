import Component, { type ComponentProps } from '@shared/lib/components/Component';
import ProfileModalTemplate from './ProfileModal.hbs';
import type { TemplateDelegate } from 'handlebars';
import {
  UpdateAvatarForm,
  UpdateCommonInfoForm,
  UpdatePasswordForm,
} from '@features/updateProfile';
import { Button } from '@shared/ui/Button';
import { DataRow } from '@shared/ui/DataRow';
import { appStore } from '@app/model';
import type { User } from '@entities/user';
import {
  MODAL_CHANGE_EVENT,
  closeModal,
  getActiveModal,
  isModalActive,
  openModal,
} from '@shared/lib/location/modal';
import { sessionService } from '@features/auth';
import { Routes } from '@shared/lib/router/routes';
import { Router } from '@shared/lib/router/router';

interface ProfileModalProps extends ComponentProps {
  triggerText: string;
  triggerClassName: string;
  UpdateAvatarForm: UpdateAvatarForm;
  UpdateCommonInfoForm: UpdateCommonInfoForm;
  UpdatePasswordForm: UpdatePasswordForm;
  LogoutButton: Button;
  profileData: DataRow[];
  isOverviewOpen: boolean;
  isInfoOpen: boolean;
  isPasswordOpen: boolean;
}

const PROFILE_MODAL = 'profile';
const PROFILE_INFO_MODAL = 'profile-info';
const PROFILE_PASSWORD_MODAL = 'profile-password';

function formatUserValue(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : '-';
}

function createProfileRows(user: User | null) {
  if (!user) {
    return [];
  }

  return [
    new DataRow({ name: 'email', value: formatUserValue(user.email) }),
    new DataRow({ name: 'login', value: formatUserValue(user.login) }),
    new DataRow({
      name: 'first name',
      value: formatUserValue(user.first_name),
    }),
    new DataRow({
      name: 'last name',
      value: formatUserValue(user.second_name),
    }),
    new DataRow({
      name: 'nickname',
      value: formatUserValue(user.display_name),
    }),
    new DataRow({ name: 'phone', value: formatUserValue(user.phone) }),
  ];
}

export default class ProfileModal extends Component<ProfileModalProps> {
  private unsubscribe: (() => void) | null = null;
  private profileRowsCacheKey = '__empty__';
  private profileRowsCache: DataRow[] = [];

  private readonly locationChangeHandler = () => {
    this.syncModalState();
  };

  private readonly keyDownHandler = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }

    if (this.isAnyProfileModalOpen()) {
      this.closeActiveModal();
    }
  };

  constructor() {
    super('div', {
      attrs: {
        class: 'profile-modal-widget',
      },
      events: {
        click: (event: Event) => {
          const target = event.target as HTMLElement;

          if (target.closest('[data-role="profile-modal-trigger"]')) {
            this.openProfileModal(PROFILE_MODAL);
            return;
          }

          if (target.closest('[data-role="open-profile-info"]')) {
            this.openProfileModal(PROFILE_INFO_MODAL);
            return;
          }

          if (target.closest('[data-role="open-profile-password"]')) {
            this.openProfileModal(PROFILE_PASSWORD_MODAL);
            return;
          }

          if (target.matches('[data-role="profile-modal-backdrop"]')) {
            this.closeActiveModal();
            return;
          }

          if (target.closest('[data-role="profile-modal-close"]')) {
            this.closeActiveModal();
            return;
          }

          if (target.closest('[data-role="profile-modal-back"]')) {
            this.goBackFromProfileDetail();
          }
        },
      },
      triggerText: 'settings',
      triggerClassName: 'chat-utils__settings',
      UpdateAvatarForm: new UpdateAvatarForm(),
      UpdateCommonInfoForm: new UpdateCommonInfoForm(),
      UpdatePasswordForm: new UpdatePasswordForm(),
      LogoutButton: new Button({
        text: 'Logout',
        type: 'button',
        events: {
          click: () => {
            void this.logout();
          },
        },
      }),
      profileData: [],
      isOverviewOpen: false,
      isInfoOpen: false,
      isPasswordOpen: false,
    });
  }

  public override beforeMount() {
    this.syncProfileRows();
    this.syncModalState();
    this.unsubscribe = appStore.subscribe(() => {
      this.syncProfileRows();
    });
    window.addEventListener('popstate', this.locationChangeHandler);
    window.addEventListener(MODAL_CHANGE_EVENT, this.locationChangeHandler);
    window.addEventListener('keydown', this.keyDownHandler);
  }

  public override beforeComponentUnmount() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    document.body.classList.remove('profile-modal-open');
    window.removeEventListener('popstate', this.locationChangeHandler);
    window.removeEventListener(MODAL_CHANGE_EVENT, this.locationChangeHandler);
    window.removeEventListener('keydown', this.keyDownHandler);
  }

  private getProfileRows(user: User | null) {
    if (!user) {
      this.profileRowsCacheKey = '__empty__';
      this.profileRowsCache = [];
      return this.profileRowsCache;
    }

    const cacheKey = [
      user.email,
      user.login,
      user.first_name,
      user.second_name,
      user.display_name ?? '',
      user.phone,
      user.avatar ?? '',
    ].join('|');

    if (cacheKey === this.profileRowsCacheKey) {
      return this.profileRowsCache;
    }

    this.profileRowsCacheKey = cacheKey;
    this.profileRowsCache = createProfileRows(user);
    return this.profileRowsCache;
  }

  private syncProfileRows() {
    const profileData = this.getProfileRows(appStore.getState().user);

    if ((this.props['profileData'] as DataRow[]) !== profileData) {
      this.setProps({
        profileData,
      });
    }
  }

  private syncModalState() {
    const activeModal = getActiveModal();
    const isOverviewOpen = activeModal === PROFILE_MODAL;
    const isInfoOpen = activeModal === PROFILE_INFO_MODAL;
    const isPasswordOpen = activeModal === PROFILE_PASSWORD_MODAL;
    const isAnyProfileModalOpen =
      isOverviewOpen || isInfoOpen || isPasswordOpen;

    document.body.classList.toggle(
      'profile-modal-open',
      isAnyProfileModalOpen,
    );

    this.setProps({
      isOverviewOpen,
      isInfoOpen,
      isPasswordOpen,
    });
  }

  private openProfileModal(modalId: string) {
    openModal(modalId);
    this.syncModalState();
  }

  private closeActiveModal() {
    const activeModal = getActiveModal();
    if (!activeModal) {
      return;
    }

    closeModal(activeModal);
  }

  private goBackFromProfileDetail() {
    if (isModalActive(PROFILE_INFO_MODAL)) {
      closeModal(PROFILE_INFO_MODAL);
      return;
    }

    if (isModalActive(PROFILE_PASSWORD_MODAL)) {
      closeModal(PROFILE_PASSWORD_MODAL);
    }
  }

  private isAnyProfileModalOpen() {
    const activeModal = getActiveModal();
    return (
      activeModal === PROFILE_MODAL ||
      activeModal === PROFILE_INFO_MODAL ||
      activeModal === PROFILE_PASSWORD_MODAL
    );
  }

  private async logout() {
    await sessionService.logout();
    new Router('#app').go(Routes.SignIn, { replace: true });
  }

  public override render(): TemplateDelegate {
    return ProfileModalTemplate;
  }
}
