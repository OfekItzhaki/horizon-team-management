import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import type { LoginDto, ApiError } from '../sdk/types';
import AuthLayout from '../layouts/AuthLayout';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import TurnstileWidget from '../components/TurnstileWidget';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { getTurnstileSiteKey } from '../sdk/config';

export default function Login() {
    // Fallback translation helper if i18next is not configured
    const t = (key: string) => {
        const translations: Record<string, string> = {
            'login.title': 'Sign In',
            'login.emailPlaceholder': 'Email Address',
            'login.passwordPlaceholder': 'Password',
            'login.failed': 'Invalid email or password.'
        };
        return translations[key] || key;
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const turnstileRef = useRef<TurnstileInstance>(null);

    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!captchaToken && getTurnstileSiteKey()) {
            setError('Please complete the security verification.');
            return;
        }

        setLoading(true);
        try {
            const credentials: LoginDto = { email, password, captchaToken };
            await login(credentials);

            // On success, the AuthContext should update and handle redirect or UI state
            // For now, let's assume a full page reload or simple success
            window.location.href = '/';
        } catch (err: unknown) {
            turnstileRef.current?.reset();
            setCaptchaToken('');
            const apiErr = err as ApiError;
            setError(Array.isArray(apiErr.message) ? apiErr.message.join(', ') : apiErr.message || t('login.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Horizon Tasks" subtitle={t('login.title')}>
            <form className="space-y-6" onSubmit={handleLogin}>
                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-sm font-bold animate-shake">
                        {error}
                    </div>
                )}

                <div className="flex justify-center mb-6">
                    <TurnstileWidget
                        ref={turnstileRef}
                        onSuccess={setCaptchaToken}
                        onExpire={() => setCaptchaToken('')}
                    />
                </div>

                <div className="space-y-5">
                    <div className="group">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                            {t('login.emailPlaceholder')}
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value.trim())}
                                className="premium-input pl-11"
                                placeholder="name@example.com"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                            {t('login.passwordPlaceholder')}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="premium-input pl-11 pr-12"
                                placeholder="••••••••"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-violet-500"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="premium-button w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {t('login.title')}
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                    )}
                </button>

                <div className="flex flex-col items-center gap-4 mt-8">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Don't have an account? Contact your administrator
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
