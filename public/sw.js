if(!self.define){let e,s={};const n=(n,t)=>(n=new URL(n+".js",t).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(t,i)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let c={};const r=e=>n(e,a),f={module:{uri:a},exports:c,require:r};s[a]=Promise.all(t.map((e=>f[e]||r(e)))).then((e=>(i(...e),c)))}}define(["./workbox-e9849328"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"608a477fbdf1b0bbdc84dfce2a34ca7a"},{url:"/_next/static/09OnBHMtw3ZAKyWH-fmR8/_buildManifest.js",revision:"46f3539e2fa61dad7aba3cf303b58a19"},{url:"/_next/static/09OnBHMtw3ZAKyWH-fmR8/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/1de6029f-84a3854921dbdc1e.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/207-ccfe4fd5927290b8.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/248f8154-4ea5e7f4476950cf.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/342-2c43f82862ff944a.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/394-f2463782204b450a.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/442-f02f7259bb0389b0.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/462-b6cb54637667ab04.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/515-354dd4c8b7665e6c.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/55-92f4b1215786c1c7.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/572-907d73e6747dc211.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/651-5ce893e7a39be022.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/776-b2d6015229141bde.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/810-570099b0126a0d6b.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/832-8d15dea3d4c52ff1.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/84fbfe7f-fe770896f1728b88.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/app/(auth)/login/page-0acf329176cee55c.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/app/(auth)/signin/page-fec58d7b794d497c.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/app/(auth)/signup/page-3fe26bb3d3818b6f.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/app/(marketing)/layout-abdd91adb4507e88.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/app/(marketing)/page-bbae67d038473c6f.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/app/_not-found/page-fb5de882fb080a11.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/app/dashboard/page-71c464265eb9a66f.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/app/layout-5cf991a5ce5673b3.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/framework-6e06c675866dc992.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/main-8f817fab7b16436f.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/main-app-8ac8bcddd42aeef4.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/pages/_app-ae606d9ce20d8953.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/pages/_error-dd5078a12dce2d6e.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-6998bfa40daee00c.js",revision:"09OnBHMtw3ZAKyWH-fmR8"},{url:"/_next/static/css/6a5c4e7b82d86ee8.css",revision:"6a5c4e7b82d86ee8"},{url:"/_next/static/media/05a31a2ca4975f99-s.woff2",revision:"f1b44860c66554b91f3b1c81556f73ca"},{url:"/_next/static/media/513657b02c5c193f-s.woff2",revision:"c4eb7f37bc4206c901ab08601f21f0f2"},{url:"/_next/static/media/51ed15f9841b9f9d-s.woff2",revision:"bb9d99fb9bbc695be80777ca2c1c2bee"},{url:"/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2",revision:"74c3556b9dad12fb76f84af53ba69410"},{url:"/_next/static/media/d6b16ce4a6175f26-s.woff2",revision:"dd930bafc6297347be3213f22cc53d3e"},{url:"/_next/static/media/ec159349637c90ad-s.woff2",revision:"0e89df9522084290e01e4127495fae99"},{url:"/_next/static/media/fd4db3eb5472fc27-s.woff2",revision:"71f3fcaf22131c3368d9ec28ef839831"},{url:"/hero-dark.png",revision:"11751c4640bc08c0e1fa9dc29387594a"},{url:"/hero-light.png",revision:"11bf566467cc5fd0ecf4990526fd13d8"},{url:"/icon-192x192.png",revision:"42411c612aefd86d14ea7b637a953076"},{url:"/icon-256x256.png",revision:"918cbb2be089864872e3568f33a85d71"},{url:"/icon-384x384.png",revision:"b799b85d8ac9f1fec2523337dbd9b172"},{url:"/icon-512x512.png",revision:"75a7b120026364de68abb125cad63d4d"},{url:"/logo.png",revision:"cd047b546d168973de3a4e8ec8f64625"},{url:"/manifest.json",revision:"e897063e449262537f68de12e46c7e5d"},{url:"/photo-de-profil.jpg",revision:"7424cb71e80ee9514fff5b172488592d"},{url:"/qrcode.png",revision:"800200859ebd66d5ebbf6db3020f6ea2"},{url:"/qrcode.svg",revision:"b83888612bae3eac8bcb4fc185632675"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:t})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
