import Swal from 'sweetalert2';

const baseClass = 'text-white font-semibold px-4 py-2 rounded';

const baseConfig = {
  buttonsStyling: false,
};

export const showSuccess = (title = 'Sucesso!', text = 'Operação concluída.') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    ...baseConfig,
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: `bg-blue-600 hover:bg-blue-700 ${baseClass}`,
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

  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    ...baseConfig,
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: `bg-red-600 hover:bg-red-700 ${baseClass}`,
    },
  });
};

export const showConfirm = ({
  title = 'Tem certeza?',
  text = 'Essa ação não poderá ser desfeita!',
  confirmButtonText = 'Sim',
  cancelButtonText = 'Cancelar',
} = {}) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    ...baseConfig,
    customClass: {
      confirmButton: `bg-red-600 hover:bg-red-700 ${baseClass}`,
      cancelButton: `bg-blue-600 hover:bg-blue-700 ${baseClass} ml-2`,
    },
  });
};
