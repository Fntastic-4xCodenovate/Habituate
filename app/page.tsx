'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Trophy, Target, Users, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @import url('https://db.onlinewebfonts.com/c/99828060a7b4c37c24e6f4a654664654?family=Retropix');
        
        @font-face {
          font-family: 'Retropix';
          src: url('https://db.onlinewebfonts.com/t/99828060a7b4c37c24e6f4a654664654.eot');
          src: url('https://db.onlinewebfonts.com/t/99828060a7b4c37c24e6f4a654664654.eot?#iefix') format('embedded-opentype'),
               url('https://db.onlinewebfonts.com/t/99828060a7b4c37c24e6f4a654664654.woff2') format('woff2'),
               url('https://db.onlinewebfonts.com/t/99828060a7b4c37c24e6f4a654664654.woff') format('woff'),
               url('https://db.onlinewebfonts.com/t/99828060a7b4c37c24e6f4a654664654.ttf') format('truetype'),
               url('https://db.onlinewebfonts.com/t/99828060a7b4c37c24e6f4a654664654.svg#Retropix') format('svg');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        .retropix-text {
          font-family: 'Retropix', 'Press Start 2P', monospace !important;
        }
        
        .scanlines { display: none !important; }
      `}</style>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/media/landing.mp4" type="video/mp4" />
          </video>
          
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-black/60" />
          
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-7xl md:text-8xl font-bold mb-6 glitch-text" data-text="HABITUATE" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                HABITUATE
              </h1>
              
              <motion.p
                className="text-lg md:text-1lg text-gray-300 mb-8 max-w-1lg mx-auto retropix-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
               Track your progress | Build better habits | Compete with friends.
                
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Link href="/auth" style={{ textDecoration: 'none' }}>
  <svg
    width="240"
    height="70"
    viewBox="0 0 240 70"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      cursor: "pointer",
      imageRendering: "pixelated",
      shapeRendering: "crispEdges",
    }}
  >
    {/* === WHITE BORDER (horizontal & vertical) === */}
    <rect x="12" y="0" width="216" height="4" fill="white" />
    <rect x="0" y="12" width="4" height="46" fill="white" />
    <rect x="236" y="12" width="4" height="46" fill="white" />
    <rect x="12" y="66" width="216" height="4" fill="white" />

    {/* === PERFECT 3-STEP DIAGONAL CORNERS (MATCHING YOUR IMAGE) === */}

    {/* TOP-LEFT */}
    <rect x="0"  y="8" width="8" height="4" fill="white" />
    <rect x="4"  y="4" width="8" height="4" fill="white" />
    <rect x="8"  y="0" width="8" height="4" fill="white" />

    {/* TOP-RIGHT */}
    <rect x="232" y="8" width="8" height="4" fill="white" />
    <rect x="228" y="4" width="8" height="4" fill="white" />
    <rect x="224" y="0" width="8" height="4" fill="white" />

    {/* BOTTOM-LEFT */}
    <rect x="0"  y="58" width="8" height="4" fill="white" />
    <rect x="4"  y="62" width="8" height="4" fill="white" />
    <rect x="8"  y="66" width="8" height="4" fill="white" />

    {/* BOTTOM-RIGHT */}
    <rect x="232" y="58" width="8" height="4" fill="white" />
    <rect x="228" y="62" width="8" height="4" fill="white" />
    <rect x="224" y="66" width="8" height="4" fill="white" />

    {/* === PURPLE INNER BACKGROUND === */}
    {/* <rect x="8" y="8" width="224" height="54" fill="#3d2176" /> */}

    {/* === TEXT === */}
    <text
      x="120"
      y="45"
      textAnchor="middle"
      fill="white"
      fontFamily="'Press Start 2P', monospace"
      fontSize="16"
      fontWeight="bold"
    >
      Get Started!
    </text>
  </svg>
</Link>



              </motion.div>
            </motion.div>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-center mb-16 neon-glow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why HABITUATE?
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm hover:border-purple-500/60 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4 neon-border">
                    <feature.icon className="text-purple-400" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <footer className="py-12 px-4 border-t border-purple-500/30 bg-black/40">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4 neon-glow" style={{ fontFamily: "'Press Start 2P', cursive" }}>HABITUATE</h3>
                <p className="text-gray-400">
                  Gamify your habits and level up your life.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><Link href="/auth" className="text-gray-400 hover:text-purple-400 transition-colors">Get Started</Link></li>
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-purple-400 transition-colors">Dashboard</Link></li>
                  <li><Link href="/leaderboard" className="text-gray-400 hover:text-purple-400 transition-colors">Leaderboard</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Features</h4>
                <ul className="space-y-2">
                  <li className="text-gray-400">Habit Tracking</li>
                  <li className="text-gray-400">Streak System</li>
                  <li className="text-gray-400">XP & Leveling</li>
                  <li className="text-gray-400">Badges & Rewards</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-purple-500/20 text-center">
              <p className="text-gray-500">
                © 2025 HABITUATE. Built with ❤️ for Codenovate
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

const features = [
  {
    icon: Target,
    title: 'Track Habits',
    description: 'Create and monitor daily habits with an intuitive interface',
  },
  {
    icon: Zap,
    title: 'Streak System',
    description: 'Build momentum with streak tracking and achieve consistency',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    description: 'Compete with friends and climb the global rankings',
  },
  {
    icon: Users,
    title: 'Clans!',
    description: 'Share progress and motivate each other to stay',
  },
];
