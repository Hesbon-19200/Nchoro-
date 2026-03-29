import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Skills from '../components/Skills';
import ProjectCard from '../components/ProjectCard';
import { motion } from 'motion/react';
import { ArrowRight, Quote, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { useState, useEffect } from 'react';
import { subscribeToProjects } from '../services/projectService';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    content: "Hesbon's ability to bridge the gap between design and data is truly unique. He didn't just build a website; he built a data-driven experience that converted.",
    rating: 5
  },
  {
    name: "David Chen",
    role: "Tech Lead",
    content: "One of the most versatile developers I've worked with. His clean code and attention to detail in both frontend and backend are exceptional.",
    rating: 5
  },
  {
    name: "Elena Rodriguez",
    role: "Creative Director",
    content: "His design sensibility is top-notch. He has a way of making complex information look simple and beautiful. A true professional.",
    rating: 5
  }
];

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToProjects((data) => {
      setFeaturedProjects(data.slice(0, 3));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Skills />

      {/* Featured Projects Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Featured <span className="text-gradient">Projects</span></h2>
              <p className="text-gray-400 max-w-xl">
                A selection of my most impactful work across design, development, and data analytics.
              </p>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:gap-3 transition-all"
            >
              View All Projects <ArrowRight size={20} />
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video bg-white/5 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-12 glass rounded-3xl">
              <p className="text-gray-500">No projects added yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">What People <span className="text-gradient">Say</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Feedback from clients and colleagues I've had the pleasure of working with.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-3xl relative"
              >
                <Quote className="absolute top-6 right-8 text-brand-primary/20" size={40} />
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-brand-accent text-brand-accent" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{t.content}"</p>
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 -z-10" />
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
              Ready to bring your <br /> <span className="text-gradient">vision to life?</span>
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
              Whether you need a stunning design, a robust web application, or deep data insights, I'm here to help you succeed.
            </p>
            <Link
              to="/contact"
              className="px-10 py-5 bg-white text-bg-dark rounded-full font-bold hover:scale-105 transition-transform inline-block"
            >
              Let's Talk
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Hesbon Nchoro. Built with React & Tailwind CSS.
          </p>
        </div>
      </footer >
    </main>
  );
}
