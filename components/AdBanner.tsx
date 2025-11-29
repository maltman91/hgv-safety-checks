import React, { useEffect } from 'react';

interface AdBannerProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotId = "1234567890", format = "auto" }) => {
  
  // Initialize AdSense when component mounts
  useEffect(() => {
    try {
      // Uncomment this line when you have a real AdSense account and the <ins> tag below is active
      // (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      // (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  return (
    <div className="w-full my-4 flex justify-center items-center overflow-hidden no-print">
      
      {/* --- PLACEHOLDER FOR DEVELOPMENT (Remove when live) --- */}
      <div className="w-full bg-slate-100 border border-slate-200 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Advertisement</span>
        <div className="w-full h-12 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
          Google AdSense Banner
        </div>
      </div>
      
      {/* --- REAL ADSENSE CODE (Uncomment when live) --- 
      <ins className="adsbygoogle"
           style={{ display: 'block', width: '100%' }}
           data-ad-client="ca-pub-0000000000000000" // Replace with your Publisher ID
           data-ad-slot={slotId}
           data-ad-format={format}
           data-full-width-responsive="true"></ins>
      */}
      
    </div>
  );
};