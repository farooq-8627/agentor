import {
  INDUSTRY_DOMAINS,
  AGENT_AUTOMATION_SERVICES,
  AGENT_TOOLS_EXPERTISE,
  CLIENT_AUTOMATION_NEEDS,
  CLIENT_CURRENT_TOOLS,
} from "@/sanity/schemaTypes/constants";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-03-21",
  useCdn: true,
});

// Recommendation types
export interface Recommendation {
  id: string;
  type:
    | "agent"
    | "client"
    | "tool"
    | "industry"
    | "service"
    | "project"
    | "company";
  title: string;
  description: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  metadata?: {
    industry?: string;
    tools?: string[];
    services?: string[];
    profileId?: string;
    location?: string;
    experienceLevel?: string;
    budgetRange?: string;
    username?: string;
    profilePicture?: string;
    rating?: number;
    completedProjects?: number;
    availability?: string;
    companyId?: string;
  };
}

export interface RecommendationSection {
  title: string;
  subtitle: string;
  recommendations: Recommendation[];
  icon: string;
}

export interface UserRecommendations {
  agents: RecommendationSection;
  clients: RecommendationSection;
  companies: RecommendationSection;
}

// User profile interface for recommendations
interface UserProfileForRecommendations {
  _id: string;
  hasAgentProfile: boolean;
  hasClientProfile: boolean;
  agentProfiles?: Array<{
    _id: string;
    automationExpertise?: {
      automationServices: string[];
      toolsExpertise: string[];
    };
    businessDetails?: {
      availability: string;
      workType: string;
      projectSizePreferences?: string[];
      pricingModel?: string;
      teamSize?: string;
    };
  }>;
  clientProfiles?: Array<{
    _id: string;
    automationNeeds?: {
      automationRequirements: string[];
      currentTools: string[];
    };
  }>;
  profileDetails?: {
    location?: {
      cityState: string;
      country: string;
    };
  };
  companies?: Array<{
    _id: string;
    name: string;
  }>;
}

export class RecommendationEngine {
  /**
   * Main method to generate personalized recommendations
   */
  static async generateRecommendations(
    user: UserProfileForRecommendations
  ): Promise<UserRecommendations> {
    const [
      agentRecommendations,
      clientRecommendations,
      companyRecommendations,
    ] = await Promise.all([
      this.fetchAgentRecommendations(user),
      this.fetchClientRecommendations(user),
      this.fetchCompanyRecommendations(user),
    ]);

    return {
      agents: {
        title: "Recommended Agents",
        subtitle: "Top agents matching your requirements",
        recommendations: agentRecommendations,
        icon: "👥",
      },
      clients: {
        title: "Potential Clients",
        subtitle: "Clients looking for your expertise",
        recommendations: clientRecommendations,
        icon: "🎯",
      },
      companies: {
        title: "Featured Companies",
        subtitle: "Leading automation companies",
        recommendations: companyRecommendations,
        icon: "🏢",
      },
    };
  }

  /**
   * Fetch agent recommendations
   */
  private static async fetchAgentRecommendations(
    user: UserProfileForRecommendations
  ): Promise<Recommendation[]> {
    // Show agents for all users based on interests, not just clients
    try {
      const agents = await this.fetchMatchingAgents(user);

      const userNeeds =
        user.clientProfiles?.[0]?.automationNeeds?.automationRequirements || [];
      const userTools =
        user.clientProfiles?.[0]?.automationNeeds?.currentTools || [];

      return agents.map((agent: any, index: number) => ({
        id: `agent-${agent._id || index}`,
        type: "agent" as const,
        title:
          agent.name || agent.personalDetails?.username || `Agent ${index + 1}`,
        description: agent.bio || "Experienced automation specialist",
        matchScore: 85 - index * 5,
        matchReasons: this.generateAgentMatchReasons(
          agent,
          userNeeds,
          userTools
        ),
        metadata: {
          profileId: agent._id,
          username: agent.username || agent.personalDetails?.username,
          profilePicture:
            agent.profilePicture ||
            agent.personalDetails?.profilePicture?.asset?.url,
          location: agent.location || agent.profileDetails?.location?.cityState,
          experienceLevel: agent.experienceLevel,
          availability: agent.availability,
          rating: agent.rating || 4.5,
          completedProjects: agent.completedProjects || 10,
        },
      }));
    } catch (error) {
      console.error("Error fetching agent recommendations:", error);
      return [];
    }
  }

  /**
   * Fetch client recommendations
   */
  private static async fetchClientRecommendations(
    user: UserProfileForRecommendations
  ): Promise<Recommendation[]> {
    // Show clients for all users based on interests, not just agents
    try {
      const clients = await this.fetchPotentialClients(user);

      const userServices =
        user.agentProfiles?.[0]?.automationExpertise?.automationServices || [];
      const userTools =
        user.agentProfiles?.[0]?.automationExpertise?.toolsExpertise || [];

      return clients.map((client: any, index: number) => ({
        id: `client-${client._id || index}`,
        type: "client" as const,
        title:
          client.name ||
          client.personalDetails?.username ||
          `Client ${index + 1}`,
        description: client.description || "Looking for automation solutions",
        matchScore: 80 - index * 5,
        matchReasons: this.generateMatchReasons(
          userServices,
          userTools,
          client
        ),
        metadata: {
          profileId: client._id,
          username: client.username || client.personalDetails?.username,
          profilePicture:
            client.profilePicture ||
            client.personalDetails?.profilePicture?.asset?.url,
          location:
            client.location || client.profileDetails?.location?.cityState,
          budgetRange: client.budgetRange,
          industry: client.industry,
        },
      }));
    } catch (error) {
      console.error("Error fetching client recommendations:", error);
      return [];
    }
  }

  /**
   * Fetch company recommendations
   */
  private static async fetchCompanyRecommendations(
    user: UserProfileForRecommendations
  ): Promise<Recommendation[]> {
    // Show companies for all users
    try {
      const companies = await this.fetchFeaturedCompanies(user);
      return companies.map((company: any, index: number) => ({
        id: `company-${company._id || index}`,
        type: "company" as const,
        title: company.name || `Company ${index + 1}`,
        description: company.description || "Leading automation company",
        matchScore: 75 - index * 5,
        matchReasons: ["Industry match", "Growth opportunity", "Active hiring"],
        metadata: {
          companyId: company._id,
          industry: company.industry,
          location: company.location,
          profilePicture: company.logo,
        },
      }));
    } catch (error) {
      console.error("Error fetching company recommendations:", error);
      return [];
    }
  }

  /**
   * Fetch featured companies from Sanity
   */
  private static async fetchFeaturedCompanies(
    user: UserProfileForRecommendations
  ) {
    const query = `*[_type == "company"] | order(_createdAt desc)[0...10] {
      _id,
      name,
      description,
      industry,
      "logo": logo.asset->url,
      location
    }`;

    try {
      return await client.fetch(query);
    } catch (error) {
      console.error("Error fetching companies:", error);
      return [];
    }
  }

  // Helper methods for generating match reasons
  private static generateMatchReasons(
    userServices: string[],
    userTools: string[],
    client: any
  ): string[] {
    const reasons = [];

    // Ensure userServices and userTools are arrays
    const safeUserServices = Array.isArray(userServices) ? userServices : [];
    const safeUserTools = Array.isArray(userTools) ? userTools : [];

    const clientNeeds = client.automationNeeds?.automationRequirements || [];
    const clientTools = client.automationNeeds?.currentTools || [];

    if (safeUserServices.some((service) => clientNeeds.includes(service))) {
      reasons.push("Service expertise match");
    }
    if (safeUserTools.some((tool) => clientTools.includes(tool))) {
      reasons.push("Tool compatibility");
    }
    if (client.profileDetails?.location) {
      reasons.push("Location preference");
    }

    return reasons.length > 0 ? reasons : ["General compatibility"];
  }

  private static generateAgentMatchReasons(
    agent: any,
    userNeeds: string[],
    userTools: string[]
  ): string[] {
    const reasons = [];

    // Ensure userNeeds and userTools are arrays
    const safeUserNeeds = Array.isArray(userNeeds) ? userNeeds : [];
    const safeUserTools = Array.isArray(userTools) ? userTools : [];

    const agentServices = agent.automationExpertise?.automationServices || [];
    const agentTools = agent.automationExpertise?.toolsExpertise || [];

    if (safeUserNeeds.some((need) => agentServices.includes(need))) {
      reasons.push("Expertise in your needs");
    }
    if (safeUserTools.some((tool) => agentTools.includes(tool))) {
      reasons.push("Familiar with your tools");
    }
    if (agent.businessDetails?.availability) {
      reasons.push("Available for projects");
    }

    return reasons.length > 0 ? reasons : ["General expertise"];
  }

  private static getTrendingServices(userServices: string[]) {
    return AGENT_AUTOMATION_SERVICES.filter(
      (service) => !userServices.includes(service.value)
    ).slice(0, 2);
  }

  private static getEmergingIndustries() {
    return INDUSTRY_DOMAINS.slice(5, 8); // Get some industries as "emerging"
  }

  // Data fetching methods - Updated to work with new structure
  private static async fetchMatchingAgents(
    user: UserProfileForRecommendations
  ) {
    try {
      // Extract user needs and tools from the user profile
      const userNeeds =
        user.clientProfiles?.[0]?.automationNeeds?.automationRequirements || [];
      const userTools =
        user.clientProfiles?.[0]?.automationNeeds?.currentTools || [];

      // Updated query to check for profile count and exclude current user
      const query = `*[_type == "user" && count(agentProfiles) > 0 && _id != "${user._id}"] {
        _id,
        personalDetails {
          username,
          profilePicture {
            asset-> { url }
          }
        },
        profileDetails {
          location
        },
        "automationExpertise": agentProfiles[0]->automationExpertise,
        "businessDetails": agentProfiles[0]->businessDetails
      }[0...10]`;

      const agents = await client.fetch(query);

      return agents;
    } catch (error) {
      console.error("Error fetching matching agents:", error);
      return [];
    }
  }

  private static async fetchPotentialClients(
    user: UserProfileForRecommendations
  ) {
    try {
      // Extract user services and tools from agent profile
      const userServices =
        user.agentProfiles?.[0]?.automationExpertise?.automationServices || [];
      const userTools =
        user.agentProfiles?.[0]?.automationExpertise?.toolsExpertise || [];

      // Updated query to check for profile count and exclude current user
      const query = `*[_type == "user" && count(clientProfiles) > 0 && _id != "${user._id}"] {
        _id,
        personalDetails {
          username,
          profilePicture {
            asset-> { url }
          }
        },
        profileDetails {
          location
        },
        "automationNeeds": clientProfiles[0]->automationNeeds
      }[0...10]`;

      const clients = await client.fetch(query);

      return clients;
    } catch (error) {
      console.error("Error fetching potential clients:", error);
      return [];
    }
  }

  private static async fetchTrendingProjects() {
    try {
      const query = `*[_type == "clientProject" && defined(title)] | order(createdAt desc) {
        _id,
        title,
        description,
        budgetRange,
        businessDomain,
        createdAt
      }[0...5]`;

      return await client.fetch(query);
    } catch (error) {
      console.error("Error fetching trending projects:", error);
      return [];
    }
  }

  private static async fetchSimilarAgents(
    userId: string,
    userServices: string[],
    userTools: string[]
  ) {
    try {
      const query = `*[_type == "user" && hasAgentProfile == true && _id != $userId] {
        _id,
        personalDetails {
          username,
          profilePicture {
            asset-> { url }
          }
        },
        "automationExpertise": agentProfiles[0]->automationExpertise
      }[0...5]`;

      return await client.fetch(query, { userId });
    } catch (error) {
      console.error("Error fetching similar agents:", error);
      return [];
    }
  }

  private static async fetchTopAgents() {
    try {
      const query = `*[_type == "user" && hasAgentProfile == true] {
        _id,
        personalDetails {
          username,
          profilePicture {
            asset-> { url }
          }
        }
      }[0...5]`;

      return await client.fetch(query);
    } catch (error) {
      console.error("Error fetching top agents:", error);
      return [];
    }
  }

  private static async fetchTrendingServices() {
    return AGENT_AUTOMATION_SERVICES.slice(0, 3);
  }

  private static async fetchPopularServices() {
    return AGENT_AUTOMATION_SERVICES.slice(0, 3);
  }

  private static async fetchRecommendedTools(currentTools: string[]) {
    // Return tools not currently used by the client
    return AGENT_TOOLS_EXPERTISE.filter(
      (tool) => !currentTools.includes(tool.value)
    ).slice(0, 3);
  }

  /**
   * Filter recommendations by type
   */
  static filterRecommendationsByType(
    recommendations: UserRecommendations,
    type: Recommendation["type"]
  ): Recommendation[] {
    const allRecommendations = [
      ...recommendations.agents.recommendations,
      ...recommendations.clients.recommendations,
      ...recommendations.companies.recommendations,
    ];

    return allRecommendations.filter((rec) => rec.type === type);
  }

  /**
   * Get top recommendations across all sections
   */
  static getTopRecommendations(
    recommendations: UserRecommendations,
    limit: number = 5
  ): Recommendation[] {
    const allRecommendations = [
      ...recommendations.agents.recommendations,
      ...recommendations.clients.recommendations,
      ...recommendations.companies.recommendations,
    ];

    return allRecommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }
}
