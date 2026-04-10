import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  CurrencyDollarIcon,
  StarIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import ChatModal from "../../components/ChatModal";
import { apiUrl } from "../../lib/apiUrl";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
}

interface Professional {
  id: string;
  business_name: string;
  service_category: string;
  rating: number;
  total_reviews: number;
  years_experience: number;
  hourly_rate: number;
  is_verified: boolean;
  is_available: boolean;
  profile_image_url?: string;
  description?: string;
  bio?: string;
  service_areas: string[];
}

interface JobMatch {
  id: string;
  job_id: string;
  professional_id: string;
  status: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    description: string;
    service_category: string;
    budget_min?: number;
    budget_max?: number;
    urgency: string;
    address: string;
    city: string;
    state: string;
    zip_code?: string;
    preferred_date?: string;
    created_at: string;
    customer: {
      firstName: string;
      lastName: string;
      profile_image_url?: string;
    };
  };
}

export default function ProfessionalDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatModal, setChatModal] = useState<{
    isOpen: boolean;
    matchId: string;
    otherUserName: string;
    jobTitle: string;
  }>({
    isOpen: false,
    matchId: "",
    otherUserName: "",
    jobTitle: "",
  });
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeMatches: 0,
    completedJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    responseRate: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    console.log(
      "Professional Dashboard useEffect - token:",
      token ? "exists" : "missing"
    );
    console.log(
      "Professional Dashboard useEffect - userData:",
      userData ? "exists" : "missing"
    );

    if (!token || !userData) {
      console.log("No token or userData, redirecting to login");
      router.push("/auth/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    console.log("Parsed user:", parsedUser);

    if (parsedUser.userType !== "professional") {
      console.log("Not a professional, redirecting to customer dashboard");
      router.push("/customer/dashboard");
      return;
    }

    console.log("Setting user and fetching data");
    setUser(parsedUser);
    fetchProfessionalData();
    fetchJobMatches();
  }, [router]);

  const fetchProfessionalData = async () => {
    try {
      console.log("fetchProfessionalData called");
      const token = localStorage.getItem("token");

      const response = await fetch(
        apiUrl("/api/professionals/profile"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Professional profile response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Professional data received:", data);
        setProfessional(data.professional);

        // Calculate stats
        setStats((prev) => ({
          ...prev,
          averageRating: data.professional?.rating || 0,
        }));
      } else {
        console.error(
          "Failed to fetch professional profile, status:",
          response.status
        );
        toast.error("Failed to load professional profile");
      }
    } catch (error) {
      console.error("Network error in fetchProfessionalData:", error);
      toast.error("Network error");
    }
  };

  const fetchJobMatches = async () => {
    try {
      console.log("fetchJobMatches called");
      const token = localStorage.getItem("token");

      const response = await fetch(
        apiUrl("/api/matches/my-matches"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Job matches response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Job matches data received:", data);

        const list = (data.matches || []) as JobMatch[];
        setJobMatches(list);

        const totalMatches = list.length;
        const activeMatches = list.filter((match: JobMatch) =>
          ["pending", "accepted"].includes(match.status)
        ).length;
        const completedJobs = list.filter(
          (match: JobMatch) => match.status === "completed"
        ).length;

        setStats((prev) => ({
          ...prev,
          totalMatches,
          activeMatches,
          completedJobs,
          responseRate:
            totalMatches > 0
              ? Math.round((activeMatches / totalMatches) * 100)
              : 0,
        }));
      } else {
        console.error("Failed to fetch job matches, status:", response.status);
        toast.error("Failed to load job matches");
      }
    } catch (error) {
      console.error("Network error in fetchJobMatches:", error);
      toast.error("Network error");
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openChat = (
    matchId: string,
    otherUserName: string,
    jobTitle: string
  ) => {
    setChatModal({
      isOpen: true,
      matchId,
      otherUserName,
      jobTitle,
    });
  };

  const closeChat = () => {
    setChatModal({
      isOpen: false,
      matchId: "",
      otherUserName: "",
      jobTitle: "",
    });
  };

  const handleMatchResponse = async (
    matchId: string,
    response: "accept" | "decline"
  ) => {
    try {
      const token = localStorage.getItem("token");
      const result = await fetch(
        apiUrl(`/api/matches/${matchId}/${response}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.ok) {
        toast.success(`Match ${response}ed successfully!`);
        fetchJobMatches(); // Refresh the matches
      } else {
        toast.error(`Failed to ${response} match`);
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Professional Dashboard - ServiceMatch</title>
        <meta
          name="description"
          content="Manage your professional profile and job matches"
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Professional Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your profile, view job matches, and grow your business
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <BriefcaseIcon className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Matches
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalMatches}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <EyeIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Matches
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeMatches}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Completed Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completedJobs}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.totalEarnings}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Profile Overview */}
          {professional && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-lg shadow p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Profile Overview
                </h2>
                <Link
                  href="/professional/profile/edit"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Edit Profile
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {professional.business_name}
                  </h3>
                  <p className="text-gray-600 capitalize">
                    {professional.service_category}
                  </p>
                  <div className="flex items-center mt-2">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">
                      {professional.rating &&
                      typeof professional.rating === "number"
                        ? professional.rating.toFixed(1)
                        : "0.0"}{" "}
                      ({professional.total_reviews || 0} reviews)
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="text-lg font-medium text-gray-900">
                    {professional.years_experience} years
                  </p>
                  <p className="text-sm text-gray-600">Hourly Rate</p>
                  <p className="text-lg font-medium text-gray-900">
                    ${professional.hourly_rate}/hr
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        professional.is_available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {professional.is_available ? "Available" : "Busy"}
                    </span>
                    {professional.is_verified && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  Business Description
                </p>
                <p className="text-gray-900 leading-relaxed">
                  {professional.description || professional.bio || "No business description added yet."}
                </p>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/professional/matches"
                className="btn-primary flex items-center"
              >
                <EyeIcon className="h-5 w-5 mr-2" />
                View All Matches
              </Link>
              <Link
                href="/professional/profile/edit"
                className="btn-secondary flex items-center"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Edit Profile
              </Link>
              <Link
                href="/professional/videos"
                className="btn-secondary flex items-center"
              >
                <VideoCameraIcon className="h-5 w-5 mr-2" />
                Manage Videos
              </Link>
            </div>
          </div>

          {/* Recent Job Matches */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Job Matches
              </h2>
            </div>
            <div className="p-6">
              {jobMatches.length === 0 ? (
                <div className="text-center py-12">
                  <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No matches yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Complete your profile to start receiving job matches
                  </p>
                  <Link
                    href="/professional/profile/edit"
                    className="btn-primary"
                  >
                    Complete Profile
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobMatches.slice(0, 5).map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {match.job.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                match.status
                              )}`}
                            >
                              {match.status}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(
                                match.job.urgency
                              )}`}
                            >
                              {match.job.urgency}
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm mb-2">
                            {match.job.description.length > 100
                              ? `${match.job.description.substring(0, 100)}...`
                              : match.job.description}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              Client: {match.job.customer.firstName}{" "}
                              {match.job.customer.lastName}
                            </span>
                            <span>
                              {match.job.city}, {match.job.state}
                            </span>
                            {match.job.budget_min && match.job.budget_max && (
                              <span>
                                ${match.job.budget_min} - $
                                {match.job.budget_max}
                              </span>
                            )}
                            <span>
                              Posted {formatDate(match.job.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-6">
                          {match.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleMatchResponse(match.id, "accept")
                                }
                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors duration-200"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleMatchResponse(match.id, "decline")
                                }
                                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors duration-200"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          <Link
                            href={`/professional/matches/${match.id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View Details
                          </Link>
                          {match.status === "accepted" && (
                            <button
                              onClick={() =>
                                openChat(
                                  match.id,
                                  `${match.job.customer.firstName} ${match.job.customer.lastName}`,
                                  match.job.title
                                )
                              }
                              className="bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center text-sm"
                            >
                              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                              Message
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={closeChat}
        matchId={chatModal.matchId}
        currentUserId={user?.id || ""}
        token={localStorage.getItem("token") || ""}
        otherUserName={chatModal.otherUserName}
        jobTitle={chatModal.jobTitle}
      />
    </>
  );
}
