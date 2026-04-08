import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

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
    zip_code: string;
    preferred_date?: string;
    created_at: string;
    customer: {
      firstName: string;
      lastName: string;
      profile_image_url?: string;
    };
  };
}

export default function ProfessionalMatches() {
  const router = useRouter();
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== "professional") {
      router.push("/customer/dashboard");
      return;
    }

    fetchJobMatches();
  }, [router]);

  const fetchJobMatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/matches/my-matches",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Transform the data to match our interface
        const transformedMatches = (data.matches || []).map((match: any) => ({
          id: match.id,
          job_id: match.job_id,
          professional_id: match.professional_id,
          status: match.status,
          created_at: match.created_at,
          job: {
            id: match.job_id,
            title: match.title,
            description: match.description,
            service_category: match.service_category,
            budget_min: match.budget_min,
            budget_max: match.budget_max,
            urgency: match.urgency,
            address: match.address,
            city: match.city,
            state: match.state,
            zip_code: match.zip_code,
            preferred_date: match.preferred_date,
            created_at: match.job_created_at,
            customer: {
              firstName: match.first_name,
              lastName: match.last_name,
              profile_image_url: match.profile_image_url,
            },
          },
        }));

        setJobMatches(transformedMatches);
      } else {
        toast.error("Failed to fetch job matches");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchResponse = async (
    matchId: string,
    response: "accept" | "decline"
  ) => {
    try {
      const token = localStorage.getItem("token");
      const result = await fetch(
        `http://localhost:5000/api/matches/${matchId}/${response}`,
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredMatches = jobMatches.filter((match) => {
    if (filter === "all") return true;
    return match.status === filter;
  });

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
        <title>Job Matches - ServiceMatch</title>
        <meta name="description" content="View and respond to job matches" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary-600">
                  ServiceMatch
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/professional/dashboard"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/professional/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Job Matches
                </h1>
                <p className="text-gray-600 mt-2">
                  View and respond to job opportunities that match your services
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  {
                    key: "all",
                    label: "All Matches",
                    count: jobMatches.length,
                  },
                  {
                    key: "pending",
                    label: "Pending",
                    count: jobMatches.filter((m) => m.status === "pending")
                      .length,
                  },
                  {
                    key: "accepted",
                    label: "Accepted",
                    count: jobMatches.filter((m) => m.status === "accepted")
                      .length,
                  },
                  {
                    key: "declined",
                    label: "Declined",
                    count: jobMatches.filter((m) => m.status === "declined")
                      .length,
                  },
                  {
                    key: "completed",
                    label: "Completed",
                    count: jobMatches.filter((m) => m.status === "completed")
                      .length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === tab.key
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Matches List */}
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12">
              <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "all" ? "No matches yet" : `No ${filter} matches`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "all"
                  ? "Complete your profile to start receiving job matches"
                  : `You don't have any ${filter} matches at the moment`}
              </p>
              {filter === "all" && (
                <Link href="/professional/profile/edit" className="btn-primary">
                  Complete Profile
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {match.job.title}
                          </h3>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                              match.status
                            )}`}
                          >
                            {match.status}
                          </span>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getUrgencyColor(
                              match.job.urgency
                            )}`}
                          >
                            {match.job.urgency}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4">
                          {match.job.description.length > 200
                            ? `${match.job.description.substring(0, 200)}...`
                            : match.job.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-2" />
                            <span>
                              {match.job.customer.firstName}{" "}
                              {match.job.customer.lastName}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            <span>
                              {match.job.city}, {match.job.state}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                            <span>
                              {match.job.budget_min && match.job.budget_max
                                ? `$${match.job.budget_min} - $${match.job.budget_max}`
                                : "Budget not specified"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            <span>
                              Posted {formatDate(match.job.created_at)}
                            </span>
                          </div>
                        </div>

                        {match.job.preferred_date && (
                          <div className="text-sm text-gray-500 mb-4">
                            <span className="font-medium">Preferred Date:</span>
                            <span className="ml-2">
                              {formatDate(match.job.preferred_date)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 ml-6">
                        {match.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleMatchResponse(match.id, "accept")
                              }
                              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleMatchResponse(match.id, "decline")
                              }
                              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                            >
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Decline
                            </button>
                          </>
                        )}

                        <Link
                          href={`/professional/matches/${match.id}`}
                          className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
