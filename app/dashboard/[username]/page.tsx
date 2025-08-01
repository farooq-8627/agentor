"use client";

import { MenuBar } from "@/components/UI/glow-menu";
import { AgentProfileTab } from "@/components/Dashboard/AgentProfileTab";
import { ClientProfileTab } from "@/components/Dashboard/ClientProfileTab";
import { UserCircle2, Users } from "lucide-react";
import React, { useState, useMemo } from "react";
import { AgentProfile, ClientProfile } from "@/types";
import { useUserProfilesByUsername } from "@/hooks/useUserProfilesByUsername";
import { ProfileBannerCard } from "@/components/Dashboard/ProfileBannerCard";
import { AboutCard } from "@/components/Dashboard/ProfileCards/AboutCard";
import { useUser } from "@/hooks/useUser";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { PostSection } from "@/components/Dashboard/ProfileCards/Feed/PostSection";
import { FeedPost } from "@/types/Posts";
import { Post } from "@/types/post";
import { User } from "@/types/User";
import { RecommendationSidebar } from "@/components/recommendations/RecommendationSidebar";

// Memoize menu items since they never change
const menuItems = [
  {
    icon: UserCircle2,
    label: "Agent Profile",
    href: "#agent",
    gradient: "rgba(59, 130, 246, 0.2), transparent 80%",
    iconColor: "text-blue-500",
  },
  {
    icon: Users,
    label: "Client Profile",
    href: "#client",
    gradient: "rgba(139, 92, 246, 0.2), transparent 80%",
    iconColor: "text-purple-500",
  },
];

export default function DashboardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const unwrappedParams = React.use(params);

  const { agentProfiles, clientProfiles, loading, error } =
    useUserProfilesByUsername(unwrappedParams.username);
  const { user: userProfile, isLoading: userLoading } = useUser(
    unwrappedParams.username
  );
  const { user: currentUser } = useClerkUser();

  // Determine which profiles exist
  const hasAgentProfile = useMemo(
    () => agentProfiles?.length > 0,
    [agentProfiles]
  );
  const hasClientProfile = useMemo(
    () => clientProfiles?.length > 0,
    [clientProfiles]
  );
  const hasBothProfiles = useMemo(
    () => hasAgentProfile && hasClientProfile,
    [hasAgentProfile, hasClientProfile]
  );

  // Always start with Agent Profile when both profiles exist
  const [activeTab, setActiveTab] = useState<string>("Agent Profile");

  // Memoize the current user check
  const isCurrentUser = useMemo(
    () => currentUser?.username === unwrappedParams.username,
    [currentUser?.username, unwrappedParams.username]
  );

  // Remove the first loading state - let components handle their own loading
  if (loading || userLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Loading */}
            <div className="lg:col-span-3 space-y-4">
              <div className="animate-pulse">
                {/* Banner skeleton */}
                <div className="h-[200px] bg-white/5 rounded-lg mb-8" />
                {/* About section skeleton */}
                <div className="h-[100px] bg-white/5 rounded-lg mb-8" />
                {/* Post section skeleton */}
                <div className="h-[300px] bg-white/5 rounded-lg" />
              </div>
            </div>

            {/* Sidebar Loading */}
            <div className="lg:col-span-1">
              <div className="animate-pulse">
                <div className="h-[400px] bg-white/5 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Error loading profile</p>
          </div>
        </div>
      </div>
    );
  }

  // Function to render the active profile tab
  const renderProfileTab = () => {
    if (!hasAgentProfile && !hasClientProfile) {
      return (
        <div className="text-center text-gray-400 py-8">
          No profiles available
        </div>
      );
    }

    // If only agent profile exists, always show agent
    if (hasAgentProfile && !hasClientProfile) {
      return (
        <AgentProfileTab
          profiles={agentProfiles as AgentProfile[]}
          isCurrentUser={isCurrentUser}
        />
      );
    }

    // If only client profile exists, always show client
    if (!hasAgentProfile && hasClientProfile) {
      return (
        <ClientProfileTab
          profiles={clientProfiles as ClientProfile[]}
          isCurrentUser={isCurrentUser}
        />
      );
    }

    // If both profiles exist, show based on active tab
    if (activeTab === "Agent Profile") {
      return (
        <AgentProfileTab
          profiles={agentProfiles as AgentProfile[]}
          isCurrentUser={isCurrentUser}
        />
      );
    }

    if (activeTab === "Client Profile") {
      return (
        <ClientProfileTab
          profiles={clientProfiles as ClientProfile[]}
          isCurrentUser={isCurrentUser}
        />
      );
    }

    // Default fallback to agent profile
    return (
      <AgentProfileTab
        profiles={agentProfiles as AgentProfile[]}
        isCurrentUser={isCurrentUser}
      />
    );
  };

  return (
    <div className="min-h-screen" style={{ contain: "layout style" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div
            className="lg:col-span-3 space-y-6 scroll-container"
            style={{
              // Optimize for scroll performance
              willChange: "scroll-position",
              contain: "layout style paint",
            }}
          >
            {/* Profile Banner */}
            {userProfile && (
              <div className="min-h-[200px]">
                <ProfileBannerCard
                  bannerImage={
                    userProfile.personalDetails?.bannerImage?.asset?.url || ""
                  }
                  profilePicture={
                    userProfile.personalDetails?.profilePicture?.asset?.url ||
                    ""
                  }
                  fullName={userProfile.coreIdentity?.fullName || ""}
                  username={userProfile.personalDetails?.username || ""}
                  website={userProfile.personalDetails?.website || ""}
                  bio={userProfile.coreIdentity?.bio || ""}
                  tagline={userProfile.coreIdentity?.tagline || ""}
                  location={userProfile.profileDetails?.location}
                  socialLinks={userProfile.personalDetails?.socialLinks}
                  isCurrentUser={isCurrentUser}
                />
              </div>
            )}

            {/* About Section */}
            {userProfile?.coreIdentity?.bio && (
              <div className="mb-8 min-h-[100px]">
                <AboutCard
                  bio={userProfile.coreIdentity.bio}
                  isCurrentUser={isCurrentUser}
                />
              </div>
            )}

            {/* Post Section */}
            {userProfile && (
              <div className="min-h-[300px]">
                <PostSection
                  posts={userProfile.posts as unknown as Post[]}
                  username={userProfile.personalDetails?.username || ""}
                  isCurrentUser={isCurrentUser}
                  profileId={userProfile._id}
                  user={userProfile as unknown as User}
                />
              </div>
            )}

            {/* Profile Tabs */}
            <div className="w-full mb-8">
              {/* Only show menu if user has both profiles */}
              {hasBothProfiles && (
                <div className="max-w-2xl mx-auto mb-8">
                  <MenuBar
                    items={menuItems}
                    activeItem={activeTab}
                    onItemClick={setActiveTab}
                    className="w-full"
                  />
                </div>
              )}

              <div className="mt-6">{renderProfileTab()}</div>
            </div>
          </div>

          {/* Recommendation Sidebar */}
          <div className="lg:col-span-1">
            <div>
              {/* Only show recommendations for current user */}
              {isCurrentUser && (
                <RecommendationSidebar
                  maxItemsPerSection={2}
                  showHeader={true}
                  className="mb-6"
                  loading={loading || userLoading}
                />
              )}

              {/* You can add more sidebar widgets here */}
              {/* <div className="mt-6">
                <OtherSidebarWidget />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
