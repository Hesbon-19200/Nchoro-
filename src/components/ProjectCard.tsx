import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { Project } from '../types';
import { cn } from '../lib/utils';

interface ProjectCardProps {
  project: Project;
  index: number;
  key?: string;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-bg-card rounded-3xl overflow-hidden border border-white/5 hover:border-brand-primary/30 transition-all hover:shadow-glow"
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <div className="flex gap-4">
            {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Github size={20} />
              </a>
            )}
            {project.liveLink && (
              <a href={project.liveLink} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <ExternalLink size={20} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            project.category === 'design' ? "bg-brand-accent/20 text-brand-accent" :
            project.category === 'development' ? "bg-brand-primary/20 text-brand-primary" :
            "bg-brand-secondary/20 text-brand-secondary"
          )}>
            {project.category}
          </span>
          <span className="text-xs text-gray-500">{project.createdAt}</span>
        </div>
        
        <h3 className="text-xl font-display font-bold mb-3 group-hover:text-brand-primary transition-colors">
          {project.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-2">
          {project.description}
        </p>

        <Link
          to={`/project/${project.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-brand-primary transition-colors"
        >
          View Case Study <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
}
