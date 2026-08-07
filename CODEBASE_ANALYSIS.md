# fnhvalue Codebase Analysis

**Date:** 2026-08-07  
**Project:** FNH Value (Next.js 16, React 19, TypeScript)  
**Scope:** Comprehensive analysis of `/app`, `/lib`, and `/components` directories

---

## 1. UNUSED IMPORTS AND VARIABLES

### 1.1 Unused State Variables

**File:** [components/value-site.tsx](components/value-site.tsx#L40)
- **Variable:** `authError` (declared but never assigned or displayed)
- **Lines:** 40 (declaration), never used
- **Issue:** State is declared but `setAuthError` is never called, and the variable is never rendered
- **Recommendation:** Remove this unused state or implement error display UI if needed

### 1.2 Unused Component Imports

**File:** [components/ui/button.tsx](components/ui/button.tsx)
- **Issue:** The `Button` component from `@base-ui/react` is defined but never imported or used anywhere in the codebase
- **Recommendation:** Either remove this component or use it in components that need button variants

---

## 2. DEAD CODE & UNUSED EXPORTS

### 2.1 Potentially Unused Calculator Variants

**File:** [lib/calculator.ts](lib/calculator.ts)
- **Functions:**
  - `getSerialValueHighValue()` (line 165)
  - `getItemValueHighValue()` (line 250)
  - `getSerialValueByMode()` (line 169)
  - `getItemValueByMode()` (line 254)
- **Issue:** These "high-value" and "by-mode" variants are exported but appear to be rarely used; most of the codebase uses the base versions
- **Recommendation:** Search for actual usage to confirm if these are needed or if they could be consolidated

---

## 3. CRITICAL SECURITY ISSUES ⚠️

### 3.1 EXPOSED CLIENT SECRET (CRITICAL)

**File:** [app/api/discord/token/route.ts](app/api/discord/token/route.ts#L14)
- **Issue:** Discord client secret is hardcoded in the API route: `XLC57DavMEaE3ssCMCM2YkvW01lvde7O`
- **Risk Level:** CRITICAL
- **Impact:** This secret should NEVER be in version control or client-accessible code
- **Recommendation:**
  1. **Immediately revoke this secret** in Discord Developer Portal
  2. Generate a new secret
  3. Store it in environment variables: `DISCORD_CLIENT_SECRET` in `.env.local`
  4. Update route to use: `process.env.DISCORD_CLIENT_SECRET`
  5. Add `.env.local` to `.gitignore` if not already there

**Example Fix:**
```typescript
const clientSecret = process.env.DISCORD_CLIENT_SECRET
if (!clientSecret) {
  throw new Error('DISCORD_CLIENT_SECRET is not configured')
}
```

---

## 4. POTENTIAL BUGS & LOGIC ERRORS

### 4.1 Deprecated Discord API Usage

**File:** [app/discord/page.tsx](app/discord/page.tsx#L73)
- **Issue:** Using `response.discriminator` which Discord deprecated in 2023
- **Current Code:**
  ```typescript
  username: `${response.username}#${response.discriminator}`
  ```
- **Problem:** Discriminators no longer exist in Discord API responses; this will result in usernames like `username#undefined`
- **Fix:** Use just `response.username`
```typescript
  username: response.username  // or response.global_name for display name
```

### 4.2 Missing Error Handling in Search/Filter Date Parsing

**File:** [components/search-bar.tsx](components/search-bar.tsx#L280-L310)
- **Issue:** Date parsing and parsing could fail silently
- **Risk:** Invalid date inputs may result in unexpected behavior
- **Recommendation:** Add try-catch blocks around `new Date()` parsing

### 4.3 Unsafe JSON.parse in localStorage

**Multiple Files:**
- [components/value-site.tsx](components/value-site.tsx#L47)
- [components/tradepost-board.tsx](components/tradepost-board.tsx#L85-L89)
- [app/discord/page.tsx](app/discord/page.tsx#L48-L54)

**Issue:** Using `JSON.parse()` without proper error handling
**Current Pattern:**
```typescript
try {
  setDiscordUser(JSON.parse(storedUser))
} catch {
  window.localStorage.removeItem("discordUser")
}
```
**Recommendation:** Consider wrapping in a utility function to centralize error handling

### 4.4 Numeric Input Validation Issue

**File:** [components/search-bar.tsx](components/search-bar.tsx#L328-L334)
- **Issue:** `parseInt(val)` without radix parameter; should specify radix 10
- **Current:** `const num = parseInt(val)`
- **Fix:** `const num = parseInt(val, 10)`

---

## 5. RUNTIME ERROR PATTERNS

### 5.1 Missing Null Check on Item Properties

**File:** [lib/calculator.ts](lib/calculator.ts#L12-L16)
- **Issue:** `getVariantBaseValue()` checks `item?.value` but other functions may not safely handle undefined items
- **Recommendation:** Add defensive checks consistently across all value-calculation functions

### 5.2 Unhandled Promise Rejections

**File:** [components/tradepost-page.tsx](components/tradepost-page.tsx#L119+)
- **Issue:** Fetch calls in `handlePostToBoard()` have basic error handling, but edge cases around network failures may not be fully covered
- **Recommendation:** Add more granular error handling for different failure scenarios

### 5.3 Missing Return Type Check

**File:** [lib/tradeposts-store.ts](lib/tradeposts-store.ts#L226+)
- **Issue:** `deleteCommentFromTradepost()` returns `TradepostEntry | null` but calling code doesn't always verify the return
- **Files:** [components/tradepost-board.tsx](components/tradepost-board.tsx#L200+)

---

## 6. CODE PATTERNS THAT COULD CAUSE RUNTIME ERRORS

### 6.1 Local Storage Without Availability Check

**Multiple Files:** components/tradepost-board.tsx, components/tradepost-page.tsx, app/discord/page.tsx
- **Issue:** Direct `window.localStorage` access could fail in server-side rendering or environments without localStorage
- **Current Pattern:**
  ```typescript
  const stored = window.localStorage.getItem("discordUser")
  ```
- **Better Pattern:**
  ```typescript
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem("discordUser")
  }
  ```
- **Status:** Some places have this check, others don't

### 6.2 Crypto.randomUUID() Fallback Inconsistency

**Files:**
- [components/tradepost-board.tsx](components/tradepost-board.tsx#L104-L108)
- [components/tradepost-page.tsx](components/tradepost-page.tsx#L125-L129)

- **Issue:** Different implementations of UUID generation for author IDs
- **Recommendation:** Extract to utility function in `lib/utils.ts` for consistency

**Suggested Utility:**
```typescript
export function generateAuthorId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `anon-${crypto.randomUUID()}`
  }
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
```

### 6.3 Missing Async Handling in useEffect

**File:** [components/tradepost-board.tsx](components/tradepost-board.tsx#L140)
- **Issue:** Async operations inside useEffect with no abort signal
- **Risk:** Component may try to update state after unmount
- **Recommendation:** Add AbortController to cancel requests on unmount

---

## 7. UNUSED REACT COMPONENTS

None found. All React components in `/components` are either:
- Imported and used in parent components, or
- Exported for use in pages

---

## 8. TYPE SAFETY ISSUES

### 8.1 Implicit `any` Types in Error Handlers

**Multiple Files:**
- [lib/tradeposts-store.ts](lib/tradeposts-store.ts#L100+)
- [components/tradepost-board.tsx](components/tradepost-board.tsx#L200+)

**Pattern:**
```typescript
} catch {
  console.error("Error", error)  // error type is 'unknown', not properly typed
}
```
**Better:**
```typescript
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error"
  console.error("Error:", message)
}
```

### 8.2 Unsafe Type Assertion

**File:** [components/search-bar.tsx](components/search-bar.tsx#L295)
- Dynamically casting filter sort value without verification
- Less critical but could be improved with better typing

---

## 9. RECOMMENDATIONS FOR CLEANUP

### High Priority (Security & Stability)
1. ✅ **CRITICAL:** Move Discord client secret to environment variables
2. ✅ Fix Discord discriminator usage (deprecated API)
3. ✅ Add AbortController to useEffect async operations
4. ✅ Consistent error handling pattern across codebase

### Medium Priority (Code Quality)
5. Extract duplicate UUID generation logic into utility
6. Remove unused `authError` state from ValueSite
7. Add proper null checking in value calculation functions
8. Review and consolidate value calculation variants

### Low Priority (Nice to Have)
9. Remove unused Button component if truly unused
10. Improve error type handling in catch blocks
11. Add JSDoc comments to exported functions in lib/

---

## 10. SUMMARY TABLE

| Issue Type | Severity | Count | Files |
|-----------|----------|-------|-------|
| Unused Variables | Low | 1 | value-site.tsx |
| Security Issues | CRITICAL | 1 | discord/token/route.ts |
| Deprecated API | High | 1 | discord/page.tsx |
| Error Handling Gaps | Medium | 5+ | Multiple |
| Runtime Error Patterns | Medium | 3 | Multiple |
| Type Safety Issues | Low | 2 | Multiple |
| **TOTAL ISSUES** | — | **13+** | — |

