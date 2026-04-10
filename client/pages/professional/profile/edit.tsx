import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  UserIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { apiUrl } from "../../../lib/apiUrl";

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

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

interface Professional {
  id: string;
  business_name: string;
  service_category: string;
  bio?: string;
  hourly_rate: number;
  years_experience: number;
  service_areas: string[];
  is_available: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  profile_image_url?: string;
  phone?: string;
  website?: string;
  license_number?: string;
  insurance_info?: string;
}

export default function EditProfessionalProfile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    business_name: "",
    service_category: "",
    bio: "",
    hourly_rate: "",
    match_fee: "",
    years_experience: "",
    service_areas: [] as string[],
    is_available: true,
    phone: "",
    website: "",
    license_number: "",
    insurance_info: "",
  });

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

    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        apiUrl("/api/professionals/profile"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const profile = data.professional;

        const insuranceRaw = profile.insurance_info;
        let insuranceText = "";
        if (typeof insuranceRaw === "string") {
          insuranceText = insuranceRaw;
        } else if (
          insuranceRaw &&
          typeof insuranceRaw === "object" &&
          "notes" in insuranceRaw
        ) {
          insuranceText = String((insuranceRaw as { notes?: string }).notes || "");
        }

        setFormData({
          business_name: profile.business_name || "",
          service_category: profile.service_category || "",
          bio: profile.description || profile.bio || "",
          hourly_rate: profile.hourly_rate?.toString() || "",
          match_fee:
            profile.match_fee != null ? String(profile.match_fee) : "25",
          years_experience: profile.years_experience?.toString() || "",
          service_areas: profile.service_areas || [],
          is_available: profile.is_available ?? true,
          phone: profile.phone || "",
          website: profile.website || "",
          license_number: profile.license_number || "",
          insurance_info: insuranceText,
        });
      } else {
        toast.error("Failed to fetch profile");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleServiceAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        service_areas: [...prev.service_areas, value],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        service_areas: prev.service_areas.filter((area) => area !== value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.business_name.trim()) {
      toast.error("Please enter your business name");
      return;
    }

    if (!formData.service_category) {
      toast.error("Please select a service category");
      return;
    }

    if (!formData.hourly_rate || parseFloat(formData.hourly_rate) <= 0) {
      toast.error("Please enter a valid hourly rate");
      return;
    }

    if (formData.service_areas.length === 0) {
      toast.error("Select at least one service area (state)");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const insuranceNotes = formData.insurance_info.trim();
      const hourlyRate = parseFloat(formData.hourly_rate);
      const matchFeeRaw = parseFloat(formData.match_fee);
      const payload = {
        businessName: formData.business_name.trim(),
        description: formData.bio.trim(),
        serviceCategory: formData.service_category,
        licenseNumber: formData.license_number.trim() || "",
        licenseState: "",
        serviceAreas: formData.service_areas,
        hourlyRate: Number.isFinite(hourlyRate) ? hourlyRate : 0,
        matchFee: Number.isFinite(matchFeeRaw) ? matchFeeRaw : 25,
        yearsExperience: (() => {
          const y = parseInt(formData.years_experience, 10);
          return Number.isFinite(y) ? y : 0;
        })(),
        certifications: [] as string[],
        insuranceInfo: insuranceNotes ? { notes: insuranceNotes } : {},
        isAvailable: formData.is_available,
      };

      const response = await fetch(
        apiUrl("/api/professionals/profile"),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const rawText = await response.text();
      let data: {
        error?: string;
        details?: string;
        issues?: { path: string; message: string }[];
      } = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        console.error("Profile update: non-JSON response", rawText);
      }

      if (response.ok) {
        toast.success("Profile updated successfully!");
        router.push("/professional/dashboard");
      } else {
        console.error("Profile update failed", response.status, data);
        const issueLine =
          Array.isArray(data.issues) && data.issues.length > 0
            ? data.issues.map((i) => `${i.path}: ${i.message}`).join(" · ")
            : "";
        const msg = [data.error, data.details, issueLine]
          .filter(Boolean)
          .join(" — ");
        toast.error(msg || `Failed to update profile (${response.status})`);
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Profile - ServiceMatch</title>
        <meta name="description" content="Edit your professional profile" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/professional/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Professional Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Update your business information and service details
            </p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Business Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Business Information
                </h3>

                <div>
                  <label
                    htmlFor="business_name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="business_name"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleChange}
                    placeholder="Your business or trade name"
                    className="input-field"
                    required
                    autoComplete="organization"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="service_category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Service Category *
                    </label>
                    <select
                      id="service_category"
                      name="service_category"
                      value={formData.service_category}
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
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Business Description
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell customers about your business, experience, and what makes you unique..."
                    className="input-field"
                  />
                </div>
              </div>

              {/* Pricing & Experience */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Pricing & Experience
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="hourly_rate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Hourly Rate ($) *
                    </label>
                    <input
                      type="number"
                      id="hourly_rate"
                      name="hourly_rate"
                      value={formData.hourly_rate}
                      onChange={handleChange}
                      placeholder="75"
                      min="0"
                      step="0.01"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="match_fee"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Match fee ($) *
                    </label>
                    <input
                      type="number"
                      id="match_fee"
                      name="match_fee"
                      value={formData.match_fee}
                      onChange={handleChange}
                      placeholder="25"
                      min="0"
                      step="0.01"
                      className="input-field"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Fee charged when you match with a customer on a job.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="years_experience"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="years_experience"
                      name="years_experience"
                      value={formData.years_experience}
                      onChange={handleChange}
                      placeholder="5"
                      min="0"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Service Areas
                </h3>

                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Select the states where you provide services:
                  </p>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {US_STATES.map((state) => (
                      <label key={state} className="flex items-center">
                        <input
                          type="checkbox"
                          value={state}
                          checked={formData.service_areas.includes(state)}
                          onChange={handleServiceAreaChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {state}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="website"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Credentials */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Professional Credentials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="license_number"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      License Number
                    </label>
                    <input
                      type="text"
                      id="license_number"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleChange}
                      placeholder="License #12345"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="insurance_info"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Insurance Information
                    </label>
                    <input
                      type="text"
                      id="insurance_info"
                      name="insurance_info"
                      value={formData.insurance_info}
                      onChange={handleChange}
                      placeholder="General Liability Insurance"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Availability
                </h3>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_available"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_available"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    I am currently available for new jobs
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-4">
                  <Link
                    href="/professional/dashboard"
                    className="btn-secondary"
                  >
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
                        Updating Profile...
                      </div>
                    ) : (
                      "Update Profile"
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




