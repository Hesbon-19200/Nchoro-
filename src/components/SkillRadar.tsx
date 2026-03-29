import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Skill } from '../types';

interface SkillRadarProps {
  skills: Skill[];
}

export default function SkillRadar({ skills }: SkillRadarProps) {
  // Group skills by category and calculate average proficiency
  const categories = ['Design', 'Development', 'Analytics', 'Tools & Others'];
  
  const data = categories.map(cat => {
    const catSkills = skills.filter(s => s.category === cat);
    const avgProficiency = catSkills.length > 0
      ? catSkills.reduce((acc, s) => acc + s.proficiency, 0) / catSkills.length
      : 0;
    
    return {
      subject: cat,
      A: avgProficiency,
      fullMark: 100,
    };
  });

  if (skills.length === 0) return null;

  return (
    <div className="w-full h-[300px] md:h-[400px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
