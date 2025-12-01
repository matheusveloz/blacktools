# 🚀 BLACKTOOLS - AI Video Generator Platform

## Project Overview

Build a complete SaaS platform for AI video generation with workflow editor (n8n style). The platform allows users to create videos using AI tools like LipSync, Sora 2, Veo 3, and Avatar generation.

---

## 🛠️ Tech Stack

### Core
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

### Backend & Database
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email + Google OAuth)
- **Storage:** Supabase Storage (for uploaded files)

### Payments
- **Payments:** Stripe (Checkout Sessions, Subscriptions, Webhooks)
- **Billing:** Dynamic checkout with USD currency

### UI Libraries
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable (for workflow nodes)
- **Canvas/Zoom:** react-zoom-pan-pinch (for workflow canvas)
- **Forms:** React Hook Form + Zod validation
- **Toasts:** Sonner
- **State:** Zustand (for workflow state management)

### Additional
- **Date handling:** date-fns
- **HTTP Client:** Built-in fetch (or axios if preferred)

---

## 📁 Project Structure

```
blacktools/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts
│   ├── (marketing)/
│   │   └── page.tsx (landing page)
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx (workflow editor)
│   │   └── settings/
│   │       └── page.tsx
│   ├── pricing/
│   │   └── page.tsx (plans selection after signup)
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   ├── stripe/
│   │   │   ├── create-checkout/
│   │   │   │   └── route.ts
│   │   │   ├── webhook/
│   │   │   │   └── route.ts
│   │   │   └── portal/
│   │   │       └── route.ts
│   │   └── user/
│   │       └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/ (shadcn components)
│   ├── auth/
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── oauth-buttons.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── workflow-canvas.tsx
│   │   ├── workflow-node.tsx
│   │   ├── add-node-menu.tsx
│   │   ├── node-connections.tsx
│   │   ├── canvas-controls.tsx
│   │   └── results-panel.tsx
│   ├── pricing/
│   │   └── pricing-cards.tsx
│   └── landing/
│       └── hero.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── config.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── use-user.ts
│   ├── use-subscription.ts
│   └── use-workflow.ts
├── stores/
│   └── workflow-store.ts (Zustand)
├── types/
│   ├── database.ts (Supabase types)
│   ├── workflow.ts
│   └── stripe.ts
├── middleware.ts
├── .env.local
└── package.json
```

---

## 🗄️ Database Schema (Supabase)

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 0,
  stripe_customer_id TEXT UNIQUE,
  subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_plan TEXT,
  subscription_current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Workflows table (optional - for saving workflows)
CREATE TABLE public.workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nodes JSONB DEFAULT '[]',
  connections JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own workflows" ON public.workflows
  FOR ALL USING (auth.uid() = user_id);

-- Generated videos table
CREATE TABLE public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
  tool TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  result_url TEXT,
  credits_used INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 💳 Stripe Configuration

### Products & Prices

```typescript
// lib/stripe/config.ts

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 24.50,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    credits: 550,
    features: [
      '550 monthly credits',
      'All AI tools access',
      'HD video export',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 39.50,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    credits: 1200,
    features: [
      '1,200 monthly credits',
      'All AI tools access',
      '4K video export',
      'Priority support',
      'Custom workflows'
    ]
  },
  premium: {
    name: 'Premium',
    price: 59.50,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    credits: 2500,
    features: [
      '2,500 monthly credits',
      'All AI tools access',
      '4K video export',
      'Priority support',
      'Custom workflows',
      'API access',
      'Team collaboration'
    ]
  }
} as const;
```

### Stripe Setup (create in Stripe Dashboard)

1. Create 3 Products: Starter, Pro, Premium
2. Each product has 1 recurring price (monthly, USD)
3. Enable trial: 1 day free trial
4. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
5. Webhook events to listen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

---

## 🔐 Environment Variables

```env
# .env.local

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
```

---

## 📄 Key Components Implementation

### 1. Middleware (Route Protection)

```typescript
// middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/signup');
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isPricing = req.nextUrl.pathname.startsWith('/pricing');

  // Not logged in trying to access dashboard
  if (!session && isDashboard) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Logged in trying to access auth pages
  if (session && isAuthPage) {
    // Check if user has active subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', session.user.id)
      .single();

    if (profile?.subscription_status === 'active') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
  }

  // Logged in, going to dashboard but no subscription
  if (session && isDashboard) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', session.user.id)
      .single();

    if (profile?.subscription_status !== 'active') {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/pricing']
};
```

### 2. Auth Flow

**Login Page:**
- Email/Password login
- Google OAuth button
- Link to signup

**Signup Page:**
- Email/Password signup
- Google OAuth button
- Collect: email, full_name
- After signup → redirect to /pricing

**Pricing Page:**
- Show 3 plan cards
- Each card has "Start 1-Day free trial" button
- On click → create Stripe checkout session → redirect to Stripe

**After Stripe Success:**
- Webhook updates user profile with subscription info
- User redirected to /dashboard

### 3. Dashboard Layout

```
┌────────────────────────────────────────────────────────────────┐
│ ┌──────────┐  ┌──────────────────────────────┐  ┌───────────┐ │
│ │          │  │                              │  │           │ │
│ │  Sidebar │  │       Workflow Canvas        │  │  Results  │ │
│ │          │  │                              │  │   Panel   │ │
│ │  - Tools │  │   [Add Node Button - Top]    │  │           │ │
│ │  - Logo  │  │                              │  │  [Videos] │ │
│ │  - User  │  │   ┌─────┐    ┌─────┐        │  │           │ │
│ │          │  │   │Node │───▶│Node │        │  │           │ │
│ │          │  │   └─────┘    └─────┘        │  │           │ │
│ │          │  │                              │  │           │ │
│ │ Credits: │  │   [Zoom Controls - Bottom]   │  │           │ │
│ │   47     │  │                              │  │           │ │
│ └──────────┘  └──────────────────────────────┘  └───────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 4. Workflow Canvas Features

- **Pan:** Click and drag on empty canvas
- **Zoom:** Mouse wheel or buttons (25% - 200%)
- **Add Node:** Button at top, shows dropdown menu
- **Drag Nodes:** Click and drag nodes freely
- **Connect Nodes:** Drag from output port to input port
- **Delete Node:** X button or Delete key
- **Node Types per Tool:**
  - LipSync: Image, Audio, Script, Voice, LipSync, Export
  - Sora 2: Reference, Prompt, Sora 2, Export
  - Veo 3: Reference, Prompt, Veo 3, Export
  - Avatar: Description, Avatar Gen, Export

---

## 🎨 Design System

### Colors (Dark Theme)

```css
:root {
  --black: #000000;
  --white: #ffffff;
  --gray-950: #050505;
  --gray-900: #0a0a0a;
  --gray-850: #0f0f0f;
  --gray-800: #161616;
  --gray-700: #222222;
  --gray-600: #333333;
  --gray-500: #4a4a4a;
  --gray-400: #6a6a6a;
  --gray-300: #8a8a8a;
  --green: #22c55e;
  --green-dark: #16a34a;
  --blue: #3b82f6;
  --purple: #8b5cf6;
  --orange: #f97316;
  --red: #ef4444;
}
```

### Typography
- Font: Inter (Google Fonts)
- Weights: 400, 500, 600, 700

---

## 🚀 Implementation Steps

### Phase 1: Setup
1. Create Next.js project with TypeScript
2. Install all dependencies
3. Configure Tailwind CSS
4. Setup shadcn/ui
5. Configure Supabase client
6. Configure Stripe client
7. Create database schema in Supabase

### Phase 2: Auth
1. Create login page with email + Google OAuth
2. Create signup page
3. Setup auth callback route
4. Create middleware for route protection
5. Test auth flow

### Phase 3: Payments
1. Create pricing page with 3 plan cards
2. Create Stripe checkout API route
3. Create Stripe webhook handler
4. Update user profile on successful subscription
5. Test payment flow end-to-end

### Phase 4: Dashboard
1. Create dashboard layout (3-column)
2. Build sidebar component
3. Build workflow canvas with zoom/pan
4. Build add node menu
5. Build workflow nodes (draggable)
6. Build node connections (SVG bezier curves)
7. Build results panel
8. Implement Zustand store for workflow state

### Phase 5: Polish
1. Add loading states
2. Add error handling
3. Add toast notifications
4. Test responsive design
5. Deploy to Vercel

---

## 📦 Package.json Dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "typescript": "5.x",
    
    "@supabase/supabase-js": "^2.x",
    "@supabase/auth-helpers-nextjs": "^0.x",
    "@supabase/ssr": "^0.x",
    
    "stripe": "^14.x",
    "@stripe/stripe-js": "^2.x",
    
    "tailwindcss": "^3.x",
    "class-variance-authority": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    
    "@radix-ui/react-slot": "^1.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-avatar": "^1.x",
    
    "lucide-react": "^0.x",
    "framer-motion": "^11.x",
    
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x",
    "@dnd-kit/utilities": "^3.x",
    
    "react-zoom-pan-pinch": "^3.x",
    
    "zustand": "^4.x",
    
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    
    "sonner": "^1.x",
    "date-fns": "^3.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x",
    "eslint": "^8.x",
    "eslint-config-next": "14.x"
  }
}
```

---

## 🔧 Commands to Start

```bash
# Create project
npx create-next-app@latest blacktools --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

cd blacktools

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
npm install stripe @stripe/stripe-js
npm install lucide-react framer-motion
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-zoom-pan-pinch
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install sonner date-fns
npm install class-variance-authority clsx tailwind-merge

# Setup shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card avatar dropdown-menu dialog select

# Create env file
touch .env.local
```

---

## 📝 Notes

1. **Language:** All UI text should be in English
2. **Currency:** USD only (Stripe checkout)
3. **Trial:** 1-day free trial for all plans
4. **Button Text:** "Start 1-Day free trial" on all plan buttons
5. **Flow:** Landing → Login/Signup → Pricing → Dashboard
6. **Focus:** Dashboard functionality and business logic first, landing page later

---

## 🎯 MVP Features Checklist

- [ ] Landing page (simple, just login button)
- [ ] Email + Google authentication
- [ ] User profile storage (email, name)
- [ ] Pricing page with 3 plans
- [ ] Stripe checkout with 1-day trial
- [ ] Subscription status check
- [ ] Dashboard with workflow editor
- [ ] Tool selection (LipSync, Sora 2, Veo 3, Avatar)
- [ ] Add/remove workflow nodes
- [ ] Drag nodes on canvas
- [ ] Connect nodes with lines
- [ ] Pan and zoom canvas
- [ ] Credits display
- [ ] Run workflow button (simulation)
- [ ] Results panel

---

Good luck! 🚀
