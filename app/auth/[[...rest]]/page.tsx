'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md">
        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-6 p-1 bg-black/40 rounded-lg border border-purple-500/30">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-purple-600 text-white neon-border'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-purple-600 text-white neon-border'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={mode}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-center mb-8 glitch-text neon-glow"
            data-text={mode === 'signin' ? 'Welcome Back' : 'Join HABITUATE'}
          >
            {mode === 'signin' ? 'Welcome Back' : 'Join HABITUATE'}
          </motion.h1>
        </AnimatePresence>

        {/* Auth Component */}
        <div className="neon-border rounded-lg p-1">
          <AnimatePresence mode="wait">
            {mode === 'signin' ? (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <SignIn 
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: 'mx-auto',
                      card: 'bg-black/80 backdrop-blur-sm border border-purple-500/30',
                      headerTitle: 'text-white',
                      headerSubtitle: 'text-gray-400',
                      socialButtonsBlockButton: 'border border-purple-500/50 hover:bg-purple-500/20 text-white',
                      socialButtonsBlockButtonText: 'text-white',
                      formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
                      footerActionLink: 'text-purple-400 hover:text-purple-300',
                      formFieldLabel: 'text-white',
                      formFieldInput: 'bg-gray-900/60 border border-purple-500/50 text-white shadow-lg shadow-purple-500/20',
                      identityPreviewText: 'text-white',
                      formFieldInputShowPasswordButton: 'text-white',
                      otpCodeFieldInput: 'text-white border-purple-500/30 bg-gray-900/60',
                      formHeaderTitle: 'text-white',
                      formHeaderSubtitle: 'text-gray-400',
                      dividerText: 'text-gray-400',
                      dividerLine: 'bg-purple-500/30',
                      footer: 'text-white',
                      footerActionText: 'text-gray-400',
                      identityPreviewEditButton: 'text-purple-400',
                      formFieldAction: 'text-purple-400',
                      formFieldSuccessText: 'text-green-400',
                      formFieldErrorText: 'text-red-400',
                      formFieldWarningText: 'text-yellow-400',
                      formFieldHintText: 'text-gray-400',
                      formFieldInfoText: 'text-gray-400',
                      alertText: 'text-white',
                    }
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SignUp 
                  routing="hash"
                  appearance={{
                    elements: {
                      rootBox: 'mx-auto',
                      card: 'bg-black/80 backdrop-blur-sm border border-purple-500/30',
                      headerTitle: 'text-white',
                      headerSubtitle: 'text-gray-400',
                      socialButtonsBlockButton: 'border border-purple-500/50 hover:bg-purple-500/20 text-white',
                      socialButtonsBlockButtonText: 'text-white',
                      formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
                      footerActionLink: 'text-purple-400 hover:text-purple-300',
                      formFieldLabel: 'text-white',
                      formFieldInput: 'bg-gray-900/60 border border-purple-500/50 text-white shadow-lg shadow-purple-500/20',
                      identityPreviewText: 'text-white',
                      formFieldInputShowPasswordButton: 'text-white',
                      otpCodeFieldInput: 'text-white border-purple-500/30 bg-gray-900/60',
                      formHeaderTitle: 'text-white',
                      formHeaderSubtitle: 'text-gray-400',
                      dividerText: 'text-gray-400',
                      dividerLine: 'bg-purple-500/30',
                      footer: 'text-white',
                      footerActionText: 'text-gray-400',
                      identityPreviewEditButton: 'text-purple-400',
                      formFieldAction: 'text-purple-400',
                      formFieldSuccessText: 'text-green-400',
                      formFieldErrorText: 'text-red-400',
                      formFieldWarningText: 'text-yellow-400',
                      formFieldHintText: 'text-gray-400',
                      formFieldInfoText: 'text-gray-400',
                      alertText: 'text-white',
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
