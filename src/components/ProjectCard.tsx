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
      <div className="relative aspect-video overflow-hidden bg-white/5">
        <img
          src={project.imageUrl || `https://picsum.photos/seed/${project.id}/800/450`}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('picsum.photos')) {
              target.src = `https://picsum.photos/seed/${project.id}/800/450`;
            }
          }}
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
      <div className="p-8">
        <div className="flex items-center justify-between mb-4">
          <span className={cn(
            "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
            project.category === 'design' ? "border-brand-accent/30 text-brand-accent bg-brand-accent/5" :
            project.category === 'development' ? "border-brand-primary/30 text-brand-primary bg-brand-primary/5" :
            "border-brand-secondary/30 text-brand-secondary bg-brand-secondary/5"
          )}>
            {project.category}
          </span>
          <span className="text-[10px] text-gray-500 font-mono uppercase">{project.createdAt}</span>
        </div>
        
        <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-brand-primary transition-colors leading-tight">
          {project.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-8 line-clamp-2 leading-relaxed font-light">
          {project.description}
        </p>

        <Link
          to={`/project/${project.id}`}
          className="group/btn inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-brand-primary transition-all"
        >
          Explore Project <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
