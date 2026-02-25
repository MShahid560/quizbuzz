// src/hooks/useSEO.js
import { useEffect } from 'react';

export default function useSEO({ title, description, image, url, type = 'website', structuredData }) {
  useEffect(() => {
    const siteName = 'Quiz Buzz 🐝';
    const defaultDesc = 'Play free quiz games, mini-games, kids games and arcade games. Challenge friends, earn XP and climb the leaderboard!';
    const defaultImage = 'https://quizbuzz.app/og-image.png';

    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const finalDesc = description || defaultDesc;
    const finalImage = image || defaultImage;
    const finalUrl = url || window.location.href;

    // Basic meta
    document.title = fullTitle;
    setMeta('description', finalDesc);
    setMeta('keywords', 'quiz game, trivia, brain games, kids games, arcade, free games, leaderboard');

    // Open Graph (WhatsApp, Facebook)
    setOG('og:title', fullTitle);
    setOG('og:description', finalDesc);
    setOG('og:image', finalImage);
    setOG('og:url', finalUrl);
    setOG('og:type', type);
    setOG('og:site_name', siteName);

    // Twitter Card
    setOG('twitter:card', 'summary_large_image');
    setOG('twitter:title', fullTitle);
    setOG('twitter:description', finalDesc);
    setOG('twitter:image', finalImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = finalUrl;

    // Structured data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('#structured-data');
      if (!script) {
        script = document.createElement('script');
        script.id = 'structured-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    return () => {
      // Cleanup structured data on unmount
      const script = document.querySelector('#structured-data');
      if (script) script.remove();
    };
  }, [title, description, image, url, type, structuredData]);
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setOG(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}