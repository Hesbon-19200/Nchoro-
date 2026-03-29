import React, { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit2, Trash2, LogOut, FolderKanban, MessageSquare, LogIn, Settings, User as UserIcon, Upload, Loader2, Save, Briefcase, GraduationCap, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import ProjectForm from '../components/ProjectForm';
import { Project, ContactMessage, Skill, Profile, Experience, Education } from '../types';
import { subscribeToProjects, deleteProject, addProject, updateProject } from '../services/projectService';
import { subscribeToSkills, deleteSkill, addSkill, updateSkill } from '../services/skillService';
import { getProfile, updateProfile } from '../services/profileService';
import { subscribeToExperience, deleteExperience, addExperience, updateExperience } from '../services/experienceService';
import { subscribeToEducation, deleteEducation, addEducation, updateEducation } from '../services/educationService';
import { subscribeToMessages, deleteMessage } from '../services/messageService';
import { cn } from '../lib/utils';
import { auth, loginWithGoogle, logout, onAuthStateChanged, db, collection, query, orderBy, onSnapshot, User, storage, ref, uploadBytes, getDownloadURL } from '../firebase';
import imageCompression from 'browser-image-compression';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'projects' | 'messages' | 'skills' | 'profile' | 'experience' | 'education'>('projects');
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [experienceList, setExperienceList] = useState<Experience[]>([]);
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [isSkillFormOpen, setIsSkillFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | undefined>(undefined);
  const [isExperienceFormOpen, setIsExperienceFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | undefined>(undefined);
  const [isEducationFormOpen, setIsEducationFormOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'project' | 'skill' | 'experience' | 'education' | 'message' } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  const ADMIN_EMAIL = 'nchorohesbon96@gmail.com';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        // Subscribe to projects
        const unsubscribeProjects = subscribeToProjects((data) => {
          setProjectsList(data);
          setIsLoading(false);
        });

        // Subscribe to messages
        const unsubscribeMessages = subscribeToMessages((data) => {
          setMessagesList(data);
        });

        // Subscribe to skills
        const unsubscribeSkills = subscribeToSkills((data) => {
          setSkillsList(data);
        });

        // Subscribe to experience
        const unsubscribeExperience = subscribeToExperience((data) => {
          setExperienceList(data);
        });

        // Subscribe to education
        const unsubscribeEducation = subscribeToEducation((data) => {
          setEducationList(data);
        });

        // Fetch profile
        getProfile().then(data => {
          if (data) setProfile(data);
          else setProfile({ aboutMe: '', tagline: '' });
        });

        return () => {
          unsubscribeProjects();
          unsubscribeMessages();
          unsubscribeSkills();
          unsubscribeExperience();
          unsubscribeEducation();
        };
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      toast.success('Project deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await deleteSkill(id);
      toast.success('Skill deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const handleSkillSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const skillData = {
      name: formData.get('name') as string,
      category: formData.get('category') as Skill['category'],
      proficiency: parseInt(formData.get('proficiency') as string),
      icon: formData.get('icon') as string || undefined,
    };

    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, skillData);
        toast.success('Skill updated');
      } else {
        await addSkill(skillData);
        toast.success('Skill added');
      }
      setIsSkillFormOpen(false);
      setEditingSkill(undefined);
    } catch (error) {
      toast.error('Failed to save skill');
    }
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSavingProfile(true);
    const formData = new FormData(e.currentTarget);
    const profileData: Profile = {
      tagline: formData.get('tagline') as string,
      aboutMe: formData.get('aboutMe') as string,
      aboutMeShort: formData.get('aboutMeShort') as string,
      profileImageUrl: profile.profileImageUrl,
      cvUrl: formData.get('cvUrl') as string,
    };

    try {
      await updateProfile(profileData);
      setProfile(profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsUploadingProfile(true);
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Image compression options
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      toast.info('Optimizing profile image...');
      let fileToUpload: File | Blob = file;
      try {
        fileToUpload = await imageCompression(file, options);
      } catch (compressionError) {
        console.warn('Image compression failed, uploading original file:', compressionError);
      }
      
      // Local Server Upload
      const formData = new FormData();
      formData.append('file', fileToUpload, file.name);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Server upload failed');
      }
      
      const { url: downloadUrl } = await response.json();
      
      const updatedProfile = { ...profile, profileImageUrl: downloadUrl };
      await updateProfile(updatedProfile);
      setProfile(updatedProfile);
      toast.success('Profile image updated');
    } catch (error) {
      console.error('Profile upload error:', error);
      toast.error(`Failed to upload profile image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleExperienceSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const experienceData = {
      role: formData.get('role') as string,
      company: formData.get('company') as string,
      period: formData.get('period') as string,
      description: formData.get('description') as string,
      order: parseInt(formData.get('order') as string) || 0,
    };

    try {
      if (editingExperience) {
        await updateExperience(editingExperience.id, experienceData);
        toast.success('Experience updated');
      } else {
        await addExperience(experienceData);
        toast.success('Experience added');
      }
      setIsExperienceFormOpen(false);
      setEditingExperience(undefined);
    } catch (error) {
      toast.error('Failed to save experience');
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await deleteExperience(id);
      toast.success('Experience deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete experience');
    }
  };

  const handleEducationSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const educationData = {
      degree: formData.get('degree') as string,
      institution: formData.get('institution') as string,
      period: formData.get('period') as string,
      description: formData.get('description') as string || '',
      order: parseInt(formData.get('order') as string) || 0,
    };

    try {
      if (editingEducation) {
        await updateEducation(editingEducation.id, educationData);
        toast.success('Education updated');
      } else {
        await addEducation(educationData);
        toast.success('Education added');
      }
      setIsEducationFormOpen(false);
      setEditingEducation(undefined);
    } catch (error) {
      toast.error('Failed to save education');
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      await deleteEducation(id);
      toast.success('Education deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete education');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteMessage(id);
      toast.success('Message deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleFormSubmit = async (data: Omit<Project, 'id'>) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
        toast.success('Project updated');
      } else {
        await addProject(data);
        toast.success('Project added');
      }
      setIsFormOpen(false);
      setEditingProject(undefined);
    } catch (error) {
      toast.error('Failed to save project');
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <Navbar />
        <div className="glass p-12 rounded-[3rem] text-center max-w-md w-full">
          <h1 className="text-3xl font-display font-bold mb-6">Admin <span className="text-gradient">Access</span></h1>
          <p className="text-gray-400 mb-8">Please log in with your authorized Google account to manage the portfolio.</p>
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-gradient-brand rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-all"
          >
            <LogIn size={20} /> Login with Google
          </button>
        </div>
      </main>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <main className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <Navbar />
        <div className="glass p-12 rounded-[3rem] text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserIcon size={40} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4 text-red-500">Access Denied</h1>
          <p className="text-gray-400 mb-2">The account <span className="text-white font-mono">{user.email}</span> is not authorized to access this dashboard.</p>
          <p className="text-gray-500 text-sm mb-8 italic">Only {ADMIN_EMAIL} can access the admin panel.</p>
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <LogOut size={20} /> Logout & Switch Account
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <img src={user.photoURL || ''} alt="" className="w-12 h-12 rounded-full border-2 border-brand-primary" />
            <div>
              <h1 className="text-3xl font-display font-bold">Admin <span className="text-gradient">Dashboard</span></h1>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('projects')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all",
                activeTab === 'projects' ? "bg-brand-primary text-white shadow-glow" : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              <FolderKanban size={20} /> Projects ({projectsList.length})
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all",
                activeTab === 'messages' ? "bg-brand-primary text-white shadow-glow" : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              <MessageSquare size={20} /> Messages ({messagesList.length})
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all",
                activeTab === 'skills' ? "bg-brand-primary text-white shadow-glow" : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              <Settings size={20} /> Skills ({skillsList.length})
            </button>

            <button
              onClick={() => setActiveTab('experience')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all",
                activeTab === 'experience' ? "bg-brand-primary text-white shadow-glow" : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              <Briefcase size={20} /> Experience ({experienceList.length})
            </button>

            <button
              onClick={() => setActiveTab('education')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all",
                activeTab === 'education' ? "bg-brand-primary text-white shadow-glow" : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              <GraduationCap size={20} /> Education ({educationList.length})
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all",
                activeTab === 'profile' ? "bg-brand-primary text-white shadow-glow" : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              <UserIcon size={20} /> Profile Settings
            </button>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">Manage Projects</h2>
                  <button
                    onClick={() => {
                      setEditingProject(undefined);
                      setIsFormOpen(true);
                    }}
                    className="px-6 py-3 bg-gradient-brand rounded-xl font-bold flex items-center gap-2 hover:shadow-glow transition-all"
                  >
                    <Plus size={20} /> Add Project
                  </button>
                </div>

                <div className="glass rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Project</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Category</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Date</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoading ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading projects...</td></tr>
                      ) : projectsList.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No projects found.</td></tr>
                      ) : projectsList.map((project) => (
                        <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={project.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <span className="font-semibold">{project.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              {project.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{project.createdAt}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProject(project);
                                  setIsFormOpen(true);
                                }}
                                className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: project.id, type: 'project' })}
                                className="p-2 text-gray-400 hover:text-brand-accent transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold">Inbound Messages</h2>
                <div className="grid grid-cols-1 gap-4">
                  {messagesList.length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl">
                      <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
                      <h2 className="text-xl font-display font-bold mb-2">No Messages Yet</h2>
                      <p className="text-gray-500">When people contact you, their messages will appear here.</p>
                    </div>
                  ) : messagesList.map((msg) => (
                    <div key={msg.id} className="glass p-6 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-lg">{msg.subject}</div>
                        <div className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-brand-primary">
                          <span className="font-semibold">{msg.name}</span>
                          <span className="text-gray-600">•</span>
                          <span>{msg.email}</span>
                        </div>
                        {msg.whatsapp && (
                          <div className="flex items-center gap-2 text-brand-secondary">
                            <span className="text-gray-600">•</span>
                            <Phone size={14} />
                            <span>{msg.whatsapp}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed bg-white/5 p-4 rounded-xl">{msg.message}</p>
                      <div className="flex items-center justify-end gap-3 pt-2">
                        {msg.whatsapp && (
                          <a
                            href={`https://wa.me/${msg.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-brand-secondary/10 text-brand-secondary rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-secondary/20 transition-colors"
                          >
                            <Phone size={16} /> Reply on WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => setDeleteConfirm({ id: msg.id, type: 'message' })}
                          className="px-4 py-2 bg-brand-accent/10 text-brand-accent rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-accent/20 transition-colors"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">Manage Skills</h2>
                  <button
                    onClick={() => {
                      setEditingSkill(undefined);
                      setIsSkillFormOpen(true);
                    }}
                    className="px-6 py-3 bg-gradient-brand rounded-xl font-bold flex items-center gap-2 hover:shadow-glow transition-all"
                  >
                    <Plus size={20} /> Add Skill
                  </button>
                </div>

                <div className="glass rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Skill</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Category</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Proficiency</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {skillsList.length === 0 ? (
                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No skills found.</td></tr>
                      ) : skillsList.map((skill) => (
                        <tr key={skill.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-semibold">{skill.name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              {skill.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-primary" style={{ width: `${skill.proficiency}%` }} />
                              </div>
                              <span className="text-xs text-gray-400">{skill.proficiency}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingSkill(skill);
                                  setIsSkillFormOpen(true);
                                }}
                                className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: skill.id, type: 'skill' })}
                                className="p-2 text-gray-400 hover:text-brand-accent transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">Manage Experience</h2>
                  <button
                    onClick={() => {
                      setEditingExperience(undefined);
                      setIsExperienceFormOpen(true);
                    }}
                    className="px-6 py-3 bg-gradient-brand rounded-xl font-bold flex items-center gap-2 hover:shadow-glow transition-all"
                  >
                    <Plus size={20} /> Add Experience
                  </button>
                </div>

                <div className="glass rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Role & Company</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Period</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {experienceList.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No experience found.</td></tr>
                      ) : experienceList.map((exp) => (
                        <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold">{exp.role}</div>
                            <div className="text-xs text-gray-500">{exp.company}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{exp.period}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingExperience(exp);
                                  setIsExperienceFormOpen(true);
                                }}
                                className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: exp.id, type: 'experience' })}
                                className="p-2 text-gray-400 hover:text-brand-accent transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">Manage Education</h2>
                  <button
                    onClick={() => {
                      setEditingEducation(undefined);
                      setIsEducationFormOpen(true);
                    }}
                    className="px-6 py-3 bg-gradient-brand rounded-xl font-bold flex items-center gap-2 hover:shadow-glow transition-all"
                  >
                    <Plus size={20} /> Add Education
                  </button>
                </div>

                <div className="glass rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Degree & Institution</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400">Period</th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {educationList.length === 0 ? (
                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No education found.</td></tr>
                      ) : educationList.map((edu) => (
                        <tr key={edu.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold">{edu.degree}</div>
                            <div className="text-xs text-gray-500">{edu.institution}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{edu.period}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingEducation(edu);
                                  setIsEducationFormOpen(true);
                                }}
                                className="p-2 text-gray-400 hover:text-brand-primary transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ id: edu.id, type: 'education' })}
                                className="p-2 text-gray-400 hover:text-brand-accent transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold">Profile Settings</h2>
                  <button
                    form="profile-form"
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-8 py-3 bg-gradient-brand rounded-xl font-bold flex items-center gap-2 hover:shadow-glow transition-all disabled:opacity-50"
                  >
                    {isSavingProfile ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Profile Image */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="glass p-6 rounded-3xl text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4 group">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-brand-primary/20">
                          {profile?.profileImageUrl ? (
                            <img src={profile.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500">
                              <UserIcon size={48} />
                            </div>
                          )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Upload className="text-white" size={24} />
                          <input type="file" className="hidden" onChange={handleProfileImageUpload} accept="image/*" />
                        </label>
                        {isUploadingProfile && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                            <Loader2 className="text-brand-primary animate-spin" size={24} />
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold mb-1">Profile Photo</h3>
                      <p className="text-xs text-gray-500">Click to upload new photo</p>
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="lg:col-span-2">
                    <form id="profile-form" onSubmit={handleProfileSubmit} className="glass p-8 rounded-3xl space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400">Hero Tagline</label>
                        <input
                          name="tagline"
                          defaultValue={profile?.tagline}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                          placeholder="e.g. Crafting Digital Experiences with Purpose"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400">Short About (Home Page)</label>
                        <textarea
                          name="aboutMeShort"
                          defaultValue={profile?.aboutMeShort}
                          rows={3}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors resize-none"
                          placeholder="A brief 1-2 sentence intro..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400">Full About Me</label>
                        <textarea
                          name="aboutMe"
                          defaultValue={profile?.aboutMe}
                          required
                          rows={8}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors resize-none"
                          placeholder="Tell your story..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400">CV / Resume URL</label>
                        <input
                          name="cvUrl"
                          defaultValue={profile?.cvUrl}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                          placeholder="Link to your PDF resume"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isFormOpen && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingProject(undefined);
          }}
        />
      )}

      {isSkillFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-[2.5rem] w-full max-w-md"
          >
            <h2 className="text-2xl font-display font-bold mb-6">{editingSkill ? 'Edit' : 'Add'} Skill</h2>
            <form onSubmit={handleSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Skill Name</label>
                <input
                  name="name"
                  defaultValue={editingSkill?.name}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g. React"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Category</label>
                <select
                  name="category"
                  defaultValue={editingSkill?.category || 'Development'}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                >
                  <option value="Design">Design</option>
                  <option value="Development">Development</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Tools">Tools</option>
                  <option value="Tools & Others">Tools & Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Proficiency (%)</label>
                <input
                  name="proficiency"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={editingSkill?.proficiency || 80}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Icon Name (Lucide)</label>
                <input
                  name="icon"
                  defaultValue={editingSkill?.icon}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g. Code"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSkillFormOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-brand hover:shadow-glow transition-all"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isEducationFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-[2.5rem] w-full max-w-md"
          >
            <h2 className="text-2xl font-display font-bold mb-6">{editingEducation ? 'Edit' : 'Add'} Education</h2>
            <form onSubmit={handleEducationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Degree</label>
                <input
                  name="degree"
                  defaultValue={editingEducation?.degree}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g. Bachelor of Science in Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Institution</label>
                <input
                  name="institution"
                  defaultValue={editingEducation?.institution}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g. University of Technology"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Period</label>
                <input
                  name="period"
                  defaultValue={editingEducation?.period}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g. 2018 - 2022"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  defaultValue={editingEducation?.description}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  placeholder="Brief description of your studies..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Display Order</label>
                <input
                  name="order"
                  type="number"
                  defaultValue={editingEducation?.order || 0}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEducationFormOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-brand hover:shadow-glow transition-all"
                >
                  Save Education
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {isExperienceFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 rounded-[2.5rem] w-full max-w-md"
          >
            <h2 className="text-2xl font-display font-bold mb-6">{editingExperience ? 'Edit' : 'Add'} Experience</h2>
            <form onSubmit={handleExperienceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Role</label>
                <input
                  name="role"
                  defaultValue={editingExperience?.role}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g. Senior Product Designer"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Company</label>
                <input
                  name="company"
                  defaultValue={editingExperience?.company}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g. Creative Agency"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Period</label>
                <input
                  name="period"
                  defaultValue={editingExperience?.period}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g. 2022 - Present"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Description (Optional)</label>
                <textarea
                  name="description"
                  defaultValue={editingExperience?.description}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  placeholder="Key responsibilities and achievements..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Display Order</label>
                <input
                  name="order"
                  type="number"
                  defaultValue={editingExperience?.order || 0}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsExperienceFormOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-brand hover:shadow-glow transition-all"
                >
                  Save Experience
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-8 rounded-[2.5rem] w-full max-w-sm text-center"
            >
              <div className="w-20 h-20 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} className="text-brand-accent" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Are you sure?</h2>
              <p className="text-gray-400 mb-8">
                This action cannot be undone. This {deleteConfirm.type} will be permanently removed.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-4 rounded-2xl font-bold bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === 'project') handleDelete(deleteConfirm.id);
                    else if (deleteConfirm.type === 'skill') handleDeleteSkill(deleteConfirm.id);
                    else if (deleteConfirm.type === 'experience') handleDeleteExperience(deleteConfirm.id);
                    else if (deleteConfirm.type === 'education') handleDeleteEducation(deleteConfirm.id);
                    else if (deleteConfirm.type === 'message') handleDeleteMessage(deleteConfirm.id);
                  }}
                  className="flex-1 py-4 rounded-2xl font-bold bg-brand-accent hover:bg-brand-accent/80 transition-colors text-white"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
