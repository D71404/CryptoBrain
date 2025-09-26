
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Squares } from "./squares-background";

export default function Hero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0a0613] h-screen font-light text-white antialiased"
    >
      {/* Animated squares background */}
      <div className="absolute inset-0 w-full h-full">
        <Squares 
          direction="diagonal"
          speed={0.3}
          squareSize={60}
          borderColor="rgba(234, 88, 12, 0.1)"
          hoverFillColor="rgba(234, 88, 12, 0.05)"
        />
      </div>

      {/* Orange gradient overlays */}
      <div
        className="absolute right-0 top-0 h-1/2 w-1/2 z-10"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(234, 88, 12, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />
      <div
        className="absolute left-0 top-0 h-1/2 w-1/2 -scale-x-100 z-10"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(234, 88, 12, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-light text-white">
            Crypto<span className="text-orange-500">Brain</span>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={handleSignIn}
              className="text-white/70 hover:text-white transition-colors px-6 py-2 rounded-full border border-transparent hover:border-white/20"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-all duration-300"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl h-full flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="mb-6 inline-block rounded-full border border-orange-500/30 px-3 py-1 text-xs text-orange-400">
            NEXT GENERATION OF CRYPTO AI
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            <span className="text-orange-500">AI-Powered</span> Crypto Insights
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
            CryptoBrain combines artificial intelligence with cutting-edge insights to help you keep upto date in crypto world.
          </p>

          <div className="mb-10 sm:mb-0 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={handleGetStarted}
              className="neumorphic-button hover:shadow-[0_0_20px_rgba(234,88,12,0.5)] relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-orange-500/30 sm:w-auto"
            >
              Get Started
            </button>
            <a
              href="#how-it-works"
              className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto"
            >
              <span>Learn how it works</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
