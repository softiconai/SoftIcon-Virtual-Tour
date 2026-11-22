=== SoftIcon Virtual Tour – 360° Panorama Viewer Block ===
Contributors: softiconai
Tags: virtual tour, 360 panorama, panorama viewer, 360, block
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A 360° panorama and virtual tour block. Add scenes and hotspots right in the block editor. Up to 50 scenes, no external services.

== Description ==

**SoftIcon Virtual Tour** adds a **Virtual Tour** block to the block editor. Choose your 360° photos from the Media Library and each one becomes a scene. Click the panorama to add hotspots that take visitors from room to room, show a note or open a link.

Made for real estate listings, hotels, restaurants, shops and showrooms, campuses, museums and galleries.

https://www.youtube.com/watch?v=Q7trSVaGkHk

* **Build the tour in the block editor** – the block shows the real 360° view while you edit. Open a scene in the sidebar, click the panorama to add a hotspot there, and drag it to move it. No separate admin page, no shortcode.
* **Up to 50 scenes per tour** – and up to 50 hotspots in each scene.
* **Three kinds of hotspots** – go to another scene, show information (title, text and an image in a small box), or open a link.
* **Your starting view** – turn and zoom the panorama, then press **Use the current view**. Visitors start each scene there.
* **Scene list** – the scene names under the panorama let visitors jump to any room.
* **Full image quality** – the block uses your original upload, not the smaller copy WordPress makes of big images.
* **Works on phones** – drag with a finger, pinch to zoom, fullscreen, and look around by moving the phone where the device allows it. If a phone cannot show a very large image, the block uses WordPress's smaller copy for that phone only.
* **Fast** – the viewer loads only when the tour comes near the screen, and each scene's image only when the scene is opened. The viewer is about 25 KB (gzip).
* **Accessible** – alternative text for each scene, keyboard control (arrow keys to look around, + and - to zoom), and hotspots you can reach with the Tab key.
* **Works without JavaScript** – the first scene is a real image with its alternative text, followed by the scene names, so search engines and every visitor can see it.
* **No external services** – every file is on your site. No API key, no CDN, no cookies, no tracking.
* **Your height** – in pixels or as a share of the screen height, with its own height on phones; wide and full width.

= Privacy =

The plugin sets no cookies, stores nothing about visitors and connects to no outside service. Your scenes and hotspots are saved in the block, inside your post.

= Third-party libraries =

* Pannellum 2.5.7 (npm package pannellum) by Matthew Petroff – [pannellum.org](https://pannellum.org/) / [github.com/mpetroff/pannellum](https://github.com/mpetroff/pannellum) – MIT License. Bundled in build/pannellum.js and build/style-index.css; license in build/pannellum-LICENSE.txt. The build keeps it to the block, so it never changes another plugin's copy of Pannellum (loaders/pannellum.js).

= Source code =

The plugin's source is in the src folder of the plugin, and builds with `npm install` and `npm run build`. It is also on GitHub: [github.com/softiconai/SoftIcon-Virtual-Tour](https://github.com/softiconai/SoftIcon-Virtual-Tour).

== Installation ==

1. Install the plugin from **Plugins → Add New**, or upload the zip, and activate it.
2. In the block editor, add the **Virtual Tour** block.
3. Choose or upload your 360° panorama images. Each image becomes a scene.
4. Open a scene in the block's sidebar to name it, add its alternative text and set its starting view. While it is open, click the panorama in the block to add a hotspot there.

== Frequently Asked Questions ==

= What images can I use? =

Equirectangular 360° panoramas: the image is twice as wide as it is high (2:1), for example 6000 × 3000 pixels. Most 360° cameras (Insta360, Ricoh Theta, GoPro Max) and phone panorama apps save this format. The block warns you when an image is not 2:1.

= How big should the images be? =

6000 × 3000 pixels is sharp on most screens. Larger images look a little sharper up close but take longer to load. Save them as JPEG at about 80% quality; a 6000 × 3000 image is then usually 2–5 MB.

= Why does WordPress make a "-scaled" copy of my image? =

WordPress makes a smaller copy (2560 pixels wide) of every image larger than that. The block shows your original upload, so the tour stays sharp. Phones that cannot show the original get the smaller copy instead.

= The tour does not show on a phone. =

Some older phones can only show images up to 4096 or 8192 pixels wide. The block checks this and uses WordPress's smaller copy on those phones. If you uploaded the image somewhere other than the Media Library, there is no smaller copy: keep such images at 8000 pixels wide or less.

= My images are on a CDN or another domain and the tour stays empty. =

The 360° view is drawn with WebGL, which can only use images from another domain when that domain allows it (CORS). Ask your CDN or offload plugin to send the header `Access-Control-Allow-Origin` for images, or keep the panoramas in your own Media Library.

= Does it work with caching and optimization plugins? =

Yes. The block finds its own files even when an optimization plugin combines or moves the scripts. If the tour does not start after you turn on JavaScript combining or delaying, exclude `softicon-virtual-tour` from it and clear the cache.

= Can I use it with Elementor or another page builder? =

The plugin is a block for the block editor. You can build the tour in a reusable block (synced pattern) and show that pattern where your page builder allows block content.

= Can visitors use the keyboard? =

Yes. Press Tab to reach the panorama, use the arrow keys to look around and + or - to zoom. Hotspots and the scene names are buttons you can reach with Tab and press with Enter.

== Screenshots ==

1. A tour on a page. Drag to look around, click an arrow to go to the next room, or pick a room under the panorama.
2. Build the tour in the block editor. The block shows the real 360° view, and the sidebar lists the scenes.
3. An open scene: its name, hotspots and image. While it is open, click the panorama to add a hotspot there.
4. Editing an info hotspot: a title, text and an image if you like.
5. An info hotspot opens a small box on the page.
6. A link hotspot shows its title when you point at it.
7. On a phone: drag with a finger and pinch to zoom.

== Changelog ==

= 1.0.1 =
* Fix: images chosen with the empty block's Media Library button now keep their title as the scene name and use the original upload, not the smaller "-scaled" copy WordPress makes of big images.
* A video in the description shows how to build a tour and what every setting does.

= 1.0.0 =
* First release.
