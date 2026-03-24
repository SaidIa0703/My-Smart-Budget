// Tests de la logique de validation du formulaire Auth

const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateForm = (
  formData: { email: string; secret: string; name?: string; confirmSecret?: string },
  isLogin: boolean
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Email valide requis';
  }

  if (!formData.secret || formData.secret.length < 6) {
    errors.strength = 'Au minimum 6 caractères';
  }

  if (!isLogin) {
    if (!formData.name || formData.name.length < 2) {
      errors.name = 'Nom requis (min 2 caractères)';
    }
    if (formData.secret !== formData.confirmSecret) {
      errors.mismatch = 'Les mots de passe ne correspondent pas';
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
    const errors = validateForm({ email: 'a@b.com', secret: 'abc123' }, true);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('signale un email invalide', () => {
    const errors = validateForm({ email: 'invalid', secret: 'abc123' }, true);
    expect(errors.email).toBeDefined();
  });

  it('signale un mot de passe trop court', () => {
    const errors = validateForm({ email: 'a@b.com', secret: '123' }, true);
    expect(errors.strength).toBeDefined();
  });
});

describe('validateForm - mode register', () => {
  it('valide un formulaire correct', () => {
    const errors = validateForm(
      { email: 'a@b.com', secret: 'abc123', name: 'Jean', confirmSecret: 'abc123' },
      false
    );
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('signale un nom trop court', () => {
    const errors = validateForm(
      { email: 'a@b.com', secret: 'abc123', name: 'J', confirmSecret: 'abc123' },
      false
    );
    expect(errors.name).toBeDefined();
  });

  it('signale des mots de passe non identiques', () => {
    const errors = validateForm(
      { email: 'a@b.com', secret: 'abc123', name: 'Jean', confirmSecret: 'different' },
      false
    );
    expect(errors.mismatch).toBeDefined();
  });
});
