import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Download, Loader2, MousePointer2, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Profile } from '../types';
import { getProfile } from '../services/profileService';

export default function Hero() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (isLoading) {
    return (
      <section className="relative pt-32 pb-20 flex items-center justify-center min-h-[400px]">
        <Loader2 className="text-brand-primary animate-spin" size={48} />
      </section>
    );
  }

  return (
    <section ref={containerRef} className="relative pt-32 pb-40 overflow-hidden min-h-screen flex items-center">
      {/* Background Glows */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-[120px] -z-10" 
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-secondary/20 rounded-full blur-[120px] -z-10" 
      />

      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-[10%] w-20 h-20 glass rounded-2xl border border-white/10 hidden lg:flex items-center justify-center text-brand-primary/40 -z-10"
      >
        <MousePointer2 size={40} />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-primary mb-6"
          >
            Available for new projects
          </motion.span>
          <h1 className="text-5xl md:text-8xl font-display font-bold mb-6 leading-tight tracking-tighter">
            {profile?.tagline || (
              <>Creative <span className="text-gradient">Designer</span> & <br />
              Full-Stack <span className="text-gradient">Developer</span></>
            )}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {profile?.aboutMeShort || "I build high-performance web applications, design stunning visuals, and analyze complex data to solve real-world problems."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/portfolio"
              className="w-full sm:w-auto px-10 py-5 bg-gradient-brand rounded-full font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-all hover:scale-105 active:scale-95"
            >
              View My Work <ArrowRight size={18} />
            </Link>
            {profile?.cvUrl && (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
              >
                Download CV <Download size={18} />
              </a>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-12"
        >
          {[
            { label: 'Projects Completed', value: '50+' },
            { label: 'Years Experience', value: '5+' },
            { label: 'Happy Clients', value: '30+' },
            { label: 'Design Awards', value: '12' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity }}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll</span>
          <ChevronDown size={20} />
        </motion.div>
      </div>
    </section>
  );
}
