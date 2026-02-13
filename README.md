# BillBuster

AI-powered bill analysis app. Snap a photo of any bill, let AI find hidden charges and overpriced line items, then get a ready-to-use phone script to negotiate your bill down.

## How It Works

1. **Snap** — Take a photo of your bill or pick one from your library
2. **Analyze** — AI reads every line item and identifies overcharges, hidden fees, pricing errors, and unnecessary services
3. **Save** — Get a step-by-step negotiation script to call your provider and reduce your bill

## Features

- **Multi-provider AI** — Bring your own API key for OpenAI GPT-4o, Anthropic Claude, or OpenRouter
- **Bill categories** — Phone, internet, cable, electric, gas, water, insurance, medical, subscription
- **Risk scoring** — Each bill gets a 0-100 risk score with severity-rated findings
- **Negotiation scripts** — Generated phone scripts with sections: Opening, State Your Case, Negotiate, Close the Deal, If They Say No
- **Savings tracking** — Dashboard with total savings, per-bill average, and projected annual savings
- **Fully local** — All data stored on-device (SQLite), API keys in iOS Keychain
- **Polished UI** — Gradient cards, animated counters, haptic feedback, staggered entrance animations, custom loading spinner

## Tech Stack

- **Framework** — [Expo](https://expo.dev) (SDK 54) + [React Native](https://reactnative.dev) 0.81
- **Routing** — [Expo Router](https://docs.expo.dev/router/introduction/) (file-based)
- **State** — [Zustand](https://zustand-demo.pmnd.rs/) with AsyncStorage persistence
- **Styling** — [NativeWind](https://www.nativewind.dev/) (Tailwind for RN) + inline styles
- **Database** — [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Secure storage** — [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) (iOS Keychain)
- **Animations** — React Native Animated API + [expo-haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- **Language** — TypeScript

## Project Structure

```
app/
  (tabs)/           # Tab navigation
    index.tsx       # Scan tab (home)
    history.tsx     # Bill history
    savings.tsx     # Savings dashboard
    settings.tsx    # AI provider & API keys
  scan/             # Modal scan flow
    review.tsx      # Photo selection
    analyzing.tsx   # Loading experience
    results.tsx     # Analysis results
    script.tsx      # Negotiation script
src/
  components/
    ui/             # FadeIn, AnimatedCounter, GradientCard, ScreenHeader, etc.
    bill/           # AnalysisSummary, FindingCard, LineItemCard
  hooks/            # useAnalysis, useCamera, useUsageGate
  models/           # TypeScript interfaces (Bill, Analysis, Script, Settings)
  services/
    ai/             # OpenAI, Anthropic, OpenRouter providers + key validator
    storage/        # SQLite database + bill repository + secure storage
    billing/        # Usage tracking (free tier)
  stores/           # Zustand stores (bill, history, savings, settings)
  theme/            # Colors, typography, spacing constants
  utils/            # Haptics helpers
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (Xcode) or physical device with [Expo Go](https://expo.dev/go)

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npx expo start

# Run on iOS
npx expo start --ios
```

### Configure AI Provider

1. Open the app and go to the **Settings** tab
2. Select your AI provider (OpenRouter, OpenAI, or Anthropic)
3. Paste your API key — it's stored securely in the iOS Keychain
4. Hit **Test** to verify the key works

## License

MIT
