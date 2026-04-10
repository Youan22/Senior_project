export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">ServiceMatch</h3>
          <p className="text-gray-400 mb-6">
            The future of home services is here. Video-first, match-based, and
            built for trust.
          </p>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} ServiceMatch. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
