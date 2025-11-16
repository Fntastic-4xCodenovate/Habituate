'use client';

import { X, AlertCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export function DatabaseMigrationBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600/90 backdrop-blur-sm border-b border-red-500">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle size={24} className="text-white flex-shrink-0" />
            <div className="text-sm text-white">
              <strong className="font-semibold">Database Not Set Up!</strong>
              <span className="ml-2">
                You need to run the database migration in Supabase before using the app.
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 underline hover:text-red-100 inline-flex items-center gap-1"
              >
                Open Supabase Dashboard
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white hover:text-red-100 transition-colors p-1 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
