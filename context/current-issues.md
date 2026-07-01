when i clicked register button ithe followung error  [browser] Uncaught Error: useSession can only be used within the <ClerkProvider /> component.

Possible fixes:
1. Ensure that the <ClerkProvider /> is correctly wrapping your application where this component is used.
2. Check for multiple versions of the `@clerk/shared` package in your project. Use a tool like `npm ls @clerk/shared` to identify multiple versions, and update your dependencies to only rely on one.

Learn more: https://clerk.com/docs/components/clerk-provider
    at RegisterPage (app/register/page.tsx:17:9)
  15 |           Create your account
  16 |         </div>
> 17 |         <SignUp appearance={clerkAppearance} path="/register" />
     |         ^
  18 |       </div>
  19 |     </AuthPageShell>
  20 |   );