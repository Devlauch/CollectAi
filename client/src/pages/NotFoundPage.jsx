import { Link } from 'react-router-dom';
import FuzzyText from "../components/FuzzyText.jsx";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 relative overflow-hidden">

      {/* background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] bg-violet-600/6 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative text-center max-w-lg w-full">

        {/* big 404 */}
        <div className="relative mb-8 select-none flex align-center justify-center">  
          <FuzzyText 
          baseIntensity={0.2}
          hoverIntensity={0.5}
          enableHover
        >
        404
        </FuzzyText>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
          Page not found
        </h1>
        {/* <p className="text-slate-400 text-base mb-10 leading-relaxed">
          The page you are looking for does not exist, was moved, or the URL is incorrect.
        </p> */}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3 rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go home
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-7 py-3 rounded-xl transition-all text-sm"
          >
            Dashboard
          </Link>
        </div>

        {/* breadcrumb hint */}
        <p className="mt-10 text-slate-700 text-xs">
          collectai &nbsp;/&nbsp; <span className="text-slate-600">page-not-found</span>
        </p>
      </div>
    </div>
  );
}
