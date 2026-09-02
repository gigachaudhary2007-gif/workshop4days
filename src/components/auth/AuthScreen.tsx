import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, Check, ArrowRight, BookOpen, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

interface AuthScreenProps {
  onAuthenticate: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticate }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { showToast } = useToast();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        errs.fullName = 'Full name is required';
      }
      if (password !== confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
      if (!agreeTerms) {
        errs.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const authenticatedUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: isSignUp ? fullName.trim() : (email.split('@')[0] || 'Alex Chen'),
        email: email.trim(),
        gradeLevel: 'Grade 12 / High School Senior',
        studyGoalHours: 3,
        completedTasksToday: 4,
        streakDays: 5,
        rememberMe,
      };

      showToast(isSignUp ? 'Account created successfully! Welcome to Study to Shine.' : 'Welcome back to Study to Shine!');
      onAuthenticate(authenticatedUser);
    }, 900);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const googleUser: User = {
        id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
        name: 'Alex Chen',
        email: 'alex.chen@student.edu',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        gradeLevel: 'AP Scholar / High School Senior',
        studyGoalHours: 4,
        completedTasksToday: 3,
        streakDays: 7,
        rememberMe: true,
      };
      showToast('Signed in with Google account.');
      onAuthenticate(googleUser);
    }, 700);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setForgotSubmitted(true);
    showToast(`Password reset link sent to ${forgotEmail}`);
    setTimeout(() => {
      setForgotPasswordOpen(false);
      setForgotSubmitted(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header branding */}
      <header className="w-full px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#16835B] flex items-center justify-center text-white shadow-sm shadow-[#16835B]/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-[#171A18] tracking-tight">Study to Shine</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16835B] border border-emerald-100">
              AI Student Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#5F6762] hidden sm:inline">
            {isSignUp ? 'Already registered?' : 'New student?'}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
            }}
            className="text-xs sm:text-sm font-semibold text-[#16835B] hover:text-[#0F6246] px-3.5 py-1.5 rounded-xl border border-[#16835B]/30 hover:bg-emerald-50/60 transition-all"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#E1E5E1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-7 sm:p-9 relative overflow-hidden">
            {/* Top decorative accent bar in refined Emerald */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#16835B]" />

            {/* Wordmark and Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-[#16835B] mb-3.5 border border-emerald-100">
                <BookOpen className="w-6 h-6" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? 'signup-head' : 'signin-head'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <h1 className="text-2xl font-bold text-[#171A18] tracking-tight">
                    {isSignUp ? 'Create your account' : 'Welcome back'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5F6762] mt-1.5">
                    {isSignUp
                      ? 'Join students learning smarter with AI-guided understanding'
                      : 'Continue your learning journey with AI-powered study tools'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Google Fast Sign In / Sign Up */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-[#E1E5E1] hover:border-[#CBD3CC] bg-white hover:bg-[#F8F9F6] text-sm font-semibold text-[#171A18] flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E1E5E1]" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold text-[#89918C] uppercase tracking-wider">
                OR
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {isSignUp && (
                  <motion.div
                    key="fullname-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Input
                      label="Full Name"
                      placeholder="e.g. Alex Chen"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      error={errors.fullName}
                      leftIcon={<UserIcon className="w-4 h-4" />}
                      autoComplete="name"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                label="Email Address"
                type="email"
                placeholder="student@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:text-[#171A18] transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <AnimatePresence mode="popLayout">
                {isSignUp && (
                  <motion.div
                    key="confirm-password-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={errors.confirmPassword}
                      leftIcon={<ShieldCheck className="w-4 h-4" />}
                      autoComplete="new-password"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="p-1 hover:text-[#171A18] transition-colors focus:outline-none"
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Options: Remember Me & Forgot Password */}
              {!isSignUp ? (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#5F6762] hover:text-[#171A18]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E1E5E1] text-[#16835B] focus:ring-[#16835B]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="font-semibold text-[#16835B] hover:text-[#0F6246] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              ) : (
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-[#5F6762]">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-[#E1E5E1] text-[#16835B] focus:ring-[#16835B]"
                    />
                    <span>
                      I agree to the <span className="text-[#16835B] font-medium hover:underline">Terms of Service</span> and{' '}
                      <span className="text-[#16835B] font-medium hover:underline">Privacy Policy</span>.
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.agreeTerms}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </div>
            </form>

            {/* Bottom Toggle Footer */}
            <div className="mt-6 text-center text-xs text-[#5F6762] pt-4 border-t border-[#E1E5E1]">
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrors({});
                    }}
                    className="font-bold text-[#16835B] hover:text-[#0F6246] hover:underline"
                  >
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrors({});
                    }}
                    className="font-bold text-[#16835B] hover:text-[#0F6246] hover:underline"
                  >
                    Sign up
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Slogan */}
          <p className="text-center text-xs text-[#89918C] mt-6 tracking-wide">
            Learn smarter. Understand better. Shine brighter.
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="w-full py-4 text-center text-[11px] text-[#89918C] border-t border-[#E1E5E1]/60">
        © 2026 Study to Shine Inc. Academic Integrity & Secure Student AI.
      </footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        title="Reset your password"
        subtitle="We will send a secure password reset link to your email"
        maxWidth="sm"
      >
        {forgotSubmitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#16835B] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#171A18]">Instructions Sent!</p>
            <p className="text-xs text-[#5F6762]">
              Check your inbox for a link to reset your account password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <Input
              label="Student Email"
              type="email"
              placeholder="student@school.edu"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setForgotPasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
