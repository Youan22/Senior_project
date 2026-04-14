import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowLeftIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { apiUrl } from "../../../lib/apiUrl";

interface JobMatch {
  id: string;
  status: string;
  customer_swiped?: boolean;
  professional_swiped?: boolean;
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
    };
  };
}

export default function ProfessionalMatchDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [match, setMatch] = useState<JobMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    if (id) {
      fetchMatch();
    }
  }, [id, router]);

  const fetchMatch = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(apiUrl("/api/matches/my-matches"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to load match details");
        router.push("/professional/matches");
        return;
      }

      const data = await response.json();
      const found = (data.matches || []).find((m: JobMatch) => m.id === id);

      if (!found) {
        toast.error("Match not found");
        router.push("/professional/matches");
        return;
      }

      setMatch(found);
    } catch (error) {
      toast.error("Network error while loading match");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchResponse = async (action: "accept" | "decline") => {
    if (!match) return;

    try {
      const token = localStorage.getItem("token");
      const result = await fetch(apiUrl(`/api/matches/${match.id}/${action}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!result.ok) {
        toast.error(`Failed to ${action} match`);
        return;
      }

      toast.success(`Match ${action}ed successfully`);
      fetchMatch();
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Match not found</h2>
          <Link href="/professional/matches" className="btn-primary">
            Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{match.job.title} - Match Details</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/professional/matches"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Job Matches
        </Link>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{match.job.title}</h1>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    match.status
                  )}`}
                >
                  {match.status}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                  {match.job.service_category}
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-6">{match.job.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-2" />
              <span>
                Customer: {match.job.customer.firstName} {match.job.customer.lastName}
              </span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-2" />
              <span>
                {match.job.address}, {match.job.city}, {match.job.state} {match.job.zip_code}
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
              <span>Matched {formatDate(match.created_at)}</span>
            </div>
          </div>

          {match.status === "pending" && (
            <p className="text-sm text-gray-500 mb-4">
              {match.professional_swiped
                ? "You accepted. Waiting for customer decision."
                : "Review and choose to accept or decline this match."}
            </p>
          )}

          {match.status === "pending" && !match.professional_swiped && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleMatchResponse("accept")}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Accept
              </button>
              <button
                onClick={() => handleMatchResponse("decline")}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
              >
                <XCircleIcon className="h-4 w-4 mr-2" />
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

