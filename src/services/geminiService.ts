import { GoogleGenAI } from "@google/genai";
import { Project, Skill, Experience, Education, Profile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const generateSystemInstruction = (
  profile: Profile | null,
  projects: Project[],
  skills: Skill[],
  experience: Experience[],
  education: Education[]
) => {
  const skillsList = skills.map(s => `${s.name} (${s.category})`).join(", ");
  const projectsList = projects.map(p => `- ${p.title}: ${p.description}`).join("\n");
  const experienceList = experience.map(e => `- ${e.role} at ${e.company} (${e.period}): ${e.description}`).join("\n");
  const educationList = education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.period})`).join("\n");

  return `You are an AI assistant for Hesbon Nchoro's projects website (Nchoro TechHub). 
Your goal is to help visitors learn more about Hesbon, his skills, projects, and professional background.

About Hesbon:
${profile?.aboutMe || "Hesbon Nchoro is a multi-disciplinary professional with expertise in design, development, and data analytics."}
Tagline: ${profile?.tagline || "Bridging Design, Development, and Data."}

Skills:
${skillsList}

Projects:
${projectsList}

Professional Experience:
${experienceList}

Education:
${educationList}

Guidelines:
1. Be professional, friendly, and helpful.
2. Answer questions based on the provided information.
3. If you don't know the answer, politely suggest the visitor to contact Hesbon directly via the contact page.
4. Keep responses concise and engaging.
5. You can mention that Hesbon is open to collaborations and new opportunities.
6. If asked about his contact info, mention his email: nchorohesbon96@gmail.com and phone: 0741070704.
`;
};

export const createChatSession = (systemInstruction: string) => {
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction,
    },
  });
};
