import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

// Mock data for testing
const mockJobs = [
  {
    id: "1",
    title: "Fix leaky kitchen faucet",
    description:
      "The kitchen faucet has been dripping for a week and needs to be repaired or replaced.",
    service_category: "plumbing",
    status: "open",
    budget_min: 100,
    budget_max: 300,
    urgency: "medium",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Install new light fixtures",
    description: "Need to install 3 new pendant lights in the dining room.",
    service_category: "electrical",
    status: "matched",
    budget_min: 200,
    budget_max: 500,
    urgency: "low",
    created_at: "2024-01-14T14:30:00Z",
    updated_at: "2024-01-16T09:15:00Z",
  },
];

const mockStats = {
  totalJobs: 2,
  activeJobs: 2,
  completedJobs: 0,
  totalMatches: 1,
};

export default function TestDashboard() {
  const [jobs, setJobs] = useState(mockJobs);
  const [stats, setStats] = useState(mockStats);

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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Head>
        <title>Test Dashboard - ServiceMatch</title>
        <meta
          name="description"
          content="Test customer dashboard with mock data"
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Dashboard (Test)
            </h1>
            <p className="text-gray-600 mt-2">
              This is a test version with mock data. Use this to see how the
              dashboard looks and works.
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
                <EyeIcon className="h-8 w-8 text-blue-600" />
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

          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Jobs
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {jobs.map((job, index) => (
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
            </div>
          </div>
        </div>
    </>
  );
}




