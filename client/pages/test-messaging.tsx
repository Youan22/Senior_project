import { useState, useEffect } from "react";
import Head from "next/head";
import ChatModal from "../components/ChatModal";

export default function TestMessaging() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Test Messaging - ServiceMatch</title>
      </Head>

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Messaging System Test
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Test the real-time messaging functionality
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Chat Demo
              </h2>
              <p className="text-gray-600 mb-6">
                Click the button below to open the chat modal and test the
                messaging system. You'll need to be logged in and have a match
                to test the full functionality.
              </p>

              <button
                onClick={() => setIsOpen(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Open Chat Modal
              </button>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Features Implemented:
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>✅ Real-time messaging with Socket.io</li>
                <li>✅ Message history loading</li>
                <li>✅ Typing indicators</li>
                <li>✅ Message status (sent, delivered, read)</li>
                <li>✅ Chat modal integration</li>
                <li>✅ Customer dashboard integration</li>
                <li>✅ Professional dashboard integration</li>
                <li>✅ Authentication with JWT tokens</li>
                <li>✅ Database message storage</li>
                <li>✅ Message API endpoints</li>
              </ul>
            </div>

            <div className="mt-6 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                How to Test:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>
                  <strong>First:</strong> Login to your account (required for
                  API access)
                </li>
                <li>
                  Register as both a customer and professional (if you haven't
                  already)
                </li>
                <li>Post a job as a customer</li>
                <li>Accept the match as a professional</li>
                <li>Click the "Message" button in either dashboard</li>
                <li>Send messages and see real-time updates</li>
              </ol>
              <div className="mt-4 p-3 bg-blue-100 rounded">
                <p className="text-blue-900 text-sm">
                  <strong>Note:</strong> The messaging system requires
                  authentication. Make sure you're logged in before testing the
                  chat functionality.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Chat Modal - Only show if user is logged in */}
        {typeof window !== "undefined" && localStorage.getItem("token") ? (
          <ChatModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            matchId="test-match-id"
            currentUserId={
              localStorage.getItem("user")
                ? JSON.parse(localStorage.getItem("user")!).id
                : "test-user-id"
            }
            token={localStorage.getItem("token") || ""}
            otherUserName="Test User"
            jobTitle="Test Job"
          />
        ) : (
          <div className="mt-6 p-6 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Authentication Required
            </h3>
            <p className="text-yellow-800 mb-4">
              You need to be logged in to test the messaging system. Please log
              in first.
            </p>
            <div className="flex space-x-4">
              <a
                href="/auth/login"
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200"
              >
                Login
              </a>
              <a
                href="/auth/register"
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200"
              >
                Register
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
