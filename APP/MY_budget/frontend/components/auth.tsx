'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveSession } from '@/src/app/utils/storage';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthComponent() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

const [formData, setFormData] = useState<{
  email: string;
  secret: string;
  confirmSecret: string;
  name: string;
}>({
  email: '',
  secret: '',
  confirmSecret: '',
  name: '',
});

const [errors, setErrors] = useState<Record<string, string>>({});


  // Validation email
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,63}$/;
    return regex.test(email);
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Email valide requis';
    }

    if (!formData.secret || formData.secret.length < 6) {
      newErrors.strength = 'Au minimum 6 caractères';
    }

    if (!isLogin) {
      if (!formData.name || formData.name.length < 2) {
        newErrors.name = 'Nom requis (min 2 caractères)';
      }

      if (formData.secret !== formData.confirmSecret) {
        newErrors.mismatch = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion du changement d'input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      // ✅ NOUVEAU
const endpoint = isLogin ? `${process.env.NEXT_PUBLIC_API_URL}/auth/login` : `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;
      const payload = isLogin
        ? { email: formData.email, password: formData.secret }
        : { email: formData.email, password: formData.secret, name: formData.name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
if (response.ok) {
  setMessageType('success');
  setMessage(isLogin ? '✓ Connexion réussie!' : '✓ Inscription réussie!');
  
  saveSession(data.token, data.user);
  
  setFormData({ email: '', secret: '', confirmSecret: '', name: '' });

  // ✅ Attends un peu que tout soit sauvegardé
  setTimeout(() => {
    router.push('/dashboard');
  }, 1500);
} else {
  setMessageType('error');
  setMessage(data.message || 'Une erreur est survenue');
}
    } catch (error) {
      setMessageType('error');
      setMessage('Erreur serveur. Essayer plus tard.');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">Smart Budget</h1>
          <p className="text-gray-600">Gestion intelligente de vos finances</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Tabs */}
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded font-medium transition ${
                isLogin
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded font-medium transition ${
                isLogin
                  ? 'text-gray-600 hover:text-gray-800'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {messageType === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Field (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-indigo-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="current-password"
                  name="secret"
                  value={formData.secret}
                  onChange={handleChange}
                  placeholder="••••••"
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.strength
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-indigo-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.strength && (
                <p className="text-red-600 text-sm mt-1">{errors.strength}</p>
              )}
            </div>

            {/* Confirm Password Field (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirm-password"
                    name="confirmSecret"
                    value={formData.confirmSecret}
                    onChange={handleChange}
                    placeholder="••••••"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.mismatch
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-indigo-200'
                    }`}
                  />
                </div>
                {errors.mismatch && (
                  <p className="text-red-600 text-sm mt-1">{errors.mismatch}</p>
                )}
              </div>
            )}

            {/* Forgot Password Link (Login only) */}
            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700">
                  Mot de passe oublié?
                </button>
              </div>
            )}

            {/* Submit Button */}
            {(() => {
              const submitLabel = isLogin ? 'Se connecter' : "S'inscrire";
              return (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Chargement...' : submitLabel}
                </button>
              );
            })()}
          </form>

          {/* Terms (Register only) */}
          {!isLogin && (
            <p className="text-center text-sm text-gray-600 mt-6">
              En vous inscrivant, vous acceptez nos{' '}
              <button type="button" className="text-indigo-600 hover:underline">
                conditions d'utilisation
              </button>
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          © 2026 Smart Budget. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}