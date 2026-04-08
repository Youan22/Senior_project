import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import ChatModal from "../components/ChatModal";
import { motion } from "framer-motion";

export default function TestMessagingReal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchMatches();
  }, [router]);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        user?.userType === "customer"
          ? "/api/matches/customer"
          : "/api/matches/my-matches";

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setIsLoading(false);
    }
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
        <title>Real Messaging Test - ServiceMatch</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Real Messaging System Test
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Test the messaging system with your actual matches
            </p>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">
                Welcome, {user?.firstName} {user?.lastName} ({user?.userType})
              </p>
            </div>
          </div>

          {/* Matches Section */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Matches ({matches.length})
              </h2>
            </div>
            <div className="p-6">
              {matches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="h-12 w-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No matches yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {user?.userType === "customer"
                      ? "Post a job to start getting matches with professionals"
                      : "Complete your profile to start receiving job matches"}
                  </p>
                  <div className="flex justify-center space-x-4">
                    {user?.userType === "customer" ? (
                      <a
                        href="/customer/jobs/new"
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      >
                        Post a Job
                      </a>
                    ) : (
                      <a
                        href="/professional/profile/edit"
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                      >
                        Complete Profile
                      </a>
                    )}
                    <a
                      href="/customer/dashboard"
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match, index) => (
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
                              {user?.userType === "customer"
                                ? match.job?.title
                                : match.job?.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                match.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : match.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {match.status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {user?.userType === "customer" ? (
                              <>
                                <span>
                                  Professional:{" "}
                                  {match.professional?.business_name ||
                                    `${match.professional?.firstName} ${match.professional?.lastName}`}
                                </span>
                                <span>
                                  Rating:{" "}
                                  {match.professional?.rating?.toFixed(1) ||
                                    "0.0"}{" "}
                                  ({match.professional?.total_reviews || 0}{" "}
                                  reviews)
                                </span>
                              </>
                            ) : (
                              <>
                                <span>
                                  Customer: {match.job?.customer?.firstName}{" "}
                                  {match.job?.customer?.lastName}
                                </span>
                                <span>
                                  Budget: ${match.job?.budget_min} - $
                                  {match.job?.budget_max}
                                </span>
                              </>
                            )}
                            <span>
                              Matched{" "}
                              {new Date(match.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {match.status === "accepted" && (
                            <button
                              onClick={() =>
                                openChat(
                                  match.id,
                                  user?.userType === "customer"
                                    ? `${match.professional?.firstName} ${match.professional?.lastName}`
                                    : `${match.job?.customer?.firstName} ${match.job?.customer?.lastName}`,
                                  match.job?.title
                                )
                              }
                              className="bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center"
                            >
                              <svg
                                className="h-4 w-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              Message
                            </button>
                          )}
                          <a
                            href={
                              user?.userType === "customer"
                                ? `/customer/jobs/${match.job?.id}`
                                : `/professional/matches/${match.id}`
                            }
                            className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center"
                          >
                            <svg
                              className="h-4 w-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Testing Instructions
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  For Real Testing:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                  <li>
                    If you have matches, click "Message" to test real-time chat
                  </li>
                  <li>
                    Open multiple browser tabs with different user accounts
                  </li>
                  <li>
                    Send messages between accounts to test real-time updates
                  </li>
                  <li>Check that messages persist after page refresh</li>
                </ol>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  To Create Test Matches:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-green-800 text-sm">
                  <li>Register as both customer and professional</li>
                  <li>Post a job as customer</li>
                  <li>Accept the match as professional</li>
                  <li>Return to this page to test messaging</li>
                </ol>
              </div>
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
      </div>
    </>
  );
}

















