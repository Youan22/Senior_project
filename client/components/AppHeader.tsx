import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function AppHeader() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw) as {
          firstName?: string;
          first_name?: string;
          userType?: string;
          user_type?: string;
        };
        setFirstName(u.firstName || u.first_name || null);
        setUserType(u.userType || u.user_type || null);
      } else {
        setFirstName(null);
        setUserType(null);
      }
    } catch {
      setFirstName(null);
      setUserType(null);
    }
  }, [router.asPath]);

  const signOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            ServiceMatch
          </Link>
          <div className="flex items-center space-x-4">
            {firstName ? (
              <>
                {userType === "customer" && (
                  <Link
                    href="/customer/dashboard"
                    className="text-gray-600 hover:text-primary-600"
                  >
                    Dashboard
                  </Link>
                )}
                {userType === "professional" && (
                  <Link
                    href="/professional/dashboard"
                    className="text-gray-600 hover:text-primary-600"
                  >
                    Dashboard
                  </Link>
                )}
                <span className="text-gray-700">Welcome, {firstName}!</span>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600"
                >
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
