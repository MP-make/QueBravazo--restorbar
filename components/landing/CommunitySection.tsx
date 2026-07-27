"use client";
import Link from 'next/link';
import { Product } from '@/types';
import { useHomepageContent } from '@/lib/hooks/useHomepageContent';

const COMBO_KEYWORDS = ['combo', 'promo', 'oferta', 'happy hour', '2x1'];

function isCombo(p: Product) {
  const cat = (p.category || '').toLowerCase();
  const title = (p.title || '').toLowerCase();
  return COMBO_KEYWORDS.some(kw => cat.includes(kw) || title.includes(kw));
}

const EMOJIS = ['🍔', '🍗', '🥤', '🔥', '🍺', '🌮'];

interface Props {
  products: Product[];
}

export default function CommunitySection({ products }: Props) {
  const content = useHomepageContent();
  const combos = products.filter(isCombo).slice(0, 6);
  return (
    <section className="w-full bg-black">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Instagram block */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <svg className="w-4 h-4 text-[#ff5722]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <span className="text-white text-xs font-bold tracking-wider">{content.community_handle}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest leading-[1.1] mb-4">
              {content.community_title}
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-6 max-w-sm">
              {content.community_description}
            </p>
            <Link
              href="https://www.instagram.com/quebravazorestobar?igsh=dGF6Znd3anJjNDk0"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-bold rounded-xl transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              Seguir en Instagram
            </Link>
          </div>

          {/* Right: Reels gallery */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {combos.map((combo, i) => (
              <div key={combo.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-[#1e1e20] border border-white/5 group cursor-pointer">
                <div className="absolute inset-0">
                  <img
                    src={combo.image}
                    alt={combo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-4xl mb-2">{EMOJIS[i % EMOJIS.length]}</span>
                  <p className="text-white font-bold text-xs leading-tight mb-1">{combo.title}</p>
                  <p className="text-stone-400 text-[10px]">S/ {combo.price.toFixed(2)}</p>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">REEL</span>
                </div>
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16" fill="black"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
