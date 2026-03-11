# Product Requirements Document (PRD): SmartTaxCalculator with Investment Features

## 1. Overview
This document outlines the product requirements for enhancing the SmartTaxCalculator website with a comprehensive Investment Dashboard and related features. The goal is to evolve the platform from a tax utility to a holistic financial management hub.

## 2. Website Structure Enhancement
To support the new features and improve overall usability:
*   **Navigation System**:
    *   Responsive top navigation bar with clear hierarchy.
    *   Mega-menus for grouped features (e.g., "Calculators", "Investment", "Learn").
    *   Mobile-friendly hamburger menu with accordion-style sub-menus.
*   **Component Library**:
    *   Develop a modular UI kit (buttons, cards, inputs, charts) based on Shadcn/UI or similar.
    *   Ensure consistent typography, spacing, and color usage.
*   **Breadcrumbs**:
    *   Implement automatic breadcrumb generation for deep navigation paths (e.g., Home > Investment > Stock Analysis).
*   **Theming**:
    *   Global Dark/Light mode toggle persisted via local storage/user preferences.

## 3. New Core Pages & Sections

### 3.1 Investment Dashboard (Primary Feature)
A centralized hub for user investments.
*   **Portfolio Overview**:
    *   Interactive total value chart (Line/Area chart).
    *   Daily/Monthly P&L indicators.
*   **Asset Allocation**:
    *   Donut chart visualizing distribution (Stocks, Mutual Funds, Gold, etc.).
*   **Performance Metrics**:
    *   XIRR, CAGR, and absolute returns calculation.
    *   Comparison against benchmark indices (Nifty 50, Sensex).
*   **Goal Tracking**:
    *   Progress bars for specific financial goals (e.g., "Retirement", "New Home").

### 3.2 Detailed Stock/Asset Pages
Dedicated pages for individual assets.
*   **Market Data**:
    *   Real-time (or near real-time) price charts with selectable timeframes (1D, 1W, 1M, 1Y, 5Y).
    *   Technical indicators overlay (MA, RSI, Bollinger Bands).
*   **Analysis**:
    *   Fundamental data table (P/E, Market Cap, Dividend Yield).
    *   SWOT analysis or automated ratings.
*   **Sentiment**:
    *   Integration of news feeds related to the specific asset.
    *   Sentiment score gauge.

### 3.3 Educational Resources
A learning center to drive engagement and trust.
*   **Content Library**:
    *   Articles and guides categorized by difficulty (Beginner, Intermediate, Advanced).
*   **Video Modules**:
    *   Embedded video tutorials for complex topics.
*   **Glossary**:
    *   Searchable dictionary of financial terms.

### 3.4 User Profile Management
Enhanced settings for personalization.
*   **Account Settings**: Profile details, password management.
*   **Preferences**: Notification settings (email/SMS/push), theme preference.
*   **Documents**: Secure upload area for KYC and tax documents.

## 4. Functional Features (Investment Section)

*   **Market Data Integration**:
    *   Connect with third-party APIs (e.g., Alpha Vantage, Yahoo Finance, or Indian market data providers) for live data.
*   **Portfolio Simulation**:
    *   "What-if" scenarios to project future value based on expected returns.
*   **Risk Assessment**:
    *   Interactive questionnaire to determine user risk profile (Conservative, Balanced, Aggressive).
*   **Strategy Suggestions**:
    *   Automated recommendations based on risk profile and goals.
*   **Tax Optimization**:
    *   Capital Gains Tax calculator integrated with portfolio data.
    *   Tax-loss harvesting opportunities.
*   **Dividend Tracking**:
    *   Calendar view of upcoming and past dividends.
*   **Watchlist**:
    *   Custom watchlists with price alert thresholds.

## 5. Technical Architecture

### 5.1 Tech Stack
*   **Frontend**: React.js / Next.js (TypeScript).
*   **State Management**: Redux Toolkit or Zustand / React Query for server state.
*   **Visualization**: Chart.js or Recharts (D3.js based) for responsive charts.
*   **Styling**: Tailwind CSS for rapid, responsive styling.

### 5.2 Backend & Data
*   **Authentication**: JWT-based secure access.
*   **API**: RESTful architecture.
*   **Real-time**: WebSocket (Socket.io) for live price updates.
*   **Database**: PostgreSQL / MongoDB for user data and portfolio tracking.

### 5.3 Standards
*   **Responsiveness**: Mobile-first design approach ensuring usability on all devices.
*   **Accessibility**: WCAG 2.1 AA compliance (aria-labels, keyboard navigation, contrast ratios).

## 6. Quality Assurance Standards
*   **Testing**:
    *   Unit Testing: Jest + React Testing Library (Target: >95% coverage).
    *   E2E Testing: Cypress or Playwright.
*   **Performance**:
    *   Core Web Vitals optimization.
    *   Lighthouse score >90 (Performance, Accessibility, SEO, Best Practices).
    *   Load time <2s for LCP.
*   **Compatibility**: Chrome, Firefox, Safari, Edge (last 2 versions).
*   **Security**: HTTPS, Input validation, Data encryption at rest and in transit.

## 7. Implementation Roadmap

### Phase 1: Core Foundation (4 Weeks)
*   Setup project structure and component library.
*   Implement Authentication & Profile Management.
*   Develop Investment Dashboard shell.
*   Basic Portfolio Overview.

### Phase 2: Asset Tools & Data (3 Weeks)
*   Integrate Market Data APIs.
*   Build Detailed Stock/Asset Pages.
*   Implement Watchlist and Price Alerts.

### Phase 3: Education & Refinement (2 Weeks)
*   Build Educational Resources section.
*   Implement Risk Assessment & Strategy tools.
*   Tax Optimization calculators.

### Phase 4: Polish & Launch (2 Weeks)
*   Comprehensive Testing (Unit, E2E, UAT).
*   Performance Optimization.
*   Security Audit.
*   Deployment.

## 8. Success Metrics (KPIs)
*   **Engagement**: Average session duration on investment pages > 5 minutes.
*   **Retention**: 20% increase in return visits to the investment section.
*   **Conversion**: Click-through rate on "Start Investing" or strategy suggestions.
*   **Satisfaction**: Net Promoter Score (NPS) > 40 from user feedback.
*   **Support**: Maintain < 1% error rate in data fetching/display.
