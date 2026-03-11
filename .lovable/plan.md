

# MyBudgetPlan — Personal Budget Management App

## Design
- **Theme**: Dark green & white fintech style (Robinhood-inspired), with green accents for income/positive, red for expenses/negative
- **Typography**: Clean, modern sans-serif
- **Responsive**: Mobile-first with sidebar navigation on desktop, bottom nav on mobile
- **Default currency**: USD ($), changeable in settings

## Backend (Lovable Cloud / Supabase)

### Database Tables
- **profiles** — user profile data (name, avatar, currency preference, notification settings)
- **user_roles** — admin/user roles (security definer pattern)
- **categories** — income/expense categories (name, type, color, icon, is_default, user_id for custom)
- **transactions** — all income & expense entries (amount, category_id, date, notes, is_recurring, recurring_interval)
- **budgets** — monthly/category budget limits (month, category_id, amount, user_id)
- **notifications** — in-app alerts (budget warnings, summaries)

### Edge Functions
- Monthly summary email notifications
- Budget limit alert emails
- PDF report generation

## Pages & Features

### 1. Auth Pages
- Register, Login, Forgot Password, Reset Password
- Clean branded auth forms with green accent

### 2. Dashboard (`/dashboard`)
- Summary cards: Total Income, Total Expenses, Remaining Balance, Budget Used %
- Pie chart: expense breakdown by category
- Bar chart: monthly income vs expenses (last 6 months)
- Recent transactions list
- Quick-add buttons for income/expense

### 3. Transactions (`/transactions`)
- Full transaction list with filters (date range, category, type)
- Add/edit/delete income & expense entries
- Notes field, category selector, date picker
- Recurring transaction toggle with interval options

### 4. Income (`/income`)
- Income-specific view with history
- Add/edit/delete income records
- Category filter (salary, freelance, business, etc.)

### 5. Expenses (`/expenses`)
- Expense-specific view with history
- Categorized expenses (food, rent, travel, shopping, utilities)
- Add/edit/delete with notes

### 6. Budget Planning (`/budgets`)
- Set monthly overall budget
- Set per-category budget limits
- Visual progress bars showing budget usage
- Color-coded alerts (green → yellow → red as limit approaches)

### 7. Categories (`/categories`)
- Default categories pre-seeded
- Create/edit/delete custom categories
- Color picker for each category
- Separate income vs expense category types

### 8. Reports (`/reports`)
- Monthly financial summary
- Income vs expense trends
- Category-wise spending breakdown
- Date range selector
- Export as CSV and PDF

### 9. Notifications (`/notifications`)
- In-app notification center
- Budget limit alerts (at 80% and 100%)
- Monthly summary notifications
- Email notification delivery via edge functions

### 10. Settings (`/settings`)
- Update profile (name, avatar)
- Change currency
- Notification preferences (in-app, email toggles)
- Account settings (change password)

### 11. Admin Panel (`/admin`)
- Protected by admin role check
- User list with basic management
- System usage analytics (total users, transactions count)
- Activity monitoring

## Navigation
- **Desktop**: Left sidebar with icons + labels, collapsible
- **Mobile**: Bottom tab bar with key sections, hamburger for rest

