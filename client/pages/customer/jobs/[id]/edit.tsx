import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { ArrowLeftIcon, MapPinIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { apiUrl } from "../../../../lib/apiUrl";

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

type FormData = {
  title: string;
  description: string;
  service_category: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  budget_min: string;
  budget_max: string;
  urgency: string;
  preferred_date: string;
};

export default function EditJob() {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    service_category: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    budget_min: "",
    budget_max: "",
    urgency: "medium",
    preferred_date: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }
    const user = JSON.parse(userData);
    if (user.userType !== "customer") {
      router.push("/professional/dashboard");
      return;
    }
    if (id) {
      fetchJob();
    }
  }, [id, router]);

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl(`/api/jobs/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast.error("Failed to load job");
        router.push("/customer/jobs");
        return;
      }
      const data = await res.json();
      const j = data.job;
      setFormData({
        title: j.title || "",
        description: j.description || "",
        service_category: j.service_category || "",
        address: j.address || "",
        city: j.city || "",
        state: j.state || "",
        zip_code: j.zip_code || "",
        budget_min: j.budget_min != null ? String(j.budget_min) : "",
        budget_max: j.budget_max != null ? String(j.budget_max) : "",
        urgency: j.urgency || "medium",
        preferred_date: j.preferred_date
          ? new Date(j.preferred_date).toISOString().slice(0, 10)
          : "",
      });
    } catch (_) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        title: formData.title,
        description: formData.description,
        service_category: formData.service_category,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        urgency: formData.urgency,
        preferred_date: formData.preferred_date || null,
      };
      const res = await fetch(apiUrl(`/api/jobs/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update job");
        return;
      }
      toast.success("Job updated successfully");
      router.push(`/customer/jobs/${id}`);
    } catch (_) {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Job - ServiceMatch</title>
      </Head>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/customer/jobs/${id}`}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Job
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job Request</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <input className="input-field" name="title" value={formData.title} onChange={handleChange} placeholder="Job title" required />
            <select className="input-field" name="service_category" value={formData.service_category} onChange={handleChange} required>
              <option value="">Select service category</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <textarea className="input-field" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Description" required />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                Location
              </h3>
              <input className="input-field" name="address" value={formData.address} onChange={handleChange} placeholder="Street address" required />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input className="input-field" name="city" value={formData.city} onChange={handleChange} placeholder="City" required />
                <input className="input-field" name="state" value={formData.state} onChange={handleChange} placeholder="State" required />
                <input className="input-field" name="zip_code" value={formData.zip_code} onChange={handleChange} placeholder="ZIP" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input-field" type="number" step="0.01" min="0" name="budget_min" value={formData.budget_min} onChange={handleChange} placeholder="Budget min" />
              <input className="input-field" type="number" step="0.01" min="0" name="budget_max" value={formData.budget_max} onChange={handleChange} placeholder="Budget max" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="input-field" name="urgency" value={formData.urgency} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
              <input className="input-field" type="date" name="preferred_date" value={formData.preferred_date} onChange={handleChange} />
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
              <Link href={`/customer/jobs/${id}`} className="btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="btn-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}
