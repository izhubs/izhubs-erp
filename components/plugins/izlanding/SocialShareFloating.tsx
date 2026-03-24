'use client';

import { useState, useEffect } from 'react';
import { Facebook, Linkedin, Link2, X } from 'lucide-react';

export default function SocialShareFloating() {
  const [url, setUrl] = useState('');
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[9000] flex flex-col items-start">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-3 rounded-r-xl shadow-lg border border-l-0 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Chia sẻ trang này"
      >
        <div className="flex flex-col items-center gap-1">
           <div className="flex flex-col items-center mb-2 mt-1">
             {'SHARE'.split('').map((char, i) => (
               <span key={i} className="text-[10px] font-black leading-none text-slate-400">{char}</span>
             ))}
           </div>
           {isOpen ? <X className="w-5 h-5 text-rose-500" /> : <Link2 className="w-5 h-5" />}
        </div>
      </button>

      {/* Trailing buttons */}
      <div className={`
        absolute left-14 flex flex-col gap-3 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50
        transition-all duration-300 ease-in-out origin-left
        ${isOpen ? 'scale-100 opacity-100 translate-x-0' : 'scale-0 opacity-0 -translate-x-10 pointer-events-none'}
      `}>
        <button onClick={shareFacebook} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md group" title="Share on Facebook">
          <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <button onClick={shareLinkedIn} className="p-3 bg-sky-700 text-white rounded-full hover:bg-sky-800 transition-colors shadow-md group" title="Share on LinkedIn">
          <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <button onClick={copyLink} className="p-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-md relative group" title="Copy Link">
          <Link2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {copied && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded shadow-sm whitespace-nowrap">
              Đã chép!
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
