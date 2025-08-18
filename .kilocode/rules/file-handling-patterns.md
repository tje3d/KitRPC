## Brief overview

This rule file documents the file handling patterns and architectural decisions implemented in the KitRPC project, specifically for managing file uploads through a generic, centralized approach that ensures consistency and type safety across the application.

## File Handling Architecture

- Use a generic file processing function in `src/hooks.server.ts` that processes multipart form data for any POST request with multipart/form-data content type
- Extract only the first file from form data to ensure `event.locals.fileData` always contains a single file, not multiple files
- Store processed file data and form fields in `event.locals` for access through tRPC context
- Remove route-specific checks in favor of generic content-type and method checking

## Type Safety and Consistency

- Define `SingleFileData` interface in `src/app.d.ts` in the global App namespace for centralized type definitions
- Use `App.SingleFileData` throughout the application instead of defining local interfaces
- Ensure the `fileData` property in the `Locals` interface uses the centralized `SingleFileData` type
- Maintain consistent typing between `hooks.server.ts`, `context.ts`, and `app.d.ts`

## Implementation Patterns

- Process files in `hooks.server.ts` and make them available through tRPC context (`ctx.fileData`)
- Implement business logic in tRPC routers rather than in file processing hooks
- Create separate procedures for file upload and finalization when multiple files are required
- Use enum-based file type parameters for identifying different file purposes

## Best Practices

- Make file handlers generic to work with any endpoint without route path checking
- Extract form fields and file data separately for flexible access in tRPC procedures
- Handle errors gracefully in file processing without breaking the request flow
- Ensure type safety through centralized interface definitions
