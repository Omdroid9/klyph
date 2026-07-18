// Brand logo SVGs, kept compact and centered on a 24x24 viewBox.
// Use via <span class="brand-logo" data-logo="slack"></span>

export const logos = {
  // --- Everyday macOS apps for the hero dock (simplified, recognizable) ---
  finder: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="24" height="24" rx="5.5" fill="#ffffff"/>
      <path d="M12.6 0H18.5A5.5 5.5 0 0 1 24 5.5v13a5.5 5.5 0 0 1-5.5 5.5h-5.9c-1.3-2.5-2-5.3-2-8.2 0-1 .08-2 .24-2.9H8.6a.8.8 0 0 1 0-1.6h2.6C11.6 7.5 12 3.6 12.6 0z" fill="#36a4f4"/>
      <path d="M6.5 7.2v2.2M17.5 7.2v2.2" stroke="#12385c" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M5.5 15.5c2 1.8 4.2 2.7 6.5 2.7s4.5-.9 6.5-2.7" stroke="#12385c" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>
  `,

  safari: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="24" height="24" rx="5.5" fill="#ffffff"/>
      <circle cx="12" cy="12" r="9.2" fill="#3fa9f5"/>
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="#2b86d6" stroke-width="0.5"/>
      <path d="M17.8 6.2 10.4 10.4 6.2 17.8l7.4-4.2z" fill="#ffffff"/>
      <path d="M17.8 6.2 13.6 13.6l-3.2-3.2z" fill="#ff5150"/>
    </svg>
  `,

  messages: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="msg-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6bf17d"/>
          <stop offset="100%" stop-color="#26c62f"/>
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5.5" fill="url(#msg-g)"/>
      <path d="M12 5.4c-4.2 0-7.6 2.8-7.6 6.3 0 2 1.1 3.7 2.9 4.9-.1.9-.5 1.7-1.2 2.4 1.2-.1 2.3-.5 3.2-1.1.9.3 1.8.4 2.7.4 4.2 0 7.6-2.8 7.6-6.6S16.2 5.4 12 5.4z" fill="#ffffff"/>
    </svg>
  `,

  mail: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="mail-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#63b0f8"/>
          <stop offset="100%" stop-color="#1d6ef2"/>
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5.5" fill="url(#mail-g)"/>
      <rect x="4" y="7" width="16" height="10.5" rx="1.6" fill="#ffffff"/>
      <path d="m4.6 7.8 7.4 5.6 7.4-5.6" fill="none" stroke="#9fc2ef" stroke-width="1.1" stroke-linejoin="round"/>
    </svg>
  `,

  photos: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="24" height="24" rx="5.5" fill="#ffffff"/>
      <g transform="translate(12 12)">
        <ellipse rx="2" ry="4.4" cy="-4.4" fill="#f6c445" opacity="0.9"/>
        <ellipse rx="2" ry="4.4" cy="-4.4" fill="#ef8c33" opacity="0.9" transform="rotate(45)"/>
        <ellipse rx="2" ry="4.4" cy="-4.4" fill="#e4544f" opacity="0.9" transform="rotate(90)"/>
        <ellipse rx="2" ry="4.4" cy="-4.4" fill="#d2418f" opacity="0.9" transform="rotate(135)"/>
        <ellipse rx="2" ry="4.4" cy="-4.4" fill="#8e5bc0" opacity="0.9" transform="rotate(180)"/>
        <ellipse rx="2" ry="4.4" cy="-4.4" fill="#3a7de0" opacity="0.9" transform="rotate(225)"/>
        <ellipse rx="2" ry="4.4" cy="-4.4" fill="#3fb6ba" opacity="0.9" transform="rotate(270)"/>
        <ellipse rx="2" ry="4.4" cy="-4.4" fill="#71bf4b" opacity="0.9" transform="rotate(315)"/>
      </g>
    </svg>
  `,

  music: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="mus-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fb5c74"/>
          <stop offset="100%" stop-color="#fa233b"/>
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5.5" fill="url(#mus-g)"/>
      <path d="M16.8 5.2 9.9 6.7v7.7a2.6 2.6 0 1 0 1.4 2.3V9.6l4.1-.9v4a2.6 2.6 0 1 0 1.4 2.3z" fill="#ffffff"/>
    </svg>
  `,

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

  // Official Google Calendar icon (2020), multicolor.
  gcal: `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g>
	<g transform="translate(3.75 3.75)">
		<path fill="#FFFFFF" d="M148.882,43.618l-47.368-5.263l-57.895,5.263L38.355,96.25l5.263,52.632l52.632,6.579l52.632-6.579
			l5.263-53.947L148.882,43.618z"/>
		<path fill="#1A73E8" d="M65.211,125.276c-3.934-2.658-6.658-6.539-8.145-11.671l9.132-3.763c0.829,3.158,2.276,5.605,4.342,7.342
			c2.053,1.737,4.553,2.592,7.474,2.592c2.987,0,5.553-0.908,7.697-2.724s3.224-4.132,3.224-6.934c0-2.868-1.132-5.211-3.395-7.026
			s-5.105-2.724-8.5-2.724h-5.276v-9.039H76.5c2.921,0,5.382-0.789,7.382-2.368c2-1.579,3-3.737,3-6.487
			c0-2.447-0.895-4.395-2.684-5.855s-4.053-2.197-6.803-2.197c-2.684,0-4.816,0.711-6.395,2.145s-2.724,3.197-3.447,5.276
			l-9.039-3.763c1.197-3.395,3.395-6.395,6.618-8.987c3.224-2.592,7.342-3.895,12.342-3.895c3.697,0,7.026,0.711,9.974,2.145
			c2.947,1.434,5.263,3.421,6.934,5.947c1.671,2.539,2.5,5.382,2.5,8.539c0,3.224-0.776,5.947-2.329,8.184
			c-1.553,2.237-3.461,3.947-5.724,5.145v0.539c2.987,1.25,5.421,3.158,7.342,5.724c1.908,2.566,2.868,5.632,2.868,9.211
			s-0.908,6.776-2.724,9.579c-1.816,2.803-4.329,5.013-7.513,6.618c-3.197,1.605-6.789,2.421-10.776,2.421
			C73.408,129.263,69.145,127.934,65.211,125.276z"/>
		<path fill="#1A73E8" d="M121.25,79.961l-9.974,7.25l-5.013-7.605l17.987-12.974h6.895v61.197h-9.895L121.25,79.961z"/>
		<path fill="#EA4335" d="M148.882,196.25l47.368-47.368l-23.684-10.526l-23.684,10.526l-10.526,23.684L148.882,196.25z"/>
		<path fill="#34A853" d="M33.092,172.566l10.526,23.684h105.263v-47.368H43.618L33.092,172.566z"/>
		<path fill="#4285F4" d="M12.039-3.75C3.316-3.75-3.75,3.316-3.75,12.039v136.842l23.684,10.526l23.684-10.526V43.618h105.263
			l10.526-23.684L148.882-3.75H12.039z"/>
		<path fill="#188038" d="M-3.75,148.882v31.579c0,8.724,7.066,15.789,15.789,15.789h31.579v-47.368H-3.75z"/>
		<path fill="#FBBC04" d="M148.882,43.618v105.263h47.368V43.618l-23.684-10.526L148.882,43.618z"/>
		<path fill="#1967D2" d="M196.25,43.618V12.039c0-8.724-7.066-15.789-15.789-15.789h-31.579v47.368H196.25z"/>
	</g>
</g>
    </svg>
  `,

  // Discord's Clyde mark (Simple Icons path) on the official blurple tile.
  discord: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="24" height="24" rx="5.5" fill="#5865F2"/>
      <g transform="translate(3.6 3.6) scale(0.7)">
        <path fill="#ffffff" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
      </g>
    </svg>
  `,

  // Official Google Tasks icon (2021), two-tone blue.
  gtasks: `
    <svg viewBox="0 0 527.1 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g>
	<polygon fill="#0066DA" points="410.4,58.3 368.8,81.2 348.2,120.6 368.8,168.8 407.8,211 450,187.5 475.9,142.8 450,87.5 	"/>
	<path fill="#2684FC" d="M249.3,219.4l98.9-98.9c29.1,22.1,50.5,53.8,59.6,90.4L272.1,346.7c-12.2,12.2-32,12.2-44.2,0l-91.5-91.5
		c-9.8-9.8-9.8-25.6,0-35.3l39-39c9.8-9.8,25.6-9.8,35.3,0L249.3,219.4z M519.8,63.6l-39.7-39.7c-9.7-9.7-25.6-9.7-35.3,0
		l-34.4,34.4c27.5,23,49.9,51.8,65.5,84.5l43.9-43.9C529.6,89.2,529.6,73.3,519.8,63.6z M412.5,250c0,89.8-72.8,162.5-162.5,162.5
		S87.5,339.8,87.5,250S160.2,87.5,250,87.5c36.9,0,70.9,12.3,98.2,33.1l62.2-62.2C367,21.9,311.1,0,250,0C111.9,0,0,111.9,0,250
		s111.9,250,250,250s250-111.9,250-250c0-38.3-8.7-74.7-24.1-107.2L407.8,211C410.8,223.5,412.5,236.6,412.5,250z"/>
</g>
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

  // Chute's own "On Device" mark — the orb itself. The product is the
  // destination, so it wears its own face beside the brand logos.
  local: `<img src="/chute-sphere.svg" alt="" style="width:100%;height:100%;display:block" />`,
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
