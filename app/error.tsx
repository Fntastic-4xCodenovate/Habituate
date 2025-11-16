'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="p-8 rounded-lg border border-red-500/30 bg-black/40 backdrop-blur-sm">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-3xl font-bold mb-2 text-red-500">Something went wrong!</h2>
          <p className="text-gray-400 mb-6">
            {error.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors neon-border"
          >
            Try again
          </button>
        </div>
      </motion.div>
    </div>
  );
}
