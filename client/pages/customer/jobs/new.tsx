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
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const SERVICE_CATEGORIES = [
  { value: "moving", label: "Moving & Relocation" },
  { value: "plumbing", label: "Plumbing" },
  { value: "hvac", label: "HVAC & Heating" },
  { value: "electrical", label: "Electrical" },
  { value: "cleaning", label: "Cleaning Services" },
  { value: "landscaping", label: "Landscaping" },
  { value: "painting", label: "Painting" },
  { value: "roofing", label: "Roofing" },
  { value: "flooring", label: "Flooring" },
  { value: "handyman", label: "Handyman Services" },
];

const URGENCY_LEVELS = [
  {
    value: "low",
    label: "Low",
    description: "Flexible timing, can wait a few days",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Need service within a week",
  },
  { value: "high", label: "High", description: "Need service within 2-3 days" },
  {
    value: "emergency",
    label: "Emergency",
    description: "Need immediate service",
  },
];

export default function NewJob() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceCategory: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    budgetMin: "",
    budgetMax: "",
    urgency: "medium",
    preferredDate: "",
  });

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
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a job title");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    if (!formData.serviceCategory) {
      toast.error("Please select a service category");
      return;
    }

    if (
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.zipCode.trim()
    ) {
      toast.error("Please complete all address fields");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          serviceCategory: formData.serviceCategory,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          budgetMin: formData.budgetMin
            ? parseFloat(formData.budgetMin)
            : undefined,
          budgetMax: formData.budgetMax
            ? parseFloat(formData.budgetMax)
            : undefined,
          urgency: formData.urgency,
          preferredDate: formData.preferredDate
            ? new Date(formData.preferredDate).toISOString()
            : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Job posted successfully!");
        router.push("/customer/dashboard");
      } else {
        toast.error(data.error || "Failed to post job");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Post New Job - ServiceMatch</title>
        <meta
          name="description"
          content="Post a new service request and find professionals"
        />
      </Head>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/customer/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
            <p className="text-gray-600 mt-2">
              Describe your service needs and we'll match you with qualified
              professionals
            </p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Fix leaky kitchen faucet"
                  className="input-field"
                  required
                />
              </div>

              {/* Service Category */}
              <div>
                <label
                  htmlFor="serviceCategory"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Service Category *
                </label>
                <select
                  id="serviceCategory"
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a service category</option>
                  {SERVICE_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe what you need done in detail..."
                  className="input-field"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Location
                </h3>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Salt Lake City"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="UT"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="84101"
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Budget (Optional)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="budgetMin"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Minimum Budget
                    </label>
                    <input
                      type="number"
                      id="budgetMin"
                      name="budgetMin"
                      value={formData.budgetMin}
                      onChange={handleChange}
                      placeholder="100"
                      min="0"
                      step="0.01"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="budgetMax"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Maximum Budget
                    </label>
                    <input
                      type="number"
                      id="budgetMax"
                      name="budgetMax"
                      value={formData.budgetMax}
                      onChange={handleChange}
                      placeholder="500"
                      min="0"
                      step="0.01"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Urgency */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Urgency Level
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {URGENCY_LEVELS.map((level) => (
                    <label key={level.value} className="relative">
                      <input
                        type="radio"
                        name="urgency"
                        value={level.value}
                        checked={formData.urgency === level.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.urgency === level.value
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {level.label}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {level.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Date */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Preferred Date (Optional)
                </h3>

                <div>
                  <input
                    type="datetime-local"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    className="input-field"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-4">
                  <Link href="/customer/dashboard" className="btn-secondary">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting Job...
                      </div>
                    ) : (
                      "Post Job"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
    </>
  );
}




