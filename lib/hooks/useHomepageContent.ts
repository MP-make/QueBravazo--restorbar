import { useState, useEffect } from 'react';

export interface CommunityLink {
  url: string;
  platform: "instagram" | "facebook" | "tiktok" | "other";
  title: string;
  thumbnail_url?: string;
}

export interface HomepageContent {
  hero_subtitle: string;
  hero_description: string;
  hero_video_desktop: string;
  hero_video_mobile: string;
  hero_video_desktop_criollo: string;
  hero_video_mobile_criollo: string;
  hero_video_desktop_rapida: string;
  hero_video_mobile_rapida: string;
  fuego_title: string;
  fuegio_subtitle: string;
  fuego_description: string;
  fuego_card_1_image: string;
  fuego_card_2_image: string;
  fuego_card_3_image: string;
  community_handle: string;
  community_title: string;
  community_description: string;
  community_links: CommunityLink[];
  community_follow_platform: string;
  community_follow_url: string;
  contact_handle: string;
  contact_description: string;
  contact_address: string;
  contact_whatsapp: string;
  contact_email: string;
  contact_hours: string[];
}

const DEFAULTS: HomepageContent = {
  hero_subtitle: 'Tus favoritos en un solo lugar',
  hero_description: 'Broaster, hamburguesas artesanales, alitas BBQ y la mejor barra de tragos del barrio.',
  hero_video_desktop: '/HAMBURGUESAS - HORIZONTAL.mp4',
  hero_video_mobile: '/HAMBURGUESAS - VERTICAL.mp4',
  hero_video_desktop_criollo: '',
  hero_video_mobile_criollo: '',
  hero_video_desktop_rapida: '',
  hero_video_mobile_rapida: '',
  fuego_title: '¿Por qué somos bravazos?',
  fuegio_subtitle: '',
  fuego_description: 'Hamburguesas 100% artesanales, alitas BBQ adictivas y la mejor barra de tragos de Pisco. Todo hecho con sazón peruana y el fuelle que solo un verdadero bravazo puede dar.',
  fuego_card_1_image: '',
  fuego_card_2_image: '',
  fuego_card_3_image: '',
  community_handle: '@quebravazorestobar',
  community_title: 'El muro de la comunidad',
  community_description: 'Mira cómo disfruta nuestra gente y comparte tu momento más bravazo.',
  community_links: [],
  community_follow_platform: 'instagram',
  community_follow_url: '',
  contact_handle: '@quebravazorestobar',
  contact_description: 'Visítanos en nuestro local o pide por delivery. ¡También puedes escribirnos al WhatsApp!',
  contact_address: 'Urb. Los Jardines de San Andrés, Pisco, Ica',
  contact_whatsapp: '+51 946 826 535',
  contact_email: 'quebravazorestobar@gmail.com',
  contact_hours: ['Lun – Sáb: 12pm – 11pm', 'Dom: 12pm – 9pm'],
};

let cached: HomepageContent | null = null;
let cachePromise: Promise<HomepageContent> | null = null;

async function fetchContent(): Promise<HomepageContent> {
  if (cached) return cached;
  if (cachePromise) return cachePromise;
  cachePromise = fetch('/api/admin/settings?key=homepage')
    .then(r => r.json())
    .then(json => {
      cached = { ...DEFAULTS, ...(json.value || {}) };
      return cached!;
    })
    .catch(() => {
      cached = DEFAULTS;
      return cached;
    });
  return cachePromise;
}

export function useHomepageContent(): HomepageContent {
  const [content, setContent] = useState<HomepageContent>(DEFAULTS);

  useEffect(() => {
    fetchContent().then(setContent);
  }, []);

  return content;
}
