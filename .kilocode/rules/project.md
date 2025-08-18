Primary language is persian.

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

Implementation pattern:

- To call API, first implement the provider pattern in providers folder, then use it in components
- When you need to call a method of provider, use Svelte `let:` directive to expose methods and data from providers (e.g., `let:createWalletAddress`, `let:loading`, `let:data`)
- Use event handler props like `onSuccess` and `onError` instead of Svelte event listeners (e.g., `onSuccess={(data) => {...}}` instead of `on:success`)
- Nest providers in template to access multiple provider methods in the same component
- Create comprehensive list page with search, filtering, and pagination
- Implement create/edit forms with proper validation
- Add confirmation dialogs for delete operations
- Ensure all CRUD operations are properly connected to backend API
- Use proper loading states and error handling throughout
- Implement proper TypeScript types for all components and providers
- Always define one request per provider ( its mean only one useTrpcRequest )

Form validation pattern:

- Import `{ rules, useForm, type FormConfig }` from `$lib/helpers/form.helper`
- Define form configuration with validation rules:
  ```typescript
  const formConfig: FormConfig = {
    fieldName: {
      rules: [rules.required, rules.email, etc.],
      label: 'Field Label'
    }
  };
  ```
- Initialize form helper: `const { errors, validate, reset: resetValidation } = useForm(formConfig);`
- Use FormGroup component with error handling:
  ```svelte
  <FormGroup
    label="Field Label"
    error={$errors?.fieldName || ''}
    showError={!!$errors?.fieldName}
  >
    <Input bind:value={fieldValue} />
  </FormGroup>
  ```
- Validate on form submit: `if (!validate({ fieldName: fieldValue })) return;`
- Reset validation when needed: `resetValidation();`

Global:

- always use bun to write test and run tests. dont use vitest or other libraries
- in providers, we always have events like onSuccess and onError, for example dont do on:success on the component and instead do onSuccess={() => ...}
