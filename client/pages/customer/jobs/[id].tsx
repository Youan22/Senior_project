import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
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
  zip_code: string;
  preferred_date?: string;
}

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    if (id) {
      fetchJob();
    }
  }, [router, id]);

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
      } else {
        toast.error("Failed to fetch job details");
        router.push("/customer/jobs");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelJob = async () => {
    if (!confirm("Are you sure you want to cancel this job?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/jobs/${id}/cancel`,
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
        router.push("/customer/jobs");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Job not found
          </h2>
          <Link href="/customer/jobs" className="btn-primary">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{job.title} - ServiceMatch</title>
        <meta name="description" content="Job details and management" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/customer/jobs"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Jobs
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {job.status.replace("_", " ")}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getUrgencyColor(
                      job.urgency
                    )}`}
                  >
                    {job.urgency} priority
                  </span>
                </div>
              </div>

              {job.status === "open" && (
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/customer/jobs/${job.id}/edit`}
                    className="btn-secondary flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={handleCancelJob}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {job.description}
                </p>
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Location
                </h2>
                <div className="text-gray-700">
                  <p>{job.address}</p>
                  <p>
                    {job.city}, {job.state} {job.zip_code}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Job Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Service Category
                    </span>
                    <p className="text-gray-900 capitalize">
                      {job.service_category}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Budget
                    </span>
                    <p className="text-gray-900">
                      {job.budget_min && job.budget_max
                        ? `$${job.budget_min} - $${job.budget_max}`
                        : "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Urgency
                    </span>
                    <p className="text-gray-900 capitalize">{job.urgency}</p>
                  </div>

                  {job.preferred_date && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Preferred Date
                      </span>
                      <p className="text-gray-900">
                        {formatDate(job.preferred_date)}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Posted
                    </span>
                    <p className="text-gray-900">
                      {formatDate(job.created_at)}
                    </p>
                  </div>

                  {job.updated_at !== job.created_at && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Last Updated
                      </span>
                      <p className="text-gray-900">
                        {formatDate(job.updated_at)}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Actions */}
              {job.status === "open" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Actions
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href={`/customer/jobs/${job.id}/edit`}
                      className="w-full btn-secondary flex items-center justify-center"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit Job
                    </Link>
                    <button
                      onClick={handleCancelJob}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Cancel Job
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
    </>
  );
}




