import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, Github, Calendar, Tag, Layers } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Project } from '../types';
import { useState, useEffect } from 'react';
import { getProjectById } from '../services/projectService';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      try {
        const data = await getProjectById(id);
        if (data) setProject(data);
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProject();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen pt-32 pb-20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-8" />
          <p className="text-gray-500">Loading project details...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen pt-32 pb-20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-display font-bold mb-6">Project <span className="text-gradient">Not Found</span></h1>
          <Link to="/projects" className="text-brand-primary font-semibold">Back to Projects</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video rounded-[2rem] overflow-hidden border border-white/10 shadow-glow"
            >
              <img
                src={project.imageUrl || `https://picsum.photos/seed/${project.id}/1200/800`}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('picsum.photos')) {
                    target.src = `https://picsum.photos/seed/${project.id}/1200/800`;
                  }
                }}
              />
            </motion.div>

            <div className="space-y-8">
              <section>
                <h2 className="text-3xl font-display font-bold mb-4">The Challenge</h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  {project.problemStatement}
                </p>
              </section>

              <section>
                <h2 className="text-3xl font-display font-bold mb-4">The Solution</h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  {project.solution}
                </p>
              </section>
            </div>
          </div>

          {/* Sidebar Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="glass p-8 rounded-[2rem] space-y-6">
              <h1 className="text-3xl font-display font-bold">{project.title}</h1>
              <p className="text-gray-400">{project.description}</p>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <Tag size={18} className="text-brand-primary" />
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Category</div>
                    <div className="text-sm font-semibold capitalize">{project.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-brand-secondary" />
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Year</div>
                    <div className="text-sm font-semibold">{project.createdAt}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Layers size={18} className="text-brand-accent" />
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Tools Used</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {project.toolsUsed.map(tool => (
                        <span key={tool} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px]">{tool}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-gradient-brand rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-all"
                  >
                    Live Demo <ExternalLink size={18} />
                  </a>
                )}
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                  >
                    View Source <Github size={18} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
