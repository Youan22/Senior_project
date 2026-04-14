import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
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

interface Job {
  id: string;
  title: string;
  description: string;
  service_category: string;
  status: string;
  budget_min?: number;
  budget_max?: number;
  urgency: string;
  created_at: string;
  updated_at: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [unreadByMatch, setUnreadByMatch] = useState<Record<string, number>>({});
  const [totalUnread, setTotalUnread] = useState(0);
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
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalMatches: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    console.log("Dashboard useEffect - token:", token ? "exists" : "missing");
    console.log(
      "Dashboard useEffect - userData:",
      userData ? "exists" : "missing"
    );

    if (!token || !userData) {
      console.log("No token or userData, redirecting to login");
      router.push("/auth/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    console.log("Parsed user:", parsedUser);

    if (parsedUser.userType !== "customer") {
      console.log("Not a customer, redirecting to professional dashboard");
      router.push("/professional/dashboard");
      return;
    }

    console.log("Setting user and fetching jobs");
    setUser(parsedUser);
    fetchJobs();
    fetchMatches();
    fetchUnreadSummary();
  }, [router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchUnreadSummary();
      }
    }, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      console.log("fetchJobs called");
      const token = localStorage.getItem("token");
      console.log("Token for API call:", token ? "exists" : "missing");

      const response = await fetch(apiUrl("/api/jobs/my-jobs"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Jobs data received:", data);
        setJobs(data.jobs);

        // Calculate stats
        const totalJobs = data.jobs.length;
        const activeJobs = data.jobs.filter((job: Job) =>
          ["open", "matched", "in_progress"].includes(job.status)
        ).length;
        const completedJobs = data.jobs.filter(
          (job: Job) => job.status === "completed"
        ).length;

        setStats({
          totalJobs,
          activeJobs,
          completedJobs,
          totalMatches: 0, // TODO: Calculate from matches
        });
        console.log("Jobs and stats set successfully");
      } else {
        console.error("Failed to fetch jobs, status:", response.status);
        toast.error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Network error in fetchJobs:", error);
      toast.error("Network error");
    } finally {
      console.log("Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        apiUrl("/api/matches/customer"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const list = data.matches || [];
        setMatches(list);
        setStats((prev) => ({ ...prev, totalMatches: list.length }));
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    }
  };

  const handleCustomerDecision = async (
    matchId: string,
    action: "like" | "pass"
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(apiUrl(`/api/matches/${matchId}/swipe`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        toast.error("Failed to update match decision");
        return;
      }

      toast.success(action === "like" ? "Match accepted" : "Match declined");
      fetchMatches();
    } catch (error) {
      console.error("Failed to update customer match decision:", error);
      toast.error("Network error");
    }
  };

  const fetchUnreadSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(apiUrl("/api/messages/unread-summary"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadByMatch(data.byMatch || {});
        setTotalUnread(data.totalUnread || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread summary:", error);
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
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "matched":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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
    fetchUnreadSummary();
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
        <title>Dashboard - ServiceMatch</title>
        <meta
          name="description"
          content="Manage your service requests and find professionals"
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your service requests and connect with professionals
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
                <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalJobs}
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
                <ClockIcon className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeJobs}
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
                  <p className="text-sm font-medium text-gray-600">Completed</p>
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
                <div className="relative">
                  <EyeIcon className="h-8 w-8 text-blue-600" />
                  {totalUnread > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center font-semibold">
                      {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Matches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalMatches}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/customer/jobs/new"
                className="btn-primary flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Post New Job
              </Link>
              <Link
                href="/customer/jobs"
                className="btn-secondary flex items-center"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                View All Jobs
              </Link>
            </div>
          </div>

          {/* Recent Matches */}
          {matches.length > 0 && (
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Matches
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {matches.slice(0, 3).map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
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
                              {match.status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>
                              Professional: {match.professional.business_name}
                            </span>
                            <span>
                              Rating: {match.professional.rating.toFixed(1)} (
                              {match.professional.total_reviews} reviews)
                            </span>
                            <span>Matched {formatDate(match.created_at)}</span>
                          </div>
                          {match.status === "pending" && (
                            <p className="mt-2 text-xs text-gray-500">
                              {match.customer_swiped
                                ? "You accepted. Waiting for professional decision."
                                : "Review this match and accept or decline."}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {match.status === "pending" && !match.customer_swiped && (
                            <>
                              <button
                                onClick={() =>
                                  handleCustomerDecision(match.id, "like")
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors duration-200"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleCustomerDecision(match.id, "pass")
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors duration-200"
                              >
                                Decline
                              </button>
                            </>
                          )}

                          {match.status === "accepted" && (
                            <button
                              onClick={() =>
                                openChat(
                                  match.id,
                                  `${match.professional.firstName} ${match.professional.lastName}`,
                                  match.job.title
                                )
                              }
                              className="relative bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
                            >
                              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                              Message
                              {(unreadByMatch[match.id] || 0) > 0 && (
                                <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] leading-5 text-center font-semibold">
                                  {unreadByMatch[match.id] > 99
                                    ? "99+"
                                    : unreadByMatch[match.id]}
                                </span>
                              )}
                            </button>
                          )}
                          <Link
                            href={`/customer/jobs/${match.job.id}`}
                            className="btn-secondary flex items-center"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {matches.length > 3 && (
                  <div className="mt-4 text-center">
                    <Link
                      href="/customer/matches"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View all matches →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Jobs
              </h2>
            </div>
            <div className="p-6">
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No jobs yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get started by posting your first service request
                  </p>
                  <Link href="/customer/jobs/new" className="btn-primary">
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {job.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                job.status
                              )}`}
                            >
                              {job.status.replace("_", " ")}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(
                                job.urgency
                              )}`}
                            >
                              {job.urgency}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {job.description.length > 100
                              ? `${job.description.substring(0, 100)}...`
                              : job.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="capitalize">
                              {job.service_category}
                            </span>
                            {job.budget_min && job.budget_max && (
                              <span>
                                ${job.budget_min} - ${job.budget_max}
                              </span>
                            )}
                            <span>Posted {formatDate(job.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/customer/jobs/${job.id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View Details
                          </Link>
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
