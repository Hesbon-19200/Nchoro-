import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Send, MessageSquare, Mail, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import { motion } from 'motion/react';
import { db, collection, doc, setDoc, handleFirestoreError, OperationType } from '../firebase';
import PhoneInput from 'react-phone-number-input';

interface ContactFormData {
  name: string;
  email: string;
  whatsapp: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    try {
      const docRef = doc(collection(db, 'messages'));
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
      });
      
      toast.success('Message sent successfully! I will get back to you soon.');
      reset();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'messages');
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Get in <span className="text-gradient">Touch</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have a project in mind or just want to say hi? Feel free to reach out. I'm always open to new opportunities and collaborations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div className="glass p-10 rounded-[2.5rem] space-y-10 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -z-10" />
              <h2 className="text-3xl font-display font-bold mb-8">Contact Details</h2>
              
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  <Mail size={28} />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-2">Email Address</div>
                  <a href="mailto:nchorohesbon96@gmail.com" className="text-xl font-bold hover:text-brand-primary transition-colors tracking-tight">nchorohesbon96@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  <Phone size={28} />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-2">Phone / WhatsApp</div>
                  <a href="tel:0741070704" className="text-xl font-bold hover:text-brand-secondary transition-colors tracking-tight">0741070704</a>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  <MessageSquare size={28} />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-2">Digital Presence</div>
                  <div className="flex gap-6 mt-3">
                    {['LinkedIn', 'Twitter', 'Instagram'].map(platform => (
                      <a key={platform} href="#" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-1">
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-10 rounded-[2.5rem] bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border-white/5 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl -z-10" />
              <h3 className="text-2xl font-display font-bold mb-6">Strategic Partnership</h3>
              <ul className="space-y-4">
                {[
                  'Multi-disciplinary creative strategy',
                  'User-centric digital experiences',
                  'Data-driven architectural decisions',
                  'Clean, scalable, and robust code'
                ].map(item => (
                  <li key={item} className="flex items-center gap-4 text-gray-400 font-light">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="glass p-10 md:p-16 rounded-[2.5rem] space-y-8 border border-white/5 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-gray-700"
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="text-[10px] font-bold text-brand-accent ml-1">{errors.name.message}</span>}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-gray-700"
                    placeholder="john@example.com"
                  />
                  {errors.email && <span className="text-[10px] font-bold text-brand-accent ml-1">{errors.email.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">WhatsApp Number</label>
                  <Controller
                    name="whatsapp"
                    control={control}
                    rules={{ required: 'WhatsApp number is required' }}
                    render={({ field }) => (
                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all overflow-hidden">
                        <PhoneInput
                          {...field}
                          defaultCountry="KE"
                          placeholder="e.g. +254 741 070704"
                        />
                      </div>
                    )}
                  />
                  {errors.whatsapp && <span className="text-[10px] font-bold text-brand-accent ml-1">{errors.whatsapp.message}</span>}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Subject</label>
                  <input
                    {...register('subject', { required: 'Subject is required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all placeholder:text-gray-700"
                    placeholder="Project Inquiry"
                  />
                  {errors.subject && <span className="text-[10px] font-bold text-brand-accent ml-1">{errors.subject.message}</span>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Message Details</label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all resize-none placeholder:text-gray-700"
                  placeholder="Describe your vision or requirements..."
                />
                {errors.message && <span className="text-[10px] font-bold text-brand-accent ml-1">{errors.message.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-gradient-brand rounded-2xl font-bold uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? 'Transmitting...' : 'Send Message'} <Send size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
