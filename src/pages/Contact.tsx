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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="glass p-8 rounded-[2rem] space-y-8">
              <h2 className="text-2xl font-display font-bold mb-4">Contact Information</h2>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Email</div>
                  <a href="mailto:nchorohesbon96@gmail.com" className="text-lg font-semibold hover:text-brand-primary transition-colors">nchorohesbon96@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Phone / WhatsApp</div>
                  <a href="tel:0741070704" className="text-lg font-semibold hover:text-brand-secondary transition-colors">0741070704</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Socials</div>
                  <div className="flex gap-4 mt-2">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[2rem] bg-gradient-brand/10 border-brand-primary/20">
              <h3 className="text-xl font-display font-bold mb-4">Why work with me?</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Multi-disciplinary approach</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Focus on user-centric design</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Data-driven decision making</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Clean and maintainable code</li>
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="glass p-8 md:p-12 rounded-[2rem] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Your Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="text-xs text-brand-accent">{errors.name.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Email Address</label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                    placeholder="nchorohesbon96@gmail.com"
                  />
                  {errors.email && <span className="text-xs text-brand-accent">{errors.email.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">WhatsApp Number</label>
                  <Controller
                    name="whatsapp"
                    control={control}
                    rules={{ required: 'WhatsApp number is required' }}
                    render={({ field }) => (
                      <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all overflow-hidden">
                        <PhoneInput
                          {...field}
                          defaultCountry="KE"
                          placeholder="e.g. +254741070704"
                        />
                      </div>
                    )}
                  />
                  {errors.whatsapp && <span className="text-xs text-brand-accent">{errors.whatsapp.message}</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Subject</label>
                  <input
                    {...register('subject', { required: 'Subject is required' })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                    placeholder="Project Inquiry"
                  />
                  {errors.subject && <span className="text-xs text-brand-accent">{errors.subject.message}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Message</label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all resize-none"
                  placeholder="Tell me about your project..."
                />
                {errors.message && <span className="text-xs text-brand-accent">{errors.message.message}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-gradient-brand rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
