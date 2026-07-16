// Brand logo SVGs, kept compact and centered on a 24x24 viewBox.
// Use via <span class="brand-logo" data-logo="slack"></span>

export const logos = {
  slack: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5.04 15.16a2.52 2.52 0 1 1-2.52-2.52h2.52v2.52z" fill="#E01E5A"/>
      <path d="M6.31 15.16a2.52 2.52 0 1 1 5.04 0v6.32a2.52 2.52 0 1 1-5.04 0v-6.32z" fill="#E01E5A"/>
      <path d="M8.84 5.04a2.52 2.52 0 1 1 2.52-2.52v2.52H8.84z" fill="#36C5F0"/>
      <path d="M8.84 6.31a2.52 2.52 0 1 1 0 5.04H2.52a2.52 2.52 0 1 1 0-5.04h6.32z" fill="#36C5F0"/>
      <path d="M18.96 8.84a2.52 2.52 0 1 1 2.52 2.52h-2.52V8.84z" fill="#2EB67D"/>
      <path d="M17.69 8.84a2.52 2.52 0 1 1-5.04 0V2.52a2.52 2.52 0 1 1 5.04 0v6.32z" fill="#2EB67D"/>
      <path d="M15.16 18.96a2.52 2.52 0 1 1-2.52 2.52v-2.52h2.52z" fill="#ECB22E"/>
      <path d="M15.16 17.69a2.52 2.52 0 1 1 0-5.04h6.32a2.52 2.52 0 1 1 0 5.04h-6.32z" fill="#ECB22E"/>
    </svg>
  `,

  // Notion's actual logo mark (Simple Icons path), set black on the white
  // rounded tile people recognize from the app icon.
  notion: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#ffffff"/>
      <g transform="translate(3.1 3.1) scale(0.742)">
        <path fill="#000000" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
      </g>
    </svg>
  `,

  gcal: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.2" fill="#ffffff"/>
      <rect x="3" y="5" width="18" height="3.6" rx="2.2" fill="#4285F4"/>
      <rect x="6" y="3.4" width="1.8" height="3.4" rx="0.6" fill="#3367D6"/>
      <rect x="16.2" y="3.4" width="1.8" height="3.4" rx="0.6" fill="#3367D6"/>
      <text x="12" y="17.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="7.5" font-weight="700" fill="#4285F4">31</text>
    </svg>
  `,

  discord: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="24" height="24" rx="5.5" fill="#5865F2"/>
      <path d="M17.6 7.6a12 12 0 0 0-3-1l-.2.3a11 11 0 0 0-4.8 0l-.2-.3a12 12 0 0 0-3 1c-1.9 2.9-2.4 5.7-2.2 8.5 1.2.9 2.4 1.5 3.6 1.8.3-.4.5-.8.7-1.2-.4-.2-.8-.3-1.2-.6l.3-.2a8.7 8.7 0 0 0 7.4 0l.3.2c-.4.2-.8.4-1.2.6.2.4.4.8.7 1.2 1.2-.3 2.4-.9 3.6-1.8.2-3.3-.6-6.1-1.8-8.5zM9.6 14.6c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5c0 .8-.6 1.5-1.3 1.5zm4.8 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5c0 .8-.6 1.5-1.3 1.5z" fill="#ffffff"/>
    </svg>
  `,

  gtasks: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1A73E8"/>
      <path d="M6.8 12.4l3.2 3.2 7.2-7.2" stroke="#ffffff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  notes: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3.5" fill="#ffffff"/>
      <path d="M3 6.5C3 4.6 4.6 3 6.5 3h11C19.4 3 21 4.6 21 6.5V8H3V6.5z" fill="#FBC02D"/>
      <path d="M7 12h10M7 14.8h10M7 17.6h6.5" stroke="#9aa0a6" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
  `,

  google: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22 12.2c0-.8-.1-1.4-.2-2H12v3.8h5.6c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.9 3.1-4.6 3.1-7.5z" fill="#4285F4"/>
      <path d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.2H2.7v2.6A10 10 0 0 0 12 22z" fill="#34A853"/>
      <path d="M6.2 13.7A6 6 0 0 1 5.9 12c0-.6.1-1.2.3-1.7V7.7H2.7A10 10 0 0 0 2 12c0 1.6.4 3.1 1 4.3l3.2-2.6z" fill="#FBBC05"/>
      <path d="M12 5.8c1.5 0 2.9.5 4 1.5l3-3A10 10 0 0 0 12 2 10 10 0 0 0 2.7 7.7l3.5 2.6C7 7.6 9.3 5.8 12 5.8z" fill="#EA4335"/>
    </svg>
  `,

  reminders: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3.5" fill="#ffffff"/>
      <path d="M3 6.5C3 4.6 4.6 3 6.5 3h11C19.4 3 21 4.6 21 6.5V8H3V6.5z" fill="#FF9500"/>
      <circle cx="7.5" cy="11.8" r="1.35" fill="none" stroke="#FF3B30" stroke-width="1.3"/>
      <path d="M6.9 11.8l.95.9 1.7-1.8" stroke="#FF3B30" stroke-width="1.05" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="10.5" y="11.3" width="7" height="1" rx="0.5" fill="#9aa0a6"/>
      <circle cx="7.5" cy="15.5" r="1.35" fill="none" stroke="#c7c7cc" stroke-width="1.3"/>
      <rect x="10.5" y="15" width="5.5" height="1" rx="0.5" fill="#c7c7cc"/>
      <circle cx="7.5" cy="19" r="1.35" fill="none" stroke="#c7c7cc" stroke-width="1.3"/>
      <rect x="10.5" y="18.5" width="6.5" height="1" rx="0.5" fill="#c7c7cc"/>
    </svg>
  `,

  // Klyph's own "On Device" mark — the orb itself. The product is the
  // destination, so it wears its own face beside the brand logos.
  local: `<img src="/klyph-sphere.svg" alt="" style="width:100%;height:100%;display:block" />`,
};

export function injectLogos(root = document) {
  root.querySelectorAll("[data-logo]").forEach((el) => {
    const name = el.dataset.logo;
    const svg = logos[name];
    if (svg && !el.dataset.logoInjected) {
      el.innerHTML = svg;
      el.dataset.logoInjected = "true";
    }
  });
}
