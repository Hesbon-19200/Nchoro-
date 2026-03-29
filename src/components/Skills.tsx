import { motion } from 'motion/react';
import { Palette, Code, BarChart3, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skill } from '../types';
import { subscribeToSkills } from '../services/skillService';
import SkillRadar from './SkillRadar';

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToSkills((data) => {
      setSkills(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const skillCategories = [
    {
      title: 'Graphic Design',
      category: 'Design',
      icon: Palette,
      color: 'text-brand-accent',
      bg: 'bg-brand-accent/10',
    },
    {
      title: 'Software Dev',
      category: 'Development',
      icon: Code,
      color: 'text-brand-primary',
      bg: 'bg-brand-primary/10',
    },
    {
      title: 'Data Analytics',
      category: 'Analytics',
      icon: BarChart3,
      color: 'text-brand-secondary',
      bg: 'bg-brand-secondary/10',
    },
    {
      title: 'Tools & Others',
      category: 'Tools & Others',
      icon: Settings,
      color: 'text-gray-400',
      bg: 'bg-white/5',
    }
  ];

  return (
    <section className="py-20 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Core <span className="text-gradient">Expertise</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A diverse skill set spanning across design, development, and data to deliver comprehensive digital solutions.
          </p>
        </div>

        {/* Skill Radar Chart */}
        {!isLoading && skills.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-20 flex justify-center"
          >
            <div className="glass p-8 rounded-[3rem] w-full max-w-2xl border border-white/10 shadow-glow/10">
              <h3 className="text-center text-xl font-display font-bold mb-6 text-gray-300">Proficiency Overview</h3>
              <SkillRadar skills={skills} />
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {skillCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl bg-bg-card border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <cat.icon className={cat.color} size={28} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-6">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {isLoading ? (
                  <div className="h-10 flex items-center justify-center w-full">
                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : skills.filter(s => s.category === cat.category).length > 0 ? (
                  skills.filter(s => s.category === cat.category).map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-default"
                    >
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs italic">No skills listed.</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
