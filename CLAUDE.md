## #1 PRIORITY: WRITE ELEGANT CODE

**Above all else, prioritize writing elegant code:**

- Clean, readable, and maintainable
- Well-structured with clear separation of concerns
- Thoughtful naming and consistent patterns
- Code that future developers will appreciate

**MANDATORY: Use deep, thorough analysis for ALL tasks:**

- Take time to fully understand the problem before proposing solutions
- Consider multiple approaches and trade-offs
- Think through edge cases and implications
- Analyze the broader system impact of changes
- Question assumptions and validate understanding
- Break complex problems into smaller, manageable parts
- Consider performance, maintainability, and scalability
- Reflect on whether the solution truly solves the root problem

**When writing code:**

- First, thoroughly analyze the existing codebase patterns
- Consider all possible implementations before choosing one
- Think through the entire data flow and state management
- Validate that the solution aligns with project architecture
- Ensure the code will be maintainable and extensible

### NEVER USE (ZERO TOLERANCE):
- **`!`** (non-null assertion)
- **`any`** type
- **`as`** (type assertions)

## Code Guidelines

- Write **ONLY** the minimal code required to meet the specified requirements
- Do **NOT** add any features, improvements, or functionality beyond what is
  explicitly requested
- **No** extra error handling, validation, or edge case handling unless
  specifically asked
- **No** logging, debugging statements, or comments unless requested
- Keep implementations as simple and bare-bones as possible
- If a feature **isn't** mentioned in the requirements, it shouldn't be in the
  code
- Prioritize brevity and minimalism over robustness
- After code changes, run `npm run check` until it passes
- **Do NOT run `npm run dev`** to validate code

## Form & Action Patterns

**Actions should use JSON with Zod schemas:**

- Accept JSON payloads using `await request.json()`
- Validate input with Zod schemas (e.g., `userDataSchema.parse(json)`)
- Return standardized `ActionSchema` responses with `success` or `error` fields
- Use `data({ success: 'message' } satisfies ActionSchema, { status: 200 })` for success
- Use `data({ error: 'message' } satisfies ActionSchema, { status: 400 })` for errors

**Forms should use react-hook-form with Zod validation:**

- Initialize forms with `useForm<T>({ resolver: zodResolver(schema) })`
- Submit as JSON using `fetcher.submit(formData, { method: 'POST', encType: 'application/json' })`
- Type fetchers with `useFetcher<ActionSchema>()`
- Handle responses with success/error state management
