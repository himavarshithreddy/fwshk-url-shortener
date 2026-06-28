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
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [isOpen]);

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
    <div className="ad-modal-overlay">
      <div className="ad-modal-container">
        <div className="ad-modal-header">
          <span className="ad-modal-title">SYSTEM OVERRIDE: AD_REQUIRED</span>
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
