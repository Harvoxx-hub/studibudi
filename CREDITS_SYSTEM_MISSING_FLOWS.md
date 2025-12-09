# Credits System - Missing Flows & Considerations

This document outlines missing flows, edge cases, and improvements needed for a complete credits system implementation.

---

## 🔴 Critical Missing Flows

### 1. **Credit Refund on Generation Failure**
**Issue:** If generation fails AFTER credits are deducted, credits are lost.

**Current Behavior:**
- Credits are deducted after successful generation (good)
- But if generation fails mid-process in async mode, credits might be lost
- No rollback mechanism if credit deduction succeeds but generation fails

**Solution Needed:**
- Deduct credits ONLY after successful generation completion
- Implement rollback mechanism if generation fails after deduction
- Add transaction logging for credit operations

**Priority:** 🔴 **HIGH** - Users will lose credits unfairly

---

### 2. **Credit Display Across UI**
**Issue:** Credits are only visible on the generate page.

**Missing Locations:**
- ❌ Dashboard header/navbar (should be always visible)
- ❌ Profile page (should show credit balance)
- ❌ Dashboard home page (quick credit status)
- ❌ Sidebar navigation (persistent display)

**Solution Needed:**
- Add credit display component to DashboardLayout header
- Show credits in profile page
- Add credit badge/indicator in navigation

**Priority:** 🟡 **MEDIUM** - Important for UX but not blocking

---

### 3. **Credit History/Transaction Log**
**Issue:** Users can't see where their credits went.

**Missing Features:**
- No transaction history
- No way to see what credits were spent on
- No audit trail

**Solution Needed:**
- Create `creditTransactions` collection in Firestore
- Log every credit deduction/addition with:
  - Type (deduction/addition)
  - Amount
  - Reason (generation, purchase, refund, etc.)
  - Timestamp
  - Related item ID (flashcard set, quiz, etc.)
- Add API endpoint: `GET /users/me/credit-history`
- Add UI component to display transaction history

**Priority:** 🟡 **MEDIUM** - Important for transparency

---

### 4. **Low Credit Warnings**
**Issue:** Users might run out of credits unexpectedly.

**Missing Features:**
- No warning when credits are low (< 10 credits)
- No notification before generation if insufficient credits
- No proactive alerts

**Solution Needed:**
- Add credit threshold checks
- Show warning banner when credits < 10
- Send notification when credits < 5
- Prevent generation with clear message if insufficient credits

**Priority:** 🟡 **MEDIUM** - Improves UX

---

### 5. **Migration for Existing Users**
**Issue:** Existing users don't have credits initialized.

**Missing:**
- No migration script to add credits to existing users
- Users created before credits system won't have credits field

**Solution Needed:**
- Create migration script/function to:
  - Find all users without credits field
  - Initialize credits to 50 for existing users
  - Run as one-time migration

**Priority:** 🔴 **HIGH** - Blocks existing users

---

## 🟡 Important Missing Features

### 6. **Credit Display in Profile Page**
**Issue:** Profile page doesn't show credit balance.

**Current State:**
- Profile shows subscription info
- Profile shows usage stats (old system)
- No credit balance display

**Solution Needed:**
- Add credit balance section to profile
- Show credit history link
- Add "Purchase Credits" button

**Priority:** 🟡 **MEDIUM**

---

### 7. **Credit Display in Dashboard Header**
**Issue:** Credits not visible in main navigation.

**Current State:**
- Credits only shown on generate page
- No persistent credit indicator

**Solution Needed:**
- Add credit badge to DashboardLayout header
- Show credits next to user avatar or in top bar
- Make it clickable to go to credit purchase page

**Priority:** 🟡 **MEDIUM**

---

### 8. **Error Handling & Rollback**
**Issue:** What if credit deduction fails mid-generation?

**Current Behavior:**
- Credits checked before generation
- Credits deducted after generation
- But if deduction fails, generation still succeeds (inconsistent state)

**Solution Needed:**
- Use transactions for atomic operations
- If deduction fails, rollback generation
- Add retry mechanism for failed deductions
- Log failed operations for manual review

**Priority:** 🟡 **MEDIUM** - Data consistency issue

---

### 9. **Credit Purchase Success/Failure Pages**
**Issue:** No UI for credit purchase flow completion.

**Missing:**
- Success page after credit purchase
- Failure page for failed purchases
- Confirmation modals

**Solution Needed:**
- Create `/premium/credits/success` page
- Create `/premium/credits/failure` page
- Add purchase confirmation modals
- Show updated credit balance after purchase

**Priority:** 🟢 **LOW** - Will be needed when purchase flow is implemented

---

### 10. **Credit Analytics & Insights**
**Issue:** No way to see credit usage patterns.

**Missing:**
- Credit spending trends
- Most expensive operations
- Average credits per generation
- Credit efficiency metrics

**Solution Needed:**
- Add analytics endpoint
- Show spending charts in profile/stats page
- Help users understand their usage

**Priority:** 🟢 **LOW** - Nice to have

---

## 🟢 Nice-to-Have Features

### 11. **Free Credit Promotions**
**Missing:**
- Ways to earn free credits
- Referral bonuses
- Daily login bonuses
- Achievement rewards

**Solution Needed:**
- Referral system (give credits for referrals)
- Daily login bonus
- Achievement system
- Promotional campaigns

**Priority:** 🟢 **LOW** - Growth/marketing feature

---

### 12. **Credit Packages/Subscriptions**
**Missing:**
- Monthly credit subscriptions
- Credit bundles (buy 100, get 20 free)
- Bulk purchase discounts

**Solution Needed:**
- Define credit packages
- Implement subscription-based credit refills
- Add promotional pricing

**Priority:** 🟢 **LOW** - Business model feature

---

### 13. **Credit Transfer/Gifting**
**Missing:**
- Can't gift credits to other users
- No credit sharing mechanism

**Solution Needed:**
- Add credit transfer endpoint
- Add gifting UI
- Add transfer history

**Priority:** 🟢 **LOW** - Social feature

---

### 14. **Credit Expiration**
**Missing:**
- Credits never expire
- No expiration policy

**Consideration:**
- Should credits expire after X months?
- Should purchased credits expire differently than free credits?
- Add expiration dates to credit transactions

**Priority:** 🟢 **LOW** - Business decision needed

---

### 15. **Credit Limits**
**Missing:**
- No maximum credit cap
- No minimum credit requirement

**Consideration:**
- Should there be a max credits a user can hold?
- Should there be minimum credits to start generation?

**Priority:** 🟢 **LOW** - Business decision needed

---

## 🔧 Technical Improvements Needed

### 16. **Credit Transaction Logging**
**Current:** Credits deducted but no audit trail.

**Needed:**
- Log all credit operations
- Store transaction details
- Enable debugging and support

**Priority:** 🟡 **MEDIUM** - Important for debugging

---

### 17. **Credit Balance Caching**
**Current:** Credits fetched on every page load.

**Needed:**
- Cache credit balance in user store
- Refresh periodically
- Update after operations

**Priority:** 🟢 **LOW** - Performance optimization

---

### 18. **Admin Credit Management**
**Missing:**
- No admin tools to add/remove credits
- No way to manually adjust credits
- No credit management dashboard

**Solution Needed:**
- Admin endpoint to adjust credits
- Admin UI for credit management
- Credit adjustment history

**Priority:** 🟢 **LOW** - Admin tool

---

## 📋 Implementation Priority Summary

### 🔴 **Must Have (Before Launch)**
1. Credit refund on generation failure
2. Migration for existing users
3. Credit display in dashboard header
4. Error handling & rollback

### 🟡 **Should Have (Soon After Launch)**
5. Credit history/transaction log
6. Low credit warnings
7. Credit display in profile
8. Credit transaction logging

### 🟢 **Nice to Have (Future)**
9. Credit purchase success/failure pages
10. Credit analytics
11. Free credit promotions
12. Credit packages/subscriptions
13. Credit transfer/gifting
14. Credit expiration
15. Credit limits
16. Credit balance caching
17. Admin credit management

---

## 🚀 Quick Wins (Easy to Implement)

1. **Add credit display to DashboardLayout header** - 30 min
2. **Add credit display to profile page** - 30 min
3. **Add low credit warning** - 1 hour
4. **Create migration script for existing users** - 1 hour
5. **Add credit transaction logging** - 2 hours

---

## 📝 Notes

- **Credit Refund** is the most critical missing piece - users will lose credits unfairly
- **Credit Display** is important for UX - users need to see their balance
- **Migration** is critical for existing users - they won't have credits otherwise
- **Transaction Logging** is important for debugging and support

---

**Last Updated:** December 2024
**Status:** Planning Phase

