const CONTACT_FIELDS = [
  {
    id: 'name',
    validate: (value) => {
      if (value.trim().length===0){
        return 'Please enter your name.';
      }

      return '';
    },
  },
  {
    id: 'email',
    validate: (value) => {
      if (value.trim().length === 0) {
        return 'Please enter your email address.';
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(value.trim())) {
        return 'Please enter a valid email address.';
      }

      return '';
    },
  },
  {
    id: 'subject',
    validate: (value) => {
      if (value.trim().length === 0) {
        return 'Please enter a subject.';
      }

      return '';
    },
  },
  {
    id: 'message',
    validate: (value) => {
      if (value.trim().length === 0) {
        return 'Please write a short message.';
      }

      return '';
    },
  },
];

const getFieldParts = (fieldId) => {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId}-error`);

  return { input, error };
};

const setFieldState = (input, error, message) => {
  const hasError = message.length > 0;

  input.setAttribute('aria-invalid', hasError.toString());
  error.textContent = message;
};

const validateField = (fieldConfig) => {
  const { input, error } = getFieldParts(fieldConfig.id);

  if (!input || !error) {
    return true;
  }

  const message = fieldConfig.validate(input.value);
  setFieldState(input, error, message);

  return message.length === 0;
};

const clearFormErrors = () => {
  CONTACT_FIELDS.forEach((fieldConfig) => {
    const { input, error } = getFieldParts(fieldConfig.id);

    if (!input || !error) {
      return;
    }

    input.removeAttribute('data-touched');
    setFieldState(input, error, '');
  });
};

const initContactForm = () => {
  const form = document.getElementById('contact-form');
  const successPanel = document.getElementById('contact-success');
  const resetButton = document.getElementById('reset-btn');

  if (!form || !successPanel || !resetButton) {
    return;
  }

  successPanel.hidden = true;
  form.hidden = false;
  clearFormErrors();

  CONTACT_FIELDS.forEach((fieldConfig) => {
    const { input } = getFieldParts(fieldConfig.id);

    if (!input) {
      return;
    }

    input.addEventListener('blur', () => {
      input.dataset.touched = 'true';
      validateField(fieldConfig);
    });

    input.addEventListener('input', () => {
      if (input.dataset.touched === 'true') {
        validateField(fieldConfig);
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let firstInvalidInput = null;

    CONTACT_FIELDS.forEach((fieldConfig) => {
      const { input } = getFieldParts(fieldConfig.id);
      const isValid = validateField(fieldConfig);

      if (!isValid && !firstInvalidInput) {
        firstInvalidInput = input;
      }
    });

    if (firstInvalidInput) {
      firstInvalidInput.focus();
      return;
    }

    form.reset();
    clearFormErrors();
    form.hidden = true;
    successPanel.hidden = false;
    resetButton.focus();
  });

  resetButton.addEventListener('click', () => {
    successPanel.hidden = true;
    form.hidden = false;
    clearFormErrors();
    document.getElementById('name')?.focus();
  });
};

document.addEventListener('DOMContentLoaded', initContactForm);
