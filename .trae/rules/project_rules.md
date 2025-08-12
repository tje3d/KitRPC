Always use bun and bunx instead of node, npm and npx.

Backend:

- use bun, bunx instead of node, npm and npx
- to update database use scripts in package.json ( like generate migrate ... )

Frontend:

- we already have ui kits, to implement pages, first implement the ui kits ( or update them if needed but should be backward compatible - add variants etc if not possible create new component )

use tailwindcss icon packages installed
Heroicons: icon-[heroicons--icon-name]
CIB Icons: icon-[cib--icon-name]
Solar Icons: icon-[solar--icon-name]
SVG Spinners: icon-[svg-spinners--icon-name]

Proper Syntax
<span class="icon-[icon-set--icon-name] w-4 h-4"></span>

To call api, first implement the provider pattern in providers folder, then use it in components.
when you need to call a method of provider you should use svelte bind:this syntax and have refrence to instance then you can use all methods.
