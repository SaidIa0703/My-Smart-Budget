import { saveSession, getToken, getUser, clearSession } from '@/src/app/utils/storage';

describe('storage utilities', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('saveSession', () => {
    it('stores token in sessionStorage', () => {
      saveSession('mytoken', { id: 1 });
      expect(sessionStorage.getItem('token')).toBe('mytoken');
    });

    it('stores user as JSON in sessionStorage', () => {
      const user = { id: 1, email: 'test@test.com' };
      saveSession('tok', user);
      expect(sessionStorage.getItem('user')).toBe(JSON.stringify(user));
    });
  });

  describe('getToken', () => {
    it('returns token when present', () => {
      sessionStorage.setItem('token', 'abc123');
      expect(getToken()).toBe('abc123');
    });

    it('returns null when no token', () => {
      expect(getToken()).toBeNull();
    });
  });

  describe('getUser', () => {
    it('returns parsed user from sessionStorage', () => {
      const user = { id: 1, name: 'Alice' };
      sessionStorage.setItem('user', JSON.stringify(user));
      expect(getUser()).toEqual(user);
    });

    it('returns null when no user stored', () => {
      expect(getUser()).toBeNull();
    });

    it('returns null on invalid JSON', () => {
      sessionStorage.setItem('user', 'not-valid-json{{{');
      expect(getUser()).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('removes token and user from sessionStorage', () => {
      sessionStorage.setItem('token', 'abc');
      sessionStorage.setItem('user', '{}');
      clearSession();
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('user')).toBeNull();
    });
  });
});
