# 之间 BETWEEN

灯塔、飞鸟与王座的游戏：借阿伦特的概念，观察 AI 时代的思考、共同生活与选择。

This is the independent GitHub Pages edition. The existing ChatGPT Site remains separate.

Publish the `docs/` directory from the `main` branch with GitHub Pages.

After changing source or assets, install the locked development dependencies with pnpm and run `node scripts/build.mjs`. This generates hashed JavaScript/CSS bundles and embeds the loading manifest. Commit the generated files in `docs/` along with the source.

Opening preparation is limited to the cover (about 1.2 MB of images), with a 4.5-second optional-media budget. Later media is prefetched by stage, and hand tracking loads only when selected. The original PNGs are retained alongside the smaller WebP copies. The image optimization helper requires Python and Pillow.

Local preview: `node scripts/preview.mjs`. Its `/__slow/` route delays media for testing; it is not part of the published site.

Run checks with `node --test tests/*.test.mjs`.

Run `node scripts/check-runtime.mjs` to evaluate the exact module referenced by the published HTML in a simulated DOM and confirm it reaches the cover. This supplements browser testing; it does not verify WebGL rendering. The build also checks the HTML entry and preloads its static dependency graph. Decorative identity lettering is loaded only when a card needs it.

Third-party libraries retain their license notices in `docs/vendor/` and `docs/fonts/`.
