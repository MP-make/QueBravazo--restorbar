"use client";
import { useHomepageContent } from '@/lib/hooks/useHomepageContent';

const PLATFORM_CONFIG: Record<string, { label: string; color: string; icon: string; gradient: string; svg: React.ReactNode }> = {
  instagram: {
    label: "Instagram", color: "from-purple-600 to-pink-600", icon: "📸", gradient: "from-purple-600/20 to-pink-600/10",
    svg: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
  },
  facebook: {
    label: "Facebook", color: "from-blue-600 to-blue-800", icon: "👍", gradient: "from-blue-600/20 to-blue-800/10",
    svg: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  },
  tiktok: {
    label: "TikTok", color: "from-cyan-500 to-slate-700", icon: "🎵", gradient: "from-cyan-600/20 to-slate-800/10",
    svg: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>,
  },
  other: { label: "Red social", color: "from-stone-500 to-stone-700", icon: "🔗", gradient: "from-stone-600/20 to-stone-800/10", svg: null },
};

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

export default function CommunitySection() {
  const content = useHomepageContent();
  const links = content.community_links || [];
  const followPlatform = PLATFORM_CONFIG[content.community_follow_platform] || PLATFORM_CONFIG.instagram;
  const followUrl = content.community_follow_url || `https://www.instagram.com/${content.community_handle.replace("@", "")}`;

  return (
    <section className="w-full bg-black">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Community info */}
          <div className="lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              {followPlatform.svg || <span className="text-[#ff5722] text-sm">{followPlatform.icon}</span>}
              <span className="text-white text-xs font-bold tracking-wider">{content.community_handle}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest leading-[1.1] mb-4">
              {content.community_title}
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-6 max-w-sm">
              {content.community_description}
            </p>
            <a
              href={followUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-bold rounded-xl transition-all"
            >
              {followPlatform.svg || <span>{followPlatform.icon}</span>}
              Seguir en {followPlatform.label}
            </a>
          </div>

          {/* Right: Social media cards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {links.length === 0 ? (
              <div className="col-span-full text-center py-12 text-stone-600 text-sm">
                No hay publicaciones disponibles
              </div>
            ) : (
              links.map((link, i) => {
                const platform = PLATFORM_CONFIG[link.platform] || PLATFORM_CONFIG.other;
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-[#1e1e20] border border-white/5 hover:border-white/20 transition-all block"
                  >
                    {/* Background thumbnail or gradient */}
                    {link.thumbnail_url ? (
                      <div className="absolute inset-0">
                        <img
                          src={link.thumbnail_url}
                          alt={link.title || "Publicación"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
                      </div>
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient}`}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <span className="text-7xl">{platform.icon}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                      {link.title && (
                        <p className="text-white font-bold text-xs leading-tight mb-2 line-clamp-2 drop-shadow-lg">
                          {link.title}
                        </p>
                      )}
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${platform.color} shadow-lg`}>
                        <span className="text-[10px]">{platform.icon}</span>
                        <span className="text-white text-[9px] font-bold uppercase tracking-wider">{platform.label}</span>
                      </div>
                    </div>

                    {/* Platform badge */}
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {getDomain(link.url).toUpperCase()}
                      </span>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
