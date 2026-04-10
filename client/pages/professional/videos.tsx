import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { apiUrl } from "../../lib/apiUrl";

type Video = {
  id: string;
  video_url: string;
  thumbnail_url?: string | null;
  description?: string | null;
  duration_seconds?: number | null;
  is_primary: boolean;
  created_at: string;
};

export default function ProfessionalVideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    videoUrl: "",
    thumbnailUrl: "",
    description: "",
    duration: "",
    isPrimary: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }
    const user = JSON.parse(userData);
    if (user.userType !== "professional") {
      router.push("/customer/dashboard");
      return;
    }
    fetchVideos();
  }, [router]);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiUrl("/api/professionals/videos"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast.error("Failed to load videos");
        return;
      }
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (error) {
      toast.error("Network error while loading videos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoUrl.trim()) {
      toast.error("Video URL is required");
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        videoUrl: formData.videoUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim() || null,
        description: formData.description.trim() || null,
        duration: formData.duration ? parseInt(formData.duration, 10) : null,
        isPrimary: formData.isPrimary,
      };
      const res = await fetch(apiUrl("/api/professionals/videos"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to upload video");
        return;
      }
      toast.success("Video added successfully");
      setFormData({
        videoUrl: "",
        thumbnailUrl: "",
        description: "",
        duration: "",
        isPrimary: false,
      });
      fetchVideos();
    } catch (error) {
      toast.error("Network error while uploading");
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
        <title>Manage Videos - ServiceMatch</title>
        <meta name="description" content="Manage professional videos" />
      </Head>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/professional/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Manage Videos</h1>
          <p className="text-gray-600 mt-1">
            Add portfolio videos that customers can review before matching.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Video</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="input-field"
              placeholder="Video URL (required)"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData((p) => ({ ...p, videoUrl: e.target.value }))
              }
              required
            />
            <input
              className="input-field"
              placeholder="Thumbnail URL (optional)"
              value={formData.thumbnailUrl}
              onChange={(e) =>
                setFormData((p) => ({ ...p, thumbnailUrl: e.target.value }))
              }
            />
            <textarea
              className="input-field"
              rows={3}
              placeholder="Short description (optional)"
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                className="input-field"
                min="0"
                placeholder="Duration in seconds (optional)"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, duration: e.target.value }))
                }
              />
              <label className="inline-flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.isPrimary}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, isPrimary: e.target.checked }))
                  }
                />
                Set as primary video
              </label>
            </div>
            <button className="btn-primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Add Video"}
            </button>
          </form>
        </motion.div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Videos</h2>
          </div>
          <div className="p-6">
            {videos.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <VideoCameraIcon className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                No videos yet.
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-start justify-between"
                  >
                    <div className="pr-4">
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 hover:text-primary-700 font-medium break-all"
                      >
                        {video.video_url}
                      </a>
                      {video.description && (
                        <p className="text-sm text-gray-700 mt-2">{video.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Added {new Date(video.created_at).toLocaleString()}
                        {video.duration_seconds
                          ? ` • ${video.duration_seconds}s`
                          : ""}
                      </p>
                    </div>
                    {video.is_primary && (
                      <span className="inline-flex items-center text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        <StarIcon className="h-3 w-3 mr-1" />
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
