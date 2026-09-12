/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useVeterinary } from '../context/VeterinaryContext';
import {
  Heart,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface QuickRole {
  role: 'Admin' | 'Veterinarian' | 'Receptionist' | 'Pet Owner';
  name: string;
  subtitle: string;
  username: string;
  password: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
}

const QUICK_ROLES: QuickRole[] = [
  {
    role: 'Admin',
    name: 'Dr. Sarah Jenkins',
    subtitle: 'Medical Director (Full Access)',
    username: 'Admin',
    password: 'admin1234',
    badge: 'Admin',
    badgeColor: 'bg-emerald-600 text-white',
    borderColor: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/40'
  },
  {
    role: 'Veterinarian',
    name: 'Dr. Robert Taylor',
    subtitle: 'Clinical Surgeon & Consults',
    username: 'dr.taylor',
    password: 'staff1234',
    badge: 'DVM',
    badgeColor: 'bg-sky-600 text-white',
    borderColor: 'border-sky-200 hover:border-sky-400 bg-sky-50/40'
  },
  {
    role: 'Receptionist',
    name: 'Emily Clark',
    subtitle: 'Admissions & Client Billing',
    username: 'emily.clark',
    password: 'staff1234',
    badge: 'Staff',
    badgeColor: 'bg-amber-600 text-white',
    borderColor: 'border-amber-200 hover:border-amber-400 bg-amber-50/40'
  },
  {
    role: 'Pet Owner',
    name: 'John Doe',
    subtitle: "Buddy & Luna's Health Portal",
    username: 'john.doe',
    password: 'client1234',
    badge: 'Client',
    badgeColor: 'bg-purple-600 text-white',
    borderColor: 'border-purple-200 hover:border-purple-400 bg-purple-50/40'
  }
];

export const LoginView: React.FC = () => {
  const { loginWithCredentials, resetToDemoData } = useVeterinary();
  const [identifier, setIdentifier] = useState('Admin');
  const [password, setPassword] = useState('admin1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = loginWithCredentials(identifier, password);
    if (!result.success) {
      setError(result.message || 'Authentication failed. Please verify your credentials.');
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role: QuickRole) => {
    setIdentifier(role.username);
    setPassword(role.password);
    setError(null);
    setIsSubmitting(true);
    const res = loginWithCredentials(role.username, role.password);
    if (!res.success) {
      setError(res.message || 'Quick login failed.');
      setIsSubmitting(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset the database to initial complete demo data? All test records, appointments, and pets will be restored.')) {
      resetToDemoData();
      setIdentifier('Admin');
      setPassword('admin1234');
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-900/5 flex flex-col justify-center items-center p-4 sm:p-6 text-left font-sans"
      id="login-view-screen"
    >
      <div className="w-full max-w-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/25 mb-2">
            <Heart className="h-7 w-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            WellPet VetCore Pro
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Enterprise Veterinary Practice Management System (VMS) & Secure Pet Owner Client Health Portal
          </p>
        </div>

        {/* Quick 1-Click Role Login Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 sm:p-5 shadow-sm space-y-3 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Quick Demo Access (1-Click Login)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Select any role to test workflows</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {QUICK_ROLES.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleQuickLogin(r)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer ${r.borderColor}`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${r.badgeColor}`}>
                      {r.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">{r.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{r.subtitle}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Manual Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl shadow-slate-200/50 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Account Authentication</h2>
              <p className="text-[11px] text-slate-400">Or sign in with custom clinical staff or client credentials</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              RBAC Protected
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div
              id="login-error-alert"
              className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-semibold block">Authentication Error</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {resetSuccess && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-700 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Demo database successfully restored to full operational state!</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4" id="login-form" autoComplete="off">
            {/* Identifier */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-identifier-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Username or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="login-identifier-input"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. Admin, dr.taylor, john.doe"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  id="toggle-password-visibility-btn"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Reset Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={handleResetData}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                title="Reset database to clean demo state"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Demo Data</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              id="login-submit-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Authenticate & Enter System</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Security Footer Note */}
        <div className="text-center text-[10px] text-slate-400 space-y-1">
          <p>WellPet Health Information Systems • HIPAA & Clinical Ledger Compliant</p>
          <p className="font-mono text-[9px] text-slate-400">Strictly authorized clinical and client personnel only</p>
        </div>
      </div>
    </div>
  );
};
