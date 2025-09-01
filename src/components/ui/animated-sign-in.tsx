
"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

interface AnimatedSignInProps {
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  isSignUp: boolean;
  onToggleMode: () => void;
}

const AnimatedSignIn: React.FC<AnimatedSignInProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading,
  isSignUp,
  onToggleMode,
}) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  // Email validation
  const validateEmail = (email: string) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e.target.value);
    if (e.target.value) {
      setIsEmailValid(validateEmail(e.target.value));
    } else {
      setIsEmailValid(true);
    }
  };

  // Create particles
  useEffect(() => {
    const canvas = document.getElementById("particles") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = `rgba(234, 88, 12, ${Math.random() * 0.2})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(
      100,
      Math.floor((canvas.width * canvas.height) / 15000)
    );

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.update();
        particle.draw();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#271a0d] to-[#0a0613] flex items-center justify-center p-4 relative overflow-hidden">
      <canvas id="particles" className="absolute inset-0 pointer-events-none"></canvas>

      <div className="w-full max-w-md relative z-10">
        <div className="crypto-card rounded-lg p-8 shadow-2xl animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-white mb-2">
              {isSignUp ? 'Join' : 'Welcome to'} <span className="text-orange-500">CryptoBrain</span>
            </h1>
            <p className="text-white/60">
              {isSignUp ? 'Create your account to get started' : 'Please sign in to continue'}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className={`relative group ${isEmailFocused || email ? 'focused' : ''} ${!isEmailValid && email ? 'invalid' : ''}`}>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  required
                  className="w-full h-14 px-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-orange-400 focus:bg-white/15 hover:bg-white/10 transition-all duration-300 peer shadow-lg shadow-black/10 focus:shadow-orange-500/20 focus:shadow-lg"
                  placeholder="Email Address"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 opacity-0 peer-focus:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <label
                htmlFor="email"
                className="absolute left-4 top-4 text-white/60 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-orange-400 peer-focus:font-medium peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-400 peer-[:not(:placeholder-shown)]:font-medium pointer-events-none"
              >
                Email Address
              </label>
              {!isEmailValid && email && (
                <span className="text-red-400 text-sm mt-2 block flex items-center gap-1 animate-fade-in">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  Please enter a valid email
                </span>
              )}
            </div>

            <div className={`relative group ${isPasswordFocused || password ? 'focused' : ''}`}>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                  className="w-full h-14 px-4 pr-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-orange-400 focus:bg-white/15 hover:bg-white/10 transition-all duration-300 peer shadow-lg shadow-black/10 focus:shadow-orange-500/20 focus:shadow-lg"
                  placeholder="Password"
                  minLength={6}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 opacity-0 peer-focus:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              <label
                htmlFor="password"
                className="absolute left-4 top-4 text-white/60 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-orange-400 peer-focus:font-medium peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-orange-400 peer-[:not(:placeholder-shown)]:font-medium pointer-events-none"
              >
                Password
              </label>
              <button
                type="button"
                className="absolute right-4 top-4 text-white/60 hover:text-orange-400 transition-all duration-200 hover:scale-110 focus:outline-none focus:text-orange-400"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center text-white/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="mr-2 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  Remember me
                </label>

                <a href="#" className="text-orange-500 hover:text-orange-400 transition-colors text-sm">
                  Forgot Password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/60">or continue with</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Github size={18} className="text-white" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Twitter size={18} className="text-white" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Linkedin size={18} className="text-white" />
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onToggleMode}
              className="text-white/60 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedSignIn;
