import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

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
  address: string;
  city: string;
  state: string;
}

export default function JobsList() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
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
    if (parsedUser.userType !== "customer") {
      router.push("/professional/dashboard");
      return;
    }

    fetchJobs();
  }, [router]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/jobs/my-jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      } else {
        toast.error("Failed to fetch jobs");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to cancel this job?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/jobs/${jobId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: "Cancelled by customer" }),
        }
      );

      if (response.ok) {
        toast.success("Job cancelled successfully");
        fetchJobs(); // Refresh the list
      } else {
        toast.error("Failed to cancel job");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <ClockIcon className="h-5 w-5" />;
      case "matched":
        return <EyeIcon className="h-5 w-5" />;
      case "in_progress":
        return <ClipboardDocumentListIcon className="h-5 w-5" />;
      case "completed":
        return <CheckCircleIcon className="h-5 w-5" />;
      case "cancelled":
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
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

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") return true;
    return job.status === filter;
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
        <title>My Jobs - ServiceMatch</title>
        <meta name="description" content="Manage your service requests" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
                <p className="text-gray-600 mt-2">
                  Manage your service requests and track their progress
                </p>
              </div>
              <Link
                href="/customer/jobs/new"
                className="btn-primary flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Post New Job
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: "all", label: "All Jobs", count: jobs.length },
                  {
                    key: "open",
                    label: "Open",
                    count: jobs.filter((j) => j.status === "open").length,
                  },
                  {
                    key: "matched",
                    label: "Matched",
                    count: jobs.filter((j) => j.status === "matched").length,
                  },
                  {
                    key: "in_progress",
                    label: "In Progress",
                    count: jobs.filter((j) => j.status === "in_progress")
                      .length,
                  },
                  {
                    key: "completed",
                    label: "Completed",
                    count: jobs.filter((j) => j.status === "completed").length,
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

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "all" ? "No jobs yet" : `No ${filter} jobs`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "all"
                  ? "Get started by posting your first service request"
                  : `You don't have any ${filter} jobs at the moment`}
              </p>
              {filter === "all" && (
                <Link href="/customer/jobs/new" className="btn-primary">
                  Post Your First Job
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
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
                            {job.title}
                          </h3>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${getStatusColor(
                              job.status
                            )}`}
                          >
                            {getStatusIcon(job.status)}
                            <span className="ml-1 capitalize">
                              {job.status.replace("_", " ")}
                            </span>
                          </span>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getUrgencyColor(
                              job.urgency
                            )}`}
                          >
                            {job.urgency}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-4">
                          {job.description.length > 200
                            ? `${job.description.substring(0, 200)}...`
                            : job.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Service:</span>
                            <span className="ml-2 capitalize">
                              {job.service_category}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Location:</span>
                            <span className="ml-2">
                              {job.city}, {job.state}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Budget:</span>
                            <span className="ml-2">
                              {job.budget_min && job.budget_max
                                ? `$${job.budget_min} - $${job.budget_max}`
                                : "Not specified"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                          <span className="font-medium">Posted:</span>
                          <span className="ml-2">
                            {formatDate(job.created_at)}
                          </span>
                          {job.updated_at !== job.created_at && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="font-medium">Updated:</span>
                              <span className="ml-2">
                                {formatDate(job.updated_at)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-6">
                        <Link
                          href={`/customer/jobs/${job.id}`}
                          className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>

                        {job.status === "open" && (
                          <>
                            <button
                              onClick={() =>
                                router.push(`/customer/jobs/${job.id}/edit`)
                              }
                              className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50"
                              title="Edit Job"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>

                            <button
                              onClick={() => handleCancelJob(job.id)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                              title="Cancel Job"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
    </>
  );
}




