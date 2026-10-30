# LWN live release — October 30, 2026

Public URL: https://www.lwnetwork.org/
Deployment: dpl_7k87PAkZkDkKP2i8E7w1Cx36bNBg
Immutable production URL: https://lwn-website-edslwhiu9-living-water-network.vercel.app
Source commit before release notes: 0f43507 (local only; GitHub connector returns 403 for writes).

Promoted the production-environment build. www.lwnetwork.org, lwnetwork.org, and lwn-website.vercel.app alias mappings completed. Maintenance is removed.

Refreshed original-color globe/water symbol, HTML wordmark, header/footer identity, mobile/browser icons, and separated globe/water/wordmark welcome animation. About and program language center LWN and its coaching team. Decorative emoji removed from main ministry pages. Existing authorship, photo descriptions, agreements, portal behavior, and database schema retained.

Validation: TypeScript and 163 unit tests passed. Local build hit a Google font fetch/webpack failure; Vercel production build succeeded. Thirteen page routes and logo/favicon returned 200 before launch. Public www and apex subsequently checked for new brand/copy. Browser verified new brand, timed intro clearing to main page, organizational About heading, zero broken loaded images and no desktop horizontal overflow. Runtime error/fatal query for this deployment returned no groups at launch.

Not validated: actual form submission/email delivery, real payments or signatures, mobile visual device QA, or measured Lighthouse scores. No new private records or messages created during release QA.

Deployment copies current source directly because GitHub write access is denied. Public photos are served by a rewrite to the preserved immutable prior deployment lwn-website-rdp5einix-living-water-network.vercel.app; new brand assets and browser icons are included directly. Keep the prior deployment until the photos are copied into a future repository-synchronized release.

IMPORTANT: autoAssignCustomDomains is false intentionally after launch to prevent a subsequent build from outdated GitHub main automatically replacing these unsynced changes. Future production releases require explicit promotion until repository write access is restored and the release source is synchronized.
