# Fuison Commerce

An original bilingual (Bangla/English) marketing site for a Bangladeshi commerce platform, with an interactive browser-scoped merchant demo. Bangla is the default; a persisted language switch works across routes.

## Brand and scope
- Exact brand spelling: Fuison Commerce.
- Primary blue: #0968F5.
- Approved source logo is preserved in source-assets/fuison-logo.png; the navigation uses its same raster mark in an optimized, content-hashed WebP.
- SHOPLINE and Big Cartel inform the overall clarity and simplicity. No reference source code, proprietary imagery or page copy was reused.
- Illustrative product photos come from Unsplash; they depict demo merchandise, not actual inventory.

## Current routes
- / — Spacious, scrolling homepage with an original storefront composition, benefits, a service constellation, product/order and brand design explanations, store directions and planned setup journey. The dedicated Bangladesh identity section is omitted from the homepage.
- /features — Service descriptions and explicit preview/development status.
- /designs — Three editable design previews with business name, color, desktop/mobile view and collection browsing.
- /how-it-works — Planned setup journey.
- /faq — Separate bilingual accordion page; FAQ links navigate here rather than scrolling the homepage.
- /signup and /login — Google/email entry options, five-digit email verification and store setup. Google remains explicitly unavailable: no supported external identity-provider capability has been configured in Sites. Email delivery requires RESEND_API_KEY and VERIFICATION_FROM_EMAIL runtime configuration.
- /dashboard — Native-platform-identity-protected workspace for a provisioned store. It is separate from /demo.
- /s/[slug] — Store identity page backed by D1 with an R2 logo; starts with an empty catalog. The Site remains private, so the platform audience still controls access to these pages.
- /demo — Products, sample orders, store identity and overview. State is local to the visitor's browser, under fuison-demo-v1. No merchant signup, live stores, checkout, payments, staff accounts, analytics or custom domains are claimed as operational.

Create Free Store navigates to /signup; Login navigates to /login. A setup preview lets the owner review the form while integrations are pending, with store creation disabled. Language is saved under fuison-language. Marketing subdomains remain illustrative; actual provisioned store URLs use /s/[slug]. The approved logo, blue and page designs are retained.

## Google login
The UI explicitly labels Google sign-in as not active and does not collect Google credentials. Google Cloud Console returned Site Unavailable during earlier attempted setup. Do not treat the Google button as authentication.

Before merchant registration launches, select an authentication-capable production hosting environment, create the owner's Google OAuth application, configure the authorized production origin/redirect URI, implement server-verified identity and tenant authorization, and connect durable merchant storage. Preserve the dispatch-owned Sites identity boundary for the private preview; do not replace it with a second OAuth/session stack inside this Site.

## Email verification and persistence
The private preview retains Sites-owned sign-in. Five-digit email verification is an additional contact-email check bound to the authenticated platform user and their account email; it is not an independent passwordless session system. The application cannot become public Google/email-only merchant authentication simply by adding email credentials.

Set RESEND_API_KEY as a runtime secret and VERIFICATION_FROM_EMAIL to a verified sending address through Sites environment settings, then redeploy. Neither value is currently configured. Missing configuration returns an explicit error without issuing a challenge or claiming an email was sent.

Codes expire after ten minutes; five verification attempts, a sixty-second send cooldown and five send requests per hour are enforced in D1. Codes are HMAC-hashed with the server-side delivery key, never returned in API responses. Verification grants expire after twenty minutes and are bound to the platform identity, purpose and challenge. Store creation consumes the grant and reserves both the owner and slug through unique database constraints in a transaction. R2 logo uploads require the grant, image signatures and PNG/JPG/WebP MIME checks, and a 2 MB limit. No passwords, independent OAuth routes or merchant session cookies are introduced.

Store identity (verified email, owner name, business name, slug and logo key) is saved in D1 and the logo in R2 only after successful verification. No real store or email was created/sent during validation. Checkout, products published to a real store, customer orders, custom domains and merchant-only public authentication are still pending.

## Development
Use the supplied Sites installation and build helpers. Run TypeScript validation with node node_modules/typescript/bin/tsc --noEmit.

Run node tests/merchant-flow.mjs for integration checks with an in-memory SQLite database, mock R2 and mock delivery; it sends no real emails. Test-generated modules stay under ignored work/merchant-tests.

## Load performance
The initial hero PNG and full logo formerly required 3,649,589 bytes together. The responsive 800-pixel WebP hero and cropped approved logo mark now require 38,748 bytes (a 99% reduction in those two image assets; not a measured page-speed improvement). A 400-pixel hero variant is available for smaller screens. Lower-page imagery loads lazily and decodes asynchronously. Originals are kept outside public assets.

DM Sans, Manrope and Noto Sans Bengali are self-hosted variable WOFF2 subsets, with font-display: swap and included OFL licenses. No Google Fonts CSS/CDN call is required to render the site. Hashed static assets have immutable cache headers. Unused historical homepage components and styles were removed. Shared base/demo CSS was reduced from 43,391 to 17,182 bytes; the previous 40,352-byte home stylesheet is no longer loaded.

Marketing navigation uses Next Link/client routing with prefetch disabled to avoid fetching every lower-page link during initial load. Non-personal marketing and entry routes are marked force-static; identity-dependent routes remain force-dynamic. Full build-time prerendering is intentionally not enabled because the installed framework's Node prerender runner cannot load Cloudflare bindings. Browser load time, Core Web Vitals and the Bangladesh network path have not been measured in this environment.
