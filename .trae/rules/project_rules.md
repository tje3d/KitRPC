Always use bun and bunx instead of node, npm and npx.

Backend requirements:

- Use bun, bunx instead of node, npm and npx
- To update database use scripts in package.json (like generate migrate...)
- When implementing a service for backend, after implementing functions don't write a create service function - it's only duplicate code
- For migrations use: bun run db:migrate --name [name]

Frontend requirements:

- We already have UI kits. To implement pages, first implement the UI kits (or update them if needed but should be backward compatible - add variants etc. If not possible, create new component)
- Use TailwindCSS icon packages installed:
  - Heroicons: icon-[heroicons--icon-name]
  - CIB Icons: icon-[cib--icon-name]
  - Solar Icons: icon-[solar--icon-name]
  - SVG Spinners: icon-[svg-spinners--icon-name]
- Proper syntax: <span class="icon-[icon-set--icon-name] w-4 h-4"></span>
- use ps instead of pl and pe instead of pr and so on for margin etc...

Proper Syntax
<span class="icon-[icon-set--icon-name] w-4 h-4"></span>
