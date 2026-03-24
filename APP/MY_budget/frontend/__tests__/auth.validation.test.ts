// Tests de la logique de validation du formulaire Auth

const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateForm = (
  formData: { email: string; password: string; name?: string; confirmPassword?: string },
  isLogin: boolean
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Email valide requis';
  }

  if (!formData.password || formData.password.length < 6) {
    errors.password = 'Au minimum 6 caractères';
  }

  if (!isLogin) {
    if (!formData.name || formData.name.length < 2) {
      errors.name = 'Nom requis (min 2 caractères)';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
  }

  return errors;
};

describe('validateEmail', () => {
  it('accepte un email valide', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('refuse un email sans @', () => {
    expect(validateEmail('userexample.com')).toBe(false);
  });

  it('refuse un email sans domaine', () => {
    expect(validateEmail('user@')).toBe(false);
  });

  it('refuse une chaîne vide', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('validateForm - mode login', () => {
  it('valide un formulaire correct', () => {
    const errors = validateForm({ email: 'a@b.com', password: 'password123' }, true);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('signale un email invalide', () => {
    const errors = validateForm({ email: 'invalid', password: 'password123' }, true);
    expect(errors.email).toBeDefined();
  });

  it('signale un mot de passe trop court', () => {
    const errors = validateForm({ email: 'a@b.com', password: '123' }, true);
    expect(errors.password).toBeDefined();
  });
});

describe('validateForm - mode register', () => {
  it('valide un formulaire correct', () => {
    const errors = validateForm(
      { email: 'a@b.com', password: 'password123', name: 'Jean', confirmPassword: 'password123' },
      false
    );
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('signale un nom trop court', () => {
    const errors = validateForm(
      { email: 'a@b.com', password: 'password123', name: 'J', confirmPassword: 'password123' },
      false
    );
    expect(errors.name).toBeDefined();
  });

  it('signale des mots de passe non identiques', () => {
    const errors = validateForm(
      { email: 'a@b.com', password: 'password123', name: 'Jean', confirmPassword: 'different' },
      false
    );
    expect(errors.confirmPassword).toBeDefined();
  });
});
