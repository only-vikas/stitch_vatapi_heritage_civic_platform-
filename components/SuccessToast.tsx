'use client';

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function SuccessToast({ message, type = 'success', visible, onClose, duration = 4000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, duration, onClose]);

  if (!visible && !show) return null;

  const bgColor = type === 'success'
    ? 'bg-[#00685f]'
    : type === 'error'
    ? 'bg-[#ba1a1a]'
    : 'bg-[#30312f]';

  const icon = type === 'success'
    ? 'check_circle'
    : type === 'error'
    ? 'error'
    : 'info';

  return (
    <div
      className={`fixed top-6 right-6 z-[100] max-w-sm transform transition-all duration-300 ease-out ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${bgColor} text-white rounded-xl shadow-2xl p-4 flex items-start gap-3 border border-white/10`}>
        <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug">{message}</p>
          <p className="text-xs text-white/70 mt-1">
            {type === 'success' ? 'Timestamped on Karnataka Open Heritage Node.' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShow(false); setTimeout(onClose, 300); }}
          className="shrink-0 text-white/50 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}
