## Brief overview

This rule file establishes guidelines for avoiding duplicated code and promoting reusability in the KitRPC project. The goal is to create maintainable, scalable code by identifying opportunities to make components, functions, and other code elements reusable across the application.

## Code duplication prevention

- Identify common patterns and components that can be abstracted into reusable units
- When implementing new features, first check if similar functionality already exists that could be extended or adapted
- Extract shared logic into helper functions, utility modules, or reusable components
- Avoid copying and pasting code blocks, even for "small" changes

## Component reusability

- Design Svelte components to be generic and configurable through props rather than creating similar components with duplicated logic
- Place reusable UI components in appropriate shared directories (e.g., `src/lib/kit`)
- Ensure components have clear, well-defined interfaces with typed props
- Create comprehensive component documentation with usage examples

## Function and utility reusability

- Centralize common business logic in service files (`src/lib/services`)
- Create helper functions for repeated operations in `src/lib/helpers`
- Ensure functions have single responsibilities and are parameterized appropriately
- Export reusable functions with proper TypeScript typing

## Implementation practices

- Before creating new code, evaluate if existing solutions can be adapted
- When refactoring duplicated code, ensure backward compatibility or properly update all usages
- Use composition over inheritance when combining component behaviors
- Favor parameterized solutions over hardcoded variations

## Benefits and enforcement

- Reusable code reduces maintenance burden and bug surface area
- Consistent application of these principles improves codebase quality and developer productivity
- Code reviews should check for opportunities to increase reusability
- Technical debt arising from duplicated code should be prioritized for refactoring
