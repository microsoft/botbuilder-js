# HowTo: Block all Skill Claims

Write a function that conforms to the `ValidateClaims` interface and throws an exception if the claims are skill claims:
```typescript
const skillClaimsValidator = async (claims) => {
    if (SkillValidation.isSkillClaim(claims)) {
        throw new Error("Invalid call from a skill.");
    }
}
```

Update `BotFrameworkAdapter` instantiation, to pass the `AuthenticationConfiguration` constructor the function defined above:
```typescript
const adapter = new BotFrameworkAdapter({
  ...
  authConfig: new AuthenticationConfiguration([], skillClaimsValidator),
});
```