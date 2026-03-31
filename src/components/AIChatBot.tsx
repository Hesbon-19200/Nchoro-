import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { generateSystemInstruction, createChatSession } from '../services/geminiService';
import { getProjects } from '../services/projectService';
import { getSkills } from '../services/skillService';
import { getExperience } from '../services/experienceService';
import { getEducation } from '../services/educationService';
import { getProfile } from '../services/profileService';
import { Project, Skill, Experience, Education, Profile } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Hesbon's AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const [projectsRes, skillsRes, experienceRes, educationRes, profileRes] = await Promise.allSettled([
          getProjects(),
          getSkills(),
          getExperience(),
          getEducation(),
          getProfile()
        ]);

        const projects = projectsRes.status === 'fulfilled' ? projectsRes.value : [];
        const skills = skillsRes.status === 'fulfilled' ? skillsRes.value : [];
        const experience = experienceRes.status === 'fulfilled' ? experienceRes.value : [];
        const education = educationRes.status === 'fulfilled' ? educationRes.value : [];
        const profile = profileRes.status === 'fulfilled' ? profileRes.value : null;

        if (projectsRes.status === 'rejected') console.warn("Failed to fetch projects for AI chat", projectsRes.reason);
        if (skillsRes.status === 'rejected') console.warn("Failed to fetch skills for AI chat", skillsRes.reason);
        if (experienceRes.status === 'rejected') console.warn("Failed to fetch experience for AI chat", experienceRes.reason);
        if (educationRes.status === 'rejected') console.warn("Failed to fetch education for AI chat", educationRes.reason);
        if (profileRes.status === 'rejected') console.warn("Failed to fetch profile for AI chat", profileRes.reason);

        const systemInstruction = generateSystemInstruction(
          profile,
          projects,
          skills,
          experience,
          education
        );

        const session = createChatSession(systemInstruction);
        setChat(session);
      } catch (error) {
        console.error("Error initializing AI chat:", error);
      }
    };

    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chat || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error) {
      console.error("Error sending message to AI:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] glass rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-white/10"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-brand flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white">Hesbon's AI</h3>
                  <p className="text-xs text-white/70">Always online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/10 text-gray-400'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-brand-primary text-white rounded-tr-none' 
                        : 'bg-white/5 text-gray-300 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-white/10 text-gray-400 flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 text-gray-300 rounded-tl-none flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything about Hesbon..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center text-white hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          isOpen ? 'bg-white text-brand-primary' : 'bg-gradient-brand text-white'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
}
