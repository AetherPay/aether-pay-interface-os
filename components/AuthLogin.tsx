
import React, { useState, useEffect } from 'react';
import { Activity, Lock, Smartphone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthLoginProps {
  onAuthenticated: () => void;
}

const AuthLogin: React.FC<AuthLoginProps> = ({ onAuthenticated }) => {
  const [stage, setStage] = useState<'LOGIN' | 'MFA' | 'SUCCESS'>('LOGIN');
  const [email, setEmail] = useState('admin@aetherpay.io');
  const [password, setPassword] = useState('password');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        setIsLoading(false);
        setStage('MFA');
      } else {
        setIsLoading(false);
        setError('Invalid credentials');
      }
    }, 800);
  };

  const handleMfa = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      if (otp.join('').length === 6) {
        setIsLoading(false);
        setStage('SUCCESS');
        setTimeout(() => {
          onAuthenticated();
        }, 1000);
      } else {
        setIsLoading(false);
        setError('Invalid OTP code');
      }
    }, 800);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Decorative Top Bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse"></div>

        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
               <Activity className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
            {stage === 'LOGIN' ? 'Super Admin Portal' : 'Security Verification'}
          </h2>
          <p className="text-center text-slate-500 mb-8 text-sm">
            {stage === 'LOGIN' 
              ? 'Enter your secure credentials to access the control tower.' 
              : 'Enter the 6-digit code sent to your secure device.'}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {stage === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Email Identity</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="admin@aetherpay.io"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pl-10"
                    placeholder="••••••••••••"
                  />
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center shadow-lg shadow-indigo-200"
              >
                {isLoading ? (
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {stage === 'MFA' && (
            <form onSubmit={handleMfa} className="space-y-6">
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                ))}
              </div>
              <div className="flex items-center justify-center text-sm text-slate-500">
                <Smartphone className="h-4 w-4 mr-2" />
                Code sent to •••• •••• 8832
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center shadow-lg shadow-indigo-200"
              >
                 {isLoading ? (
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Verify Identity <ShieldCheck className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => setStage('LOGIN')}
                className="w-full text-sm text-slate-500 hover:text-slate-700"
              >
                Back to Login
              </button>
            </form>
          )}

          {stage === 'SUCCESS' && (
            <div className="text-center py-8">
               <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="h-10 w-10 text-green-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900">Access Granted</h3>
               <p className="text-slate-500 mt-2">Redirecting to cockpit...</p>
            </div>
          )}
        </div>
        
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Protected by AetherPay Sentinel. All IP addresses are logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
