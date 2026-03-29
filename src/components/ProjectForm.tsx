import { useForm } from 'react-hook-form';
import { X, Save, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Project } from '../types';
import { motion } from 'motion/react';
import React, { useState, useRef } from 'react';
import { storage, ref, uploadBytes, getDownloadURL } from '../firebase';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Omit<Project, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(project?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors } } = useForm<Omit<Project, 'id'>>({
    defaultValues: project ? {
      title: project.title,
      category: project.category,
      description: project.description,
      problemStatement: project.problemStatement,
      solution: project.solution,
      toolsUsed: project.toolsUsed,
      imageUrl: project.imageUrl,
      githubLink: project.githubLink,
      liveLink: project.liveLink,
      createdAt: project.createdAt,
    } : {
      category: 'development',
      toolsUsed: [],
      createdAt: new Date().getFullYear().toString(),
    }
  });

  const imageUrl = watch('imageUrl');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      // Image compression options
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      toast.info('Compressing image...');
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
      
      setValue('imageUrl', downloadUrl);
      setPreviewUrl(downloadUrl);
      toast.success('Image optimized and uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm"
    >
      <div className="glass w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 md:p-12 relative">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-display font-bold mb-8">
          {project ? 'Edit Project' : 'Add New Project'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Image Upload */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-400">Project Image</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-3xl border-2 border-dashed border-white/10 hover:border-brand-primary/50 transition-all cursor-pointer overflow-hidden relative group"
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="text-white" size={32} />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
                    <Upload size={32} />
                    <span className="text-sm">Click to upload image</span>
                  </div>
                )}
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="text-brand-primary animate-spin" size={32} />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Or Image URL</label>
                <div className="relative">
                  <input
                    {...register('imageUrl', { required: 'Image URL is required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:border-brand-primary outline-none transition-all"
                    placeholder="https://picsum.photos/..."
                    onChange={(e) => setPreviewUrl(e.target.value)}
                  />
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                </div>
                {errors.imageUrl && <span className="text-xs text-brand-accent">{errors.imageUrl.message}</span>}
              </div>
            </div>

            {/* Right Column: Basic Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Project Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary outline-none transition-all"
                  placeholder="Eco-Friendly Brand Identity"
                />
                {errors.title && <span className="text-xs text-brand-accent">{errors.title.message}</span>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary outline-none transition-all appearance-none"
                >
                  <option value="design" className="bg-bg-card">Graphic Design</option>
                  <option value="development" className="bg-bg-card">Software Dev</option>
                  <option value="data" className="bg-bg-card">Data Analytics</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Year</label>
                <input
                  {...register('createdAt', { required: 'Year is required' })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary outline-none transition-all"
                  placeholder="2024"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Short Description</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary outline-none transition-all resize-none"
              placeholder="A brief overview of the project..."
            />
            {errors.description && <span className="text-xs text-brand-accent">{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Problem Statement</label>
              <textarea
                {...register('problemStatement')}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary outline-none transition-all resize-none"
                placeholder="What was the challenge?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Solution</label>
              <textarea
                {...register('solution')}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary outline-none transition-all resize-none"
                placeholder="How did you solve it?"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Tools Used (comma separated)</label>
              <input
                {...register('toolsUsed', { 
                  required: 'At least one tool is required',
                  setValueAs: (v: string) => typeof v === 'string' ? v.split(',').map(s => s.trim()).filter(Boolean) : v
                })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary outline-none transition-all"
                placeholder="React, Tailwind, Firebase"
                defaultValue={project?.toolsUsed?.join(', ')}
              />
              {errors.toolsUsed && <span className="text-xs text-brand-accent">{errors.toolsUsed.message}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">GitHub Link (Optional)</label>
              <input
                {...register('githubLink')}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary outline-none transition-all"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Live Demo Link (Optional)</label>
              <input
                {...register('liveLink')}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary outline-none transition-all"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-[2] py-4 bg-gradient-brand rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Project'} <Save size={20} />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
