# Recommendation System

A LinkedIn-style recommendation sidebar that shows personalized recommendations for agents, clients, and companies based on user profiles and interests.

## Features

- **Real-time Data**: Fetches actual data from Sanity CMS
- **Personalized Recommendations**: Based on user's agent/client profiles and interests
- **Three Sections**:
  - 👥 Recommended Agents
  - 🎯 Potential Clients
  - 🏢 Featured Companies
- **Smart Navigation**: Clicks navigate to respective profile pages
- **Global State**: Synchronized across feed and dashboard pages
- **Performance Optimized**: Memoized components and efficient data loading

## Implementation

### Core Components

1. **RecommendationEngine** (`lib/recommendation-engine.ts`)
   - Generates personalized recommendations
   - Fetches data from Sanity database
   - Calculates match scores and reasons

2. **RecommendationSidebar** (`components/recommendations/RecommendationSidebar.tsx`)
   - LinkedIn-style sidebar UI
   - Global state management
   - Sticky scroll behavior
   - Refresh functionality

### Integration

The sidebar is integrated into:

- `/app/feed/page.tsx` - Feed page
- `/app/dashboard/[username]/page.tsx` - Dashboard page

### Data Sources

- **Agents**: Users with `count(agentProfiles) > 0`
- **Clients**: Users with `count(clientProfiles) > 0`
- **Companies**: All companies from Sanity

### Navigation

- **Agents**: `/dashboard/[username]` or `/agents/[profileId]`
- **Clients**: `/dashboard/[username]` or `/clients/[profileId]`
- **Companies**: `/companies/[companyId]`

## Usage

```tsx
<RecommendationSidebar
  loading={isLoading}
  maxItemsPerSection={4}
  showHeader={true}
/>
```

The component automatically handles user data, loading states, and navigation.
