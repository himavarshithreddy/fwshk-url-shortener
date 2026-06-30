import React, { useState, useEffect, useRef } from 'react';


export default function AdModal({ isOpen, onClose, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(10);
  const adRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(10);

      // Attempt to load the ad when modal opens
      try {
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch {
        // Ad blockers or unavailable AdSense scripts should not block custom-code flow.
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    let timer;
    if (isOpen && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  return (
    <div className="ad-modal-overlay" onMouseDown={onClose}>
      <div
        className="ad-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-code-ad-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="ad-modal-header">
          <span id="custom-code-ad-title" className="ad-modal-title">SYSTEM OVERRIDE: AD_REQUIRED</span>
          <button className="ad-modal-close" type="button" onClick={onClose} aria-label="Close ad dialog">
            &times;
          </button>
          <div className="ad-modal-scanlines" />
        </div>
        
        <div className="ad-modal-body">
          <p className="ad-modal-text">
            Custom codes require processing bandwidth. Support the network by viewing this transmission.
          </p>

          <div className="ad-slot-container" ref={adRef}>
            {/* Google AdSense Ad Unit */}
            <ins 
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: '250px', backgroundColor: '#111', border: '2px dashed #ff6600', padding: '2px' }}
              data-ad-client="ca-pub-9965145907448266"
              data-ad-slot="6464905370"
              data-ad-format="auto"
              data-full-width-responsive="true"
            ></ins>
          </div>

          <div className="ad-modal-footer">
            {timeLeft > 0 ? (
              <div className="ad-timer">
                <span className="ad-timer-label">TRANSMISSION COMPLETES IN:</span>
                <span className="ad-timer-value">00:{timeLeft.toString().padStart(2, '0')}</span>
              </div>
            ) : (
              <button 
                className="ad-continue-btn"
                onClick={() => {
                  onComplete();
                  onClose();
                }}
              >
                CONTINUE SEQUENCE <span className="arrow-icon">→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
