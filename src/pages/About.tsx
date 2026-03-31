import Navbar from '../components/Navbar';
import { motion } from 'motion/react';
import { User, Award, Briefcase, GraduationCap, Code, Palette, BarChart, Settings, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skill, Profile, Experience, Education } from '../types';
import { subscribeToSkills } from '../services/skillService';
import { subscribeToProfile } from '../services/profileService';
import { subscribeToExperience } from '../services/experienceService';
import { subscribeToEducation } from '../services/educationService';

export default function About() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeSkills = subscribeToSkills(setSkills);
    const unsubscribeProfile = subscribeToProfile(setProfile);
    const unsubscribeExperience = subscribeToExperience(setExperience);
    const unsubscribeEducation = subscribeToEducation((data) => {
      setEducation(data);
      setIsLoading(false);
    });

    return () => {
      unsubscribeSkills();
      unsubscribeProfile();
      unsubscribeExperience();
      unsubscribeEducation();
    };
  }, []);

  const skillCategories = [
    { name: 'Design', icon: <Palette size={20} /> },
    { name: 'Development', icon: <Code size={20} /> },
    { name: 'Analytics', icon: <BarChart size={20} /> },
    { name: 'Tools', icon: <Settings size={20} /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="text-brand-primary animate-spin" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden border-2 border-brand-primary/20 p-4">
              <img
                src={profile?.profileImageUrl || "https://picsum.photos/seed/profile/800/800"}
                alt="Profile"
                className="w-full h-full object-cover rounded-[2.5rem]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('picsum.photos')) {
                    target.src = "https://picsum.photos/seed/profile/800/800";
                  }
                }}
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-brand-secondary/20 rounded-full blur-3xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold">About <span className="text-gradient">Me</span></h1>
            <div className="space-y-4">
              {profile?.aboutMe ? (
                profile.aboutMe.split('\n').map((para, i) => (
                  <p key={i} className="text-gray-400 text-lg leading-relaxed">
                    {para}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Hello! I'm a multi-disciplinary creator based in the digital world. With a background that merges design aesthetics, software engineering, and data science, I bring a unique perspective to every project I undertake.
                  </p>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    My journey started with a passion for visual storytelling, which naturally evolved into building the platforms that host those stories. Today, I focus on creating seamless digital experiences that are not only beautiful but also functional and data-driven.
                  </p>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <User size={20} />
                </div>
                <span className="font-semibold">Creative Mind</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                  <Briefcase size={20} />
                </div>
                <span className="font-semibold">Problem Solver</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Skills Section */}
        <section className="mb-32">
          <h2 className="text-4xl font-display font-bold mb-16 text-center">Technical <span className="text-gradient">Expertise</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skillCategories.map((cat) => (
              <div key={cat.name} className="glass p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl -z-10" />
                <div className="flex items-center gap-4 mb-10 text-brand-primary">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center shadow-inner">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{cat.name}</h3>
                </div>
                <div className="space-y-8">
                  {isLoading ? (
                    <div className="h-20 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : skills.filter(s => s.category === cat.name).length > 0 ? (
                    skills.filter(s => s.category === cat.name).map((skill) => (
                      <div key={skill.id} className="space-y-3">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                          <span className="text-gray-400">{skill.name}</span>
                          <span className="text-brand-primary">{skill.proficiency}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.proficiency}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No skills added yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <section className="space-y-8">
            <h2 className="text-3xl font-display font-bold flex items-center gap-3">
              <Briefcase className="text-brand-primary" /> Experience
            </h2>
            <div className="space-y-6">
              {experience.length > 0 ? (
                experience.map((exp) => (
                  <div key={exp.id} className="glass p-6 rounded-2xl border-l-4 border-brand-primary">
                    <div className="text-sm text-brand-primary font-bold mb-1">{exp.period}</div>
                    <h3 className="text-xl font-bold mb-1">{exp.role}</h3>
                    <div className="text-gray-400 text-sm mb-3">{exp.company}</div>
                    <p className="text-gray-500 text-sm">{exp.description}</p>
                  </div>
                ))
              ) : (
                <div className="glass p-8 rounded-2xl text-center text-gray-500 italic">
                  No work experience added yet.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-display font-bold flex items-center gap-3">
              <GraduationCap className="text-brand-secondary" /> Education
            </h2>
            <div className="space-y-6">
              {education.length > 0 ? (
                education.map((edu) => (
                  <div key={edu.id} className="glass p-6 rounded-2xl border-l-4 border-brand-secondary">
                    <div className="text-sm text-brand-secondary font-bold mb-1">{edu.period}</div>
                    <h3 className="text-xl font-bold mb-1">{edu.degree}</h3>
                    <div className="text-gray-400 text-sm mb-3">{edu.institution}</div>
                    {edu.description && <p className="text-gray-500 text-sm">{edu.description}</p>}
                  </div>
                ))
              ) : (
                <div className="glass p-8 rounded-2xl text-center text-gray-500 italic">
                  No education history added yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
