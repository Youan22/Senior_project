import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
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
} from "@heroicons/react/24/outline";

// Mock data for testing
const mockProfessional = {
  id: "1",
  business_name: "Elite Plumbing Services",
  service_category: "plumbing",
  rating: 4.8,
  total_reviews: 127,
  years_experience: 8,
  hourly_rate: 85,
  is_verified: true,
  is_available: true,
  bio: "Licensed plumber with 8+ years of experience. Specializing in emergency repairs, installations, and maintenance.",
};

const mockJobMatches = [
  {
    id: "1",
    job_id: "1",
    professional_id: "1",
    status: "pending",
    created_at: "2024-01-15T10:00:00Z",
    job: {
      id: "1",
      title: "Fix leaky kitchen faucet",
      description:
        "The kitchen faucet has been dripping for a week and needs to be repaired or replaced. It's a standard single-handle faucet.",
      service_category: "plumbing",
      budget_min: 150,
      budget_max: 300,
      urgency: "medium",
      address: "123 Main Street",
      city: "Salt Lake City",
      state: "UT",
      created_at: "2024-01-15T09:30:00Z",
      customer: {
        firstName: "John",
        lastName: "Smith",
      },
    },
  },
  {
    id: "2",
    job_id: "2",
    professional_id: "1",
    status: "accepted",
    created_at: "2024-01-14T14:00:00Z",
    job: {
      id: "2",
      title: "Install new bathroom sink",
      description:
        "Need to install a new bathroom sink and faucet. The old one is cracked and needs replacement.",
      service_category: "plumbing",
      budget_min: 200,
      budget_max: 400,
      urgency: "low",
      address: "456 Oak Avenue",
      city: "Salt Lake City",
      state: "UT",
      created_at: "2024-01-14T13:45:00Z",
      customer: {
        firstName: "Sarah",
        lastName: "Johnson",
      },
    },
  },
];

const mockStats = {
  totalMatches: 12,
  activeMatches: 3,
  completedJobs: 89,
  totalEarnings: 15680,
  averageRating: 4.8,
  responseRate: 85,
};

export default function TestProfessionalDashboard() {
  const [professional, setProfessional] = useState(mockProfessional);
  const [jobMatches, setJobMatches] = useState(mockJobMatches);
  const [stats, setStats] = useState(mockStats);

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

  return (
    <>
      <Head>
        <title>Test Professional Dashboard - ServiceMatch</title>
        <meta
          name="description"
          content="Test professional dashboard with mock data"
        />
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
                <span className="text-gray-700">Test Professional</span>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Professional Dashboard (Test)
            </h1>
            <p className="text-gray-600 mt-2">
              This is a test version with mock data. Use this to see how the
              professional dashboard looks and works.
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
                    ${stats.totalEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Profile Overview */}
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
          </motion.div>

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
              <div className="space-y-4">
                {jobMatches.map((match, index) => (
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
                              ${match.job.budget_min} - ${match.job.budget_max}
                            </span>
                          )}
                          <span>Posted {formatDate(match.job.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-6">
                        {match.status === "pending" && (
                          <>
                            <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors duration-200">
                              Accept
                            </button>
                            <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded transition-colors duration-200">
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
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
