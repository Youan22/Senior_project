import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PlayIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  VideoCameraIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    {
      icon: VideoCameraIcon,
      title: "Video-First Profiles",
      description:
        "See professionals in action with authentic video profiles that showcase their skills and personality.",
    },
    {
      icon: HeartIcon,
      title: "Swipe to Match",
      description:
        "Swipe through professional profiles like a dating app, creating genuine connections before any money changes hands.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Verified Professionals",
      description:
        "All professionals are thoroughly vetted with background checks, licensing verification, and insurance validation.",
    },
    {
      icon: CurrencyDollarIcon,
      title: "Match-Based Pricing",
      description:
        "Professionals only pay when there's mutual interest - no more wasted money on unqualified leads.",
    },
    {
      icon: UserGroupIcon,
      title: "Exclusive Connections",
      description:
        "No shared leads. When you match, you get exclusive access to the customer without competition.",
    },
    {
      icon: PlayIcon,
      title: "Video Consultations",
      description:
        "Connect face-to-face through integrated video calls before booking to ensure the perfect fit.",
    },
  ];

  const stats = [
    {
      label: "Average Cost Per Lead",
      value: "$90.92",
      description: "Current industry average",
    },
    {
      label: "Our Match Fee",
      value: "$75-175",
      description: "Only when you match",
    },
    {
      label: "Conversion Rate",
      value: "65%",
      description: "vs 15% on other platforms",
    },
    {
      label: "Cost Savings",
      value: "75%",
      description: "Lower than traditional lead gen",
    },
  ];

  return (
    <>
      <Head>
        <title>ServiceMatch - Video-First Home Services Marketplace</title>
        <meta
          name="description"
          content="Connect with verified home service professionals through video-first matching. No more spam, no wasted leads - just genuine connections."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-primary-600">
                    ServiceMatch
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              >
                Find Your Perfect
                <span className="text-primary-600 block">
                  Service Professional
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              >
                Swipe through video profiles of verified professionals. No spam,
                no wasted leads - just genuine connections that lead to great
                work.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/auth/register"
                  className="btn-primary text-lg px-8 py-3"
                >
                  Start Swiping
                </Link>
                <Link
                  href="/auth/register?type=professional"
                  className="btn-secondary text-lg px-8 py-3"
                >
                  Join as Professional
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why ServiceMatch is Different
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're revolutionizing how homeowners connect with service
                professionals through video-first matching and transparent
                pricing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="card hover:shadow-lg transition-shadow duration-300"
                >
                  <feature.icon className="h-8 w-8 text-primary-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Home Services Experience?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Join thousands of homeowners and professionals who are already
              using ServiceMatch to find perfect matches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-white text-primary-600 hover:bg-gray-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/register?type=professional"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Join as Professional
              </Link>
            </div>
          </div>
        </section>

        {/* Development Navigation */}
        <section className="bg-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Development Links
              </h3>
              <div className="flex justify-center space-x-4">
                <Link href="/auth/login" className="btn-primary">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-secondary">
                  Register
                </Link>
                <Link
                  href="/customer/dashboard"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Customer Dashboard
                </Link>
                <Link
                  href="/test-dashboard"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Test Dashboard
                </Link>
                <Link
                  href="/professional/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Professional Dashboard
                </Link>
                <Link
                  href="/test-professional-dashboard"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Test Pro Dashboard
                </Link>
                <Link
                  href="/test-messaging"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Test Messaging
                </Link>
                <Link
                  href="/test-messaging-real"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Real Messaging Test
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">ServiceMatch</h3>
              <p className="text-gray-400 mb-6">
                The future of home services is here. Video-first, match-based,
                and built for trust.
              </p>
              <div className="text-sm text-gray-500">
                © 2024 ServiceMatch. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
