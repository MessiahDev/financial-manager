import Swal from 'sweetalert2';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';

const baseClass = 'text-white font-semibold px-4 py-2 rounded';

const baseConfig = {
  buttonsStyling: false,
};

const getThemeMode = () => {
  const themeStore = useThemeStore();
  return themeStore.theme === 'dark' ? 'dark' : 'light';
};

const isUserAuthenticated = () => {
  const authStore = useAuthStore();
  return authStore.isAuthenticated;
};

export const showSuccess = (title = 'Sucesso!', text = 'Operação concluída.') => {
  const isAuth = isUserAuthenticated();

  return Swal.fire({
    icon: 'success',
    title,
    text,
    ...baseConfig,
    confirmButtonText: 'OK',
    customClass: {
      popup: isAuth && getThemeMode() === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900',
      confirmButton: `btn-primary ${baseClass}`,
    },
  });
};

export const showError = (title = 'Erro!', errorOrMessage = '') => {
  let message = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';

  if (typeof errorOrMessage === 'string' && !errorOrMessage.response) {
    message = errorOrMessage;

  } else if (errorOrMessage?.response?.data) {
    const data = errorOrMessage.response.data;

    if (typeof data === 'string') {
      message = data;
    } else if (data.message) {
      message = data.message;
    } else if (Array.isArray(data.errors)) {
      message = data.errors.join('\n');
    } else if (typeof data.errors === 'object') {
      message = Object.values(data.errors).flat().join('\n');
    }
  }

  const isAuth = isUserAuthenticated();

  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    ...baseConfig,
    confirmButtonText: 'OK',
    customClass: {
      popup: isAuth && getThemeMode() === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-900',
      confirmButton: `btn-red ${baseClass}`,
    },
  });
};

export const showConfirm = ({
  title = 'Tem certeza?',
  text = 'Essa ação não poderá ser desfeita!',
  confirmButtonText = 'Sim',
  cancelButtonText = 'Cancelar',
} = {}) => {
  const isAuth = isUserAuthenticated();

  return Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    ...baseConfig,
    customClass: {
      popup: isAuth && getThemeMode() === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-900',
      confirmButton: `btn-red ${baseClass}`,
      cancelButton: `btn-primary ${baseClass} ml-2`,
    },
  });
};
