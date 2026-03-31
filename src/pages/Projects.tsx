import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import { Project, ProjectCategory } from '../types';
import { cn } from '../lib/utils';
import { subscribeToProjects } from '../services/projectService';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal } from 'lucide-react';

const categories: { id: ProjectCategory | 'all'; name: string }[] = [
  { id: 'all', name: 'All' },
  { id: 'design', name: 'Design' },
  { id: 'development', name: 'Dev' },
  { id: 'data', name: 'Data' },
];

export default function Projects() {
  const { category: urlCategory } = useParams<{ category?: ProjectCategory }>();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>(urlCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToProjects((data) => {
      setAllProjects(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProjects = useMemo(() => {
    return allProjects.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.toolsUsed.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allProjects, activeCategory, searchQuery]);

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold mb-6"
          >
            Nchoro <span className="text-gradient">TechHub</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Explore my work across various disciplines. Each project represents a unique challenge and a creative solution.
          </motion.p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-20 glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border",
                  activeCategory === cat.id 
                    ? "bg-brand-primary text-white border-transparent shadow-glow" 
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search projects, tools, or tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
              <Search size={32} />
            </div>
            <p className="text-gray-500 text-lg">No projects found matching your criteria.</p>
            <button 
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-4 text-brand-primary hover:underline font-semibold"
            >
              Clear all filters
            </button>
          </motion.div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-video bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
