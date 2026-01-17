'use client';

import { useEffect, useState } from 'react';

interface DiagnosticInfo {
  browser: string;
  crossOriginIsolated: boolean;
  sharedArrayBufferAvailable: boolean;
  secureContext: boolean;
}

/**
 * Diagnostic component to debug FFmpeg/SharedArrayBuffer issues
 * Only renders in development or when explicitly enabled
 */
export function FFmpegDiagnostics({ show = false }: { show?: boolean }) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo | null>(null);

  useEffect(() => {
    // Detect browser
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';

    // Check SharedArrayBuffer
    let sharedArrayBufferAvailable = false;
    try {
      new SharedArrayBuffer(1);
      sharedArrayBufferAvailable = true;
    } catch (e) {
      sharedArrayBufferAvailable = false;
    }

    setDiagnostics({
      browser,
      crossOriginIsolated: (window as any).crossOriginIsolated === true,
      sharedArrayBufferAvailable,
      secureContext: window.isSecureContext,
    });
  }, []);

  // Only show in dev mode or when explicitly requested
  if (process.env.NODE_ENV !== 'development' && !show) {
    return null;
  }

  if (!diagnostics) return null;

  const allGood =
    diagnostics.crossOriginIsolated &&
    diagnostics.sharedArrayBufferAvailable &&
    diagnostics.secureContext;

  return (
    <div className={`
      fixed bottom-4 right-4 p-4 rounded-lg text-xs font-mono z-50
      ${allGood ? 'bg-green-900/90' : 'bg-red-900/90'} text-white
    `}>
      <div className="font-bold mb-2">FFmpeg Diagnostics</div>
      <div>Browser: {diagnostics.browser}</div>
      <div className={diagnostics.secureContext ? 'text-green-400' : 'text-red-400'}>
        Secure Context: {diagnostics.secureContext ? '✓' : '✗'}
      </div>
      <div className={diagnostics.crossOriginIsolated ? 'text-green-400' : 'text-red-400'}>
        Cross-Origin Isolated: {diagnostics.crossOriginIsolated ? '✓' : '✗'}
      </div>
      <div className={diagnostics.sharedArrayBufferAvailable ? 'text-green-400' : 'text-red-400'}>
        SharedArrayBuffer: {diagnostics.sharedArrayBufferAvailable ? '✓' : '✗'}
      </div>

      {!diagnostics.crossOriginIsolated && (
        <div className="mt-2 text-yellow-300 text-[10px]">
          Missing COOP/COEP headers!<br />
          Check next.config.js
        </div>
      )}
    </div>
  );
}

export default FFmpegDiagnostics;