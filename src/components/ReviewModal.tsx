import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Sparkles, Upload, AlertCircle, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal = ({ isOpen, onClose, onSuccess }: ReviewModalProps) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 3;
  const MAX_FILE_SIZE_MB = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setErrorMessage(null);
    
    const files = Array.from(e.target.files);
    
    if (selectedFiles.length + files.length > MAX_IMAGES) {
      setErrorMessage(`You can only upload up to ${MAX_IMAGES} pictures per review.`);
      return;
    }

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setErrorMessage(`"${file.name}" is too heavy! Max file size limit is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrorMessage(`"${file.name}" is not a valid image format.`);
        return;
      }

      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...validPreviews]);
  };

  const removeImage = (index: number) => {
    setErrorMessage(null);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Raised dimension bounding box to 1200px for ultra-sharp large screen displays
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => resolve(blob || file),
            'image/jpeg',
            0.85 // Raised quality to 85% for high fidelity larger showcase layouts
          );
        };
      };
    });
  };

  const uploadToSupabaseStorage = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      const compressedBlob = await compressImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
      const filePath = fileName; 

      const standardizedFile = new File([compressedBlob], fileName, { type: 'image/jpeg' });

      const { data, error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(filePath, standardizedFile, {
          cacheControl: '31536000', 
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !text) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const imageUrls = await uploadToSupabaseStorage();
      const formattedHandle = handle.trim() 
        ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`)
        : '';

      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            name: name.trim(),
            handle: formattedHandle,
            text: text.trim(),
            rating,
            images: imageUrls, 
            is_approved: false 
          }
        ]);

      if (error) throw error;

      setSubmitSuccess(true);
      
      // ⏱️ UX FIX: Increased timer to 5 seconds so users can read the message comfortably
      setTimeout(() => {
        setSubmitSuccess(false);
        setName('');
        setHandle('');
        setText('');
        setRating(5);
        setSelectedFiles([]);
        setImagePreviews([]);
        onSuccess();
        onClose();
      }, 5000);
      
    } catch (err: any) {
      console.error("Submission error details:", err);
      setErrorMessage(err.message || "Could not save your review right now. Please try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex justify-center p-4 pt-12 overflow-y-auto min-h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-lg p-6 md:p-8 my-auto relative z-10 shadow-2xl overflow-hidden border border-slate-100"
          >
            <button 
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
                  <Sparkles className="w-10 h-10 animate-bounce" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-3">Magic Review Received!</h3>
                <p className="text-slate-500 text-sm max-w-sm leading-relaxed px-4">
                  Thank you for sharing your experience! Our team is reviewing your photos, and your submission will go live shortly.
                </p>
                <span className="text-xs text-slate-400 mt-8 block bg-slate-50 px-3 py-1 rounded-full animate-pulse">
                  Closing window automatically...
                </span>
              </motion.div>
            ) : (
              <>
                <div className="mb-5">
                  <h3 className="text-2xl font-display font-bold text-slate-900">Share the Love</h3>
                  <p className="text-slate-500 text-xs mt-1">Tell the Magic Circle community about your unboxing haul!</p>
                </div>

                <AnimatePresence mode="wait">
                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      className="bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 mb-4 shadow-sm"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed">
                        {errorMessage}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setErrorMessage(null)} 
                        className="text-rose-400 hover:text-rose-600 transition-colors ml-auto p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Your Rating
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => { setRating(starValue); setErrorMessage(null); }}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 transition-transform transform active:scale-95"
                        >
                          <Star className={`w-7 h-7 ${starValue <= (hoverRating ?? rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name field */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Name / Nickname *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Adeshola K."
                        value={name}
                        onChange={(e) => { setName(e.target.value); setErrorMessage(null); }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Social Handle <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. @themagicstore7"
                        value={handle}
                        onChange={(e) => { setHandle(e.target.value); setErrorMessage(null); }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Review Text Body */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Thoughts *
                    </label>
                    <textarea
                      required
                      rows={3}
                      maxLength={300}
                      placeholder="What did you think of the plushies, snacks, packaging, or shipping speed?"
                      value={text}
                      onChange={(e) => { setText(e.target.value); setErrorMessage(null); }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  {/* Photo Attachment Field Block */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Attach Photos <span className="text-slate-400 font-normal">(Max 3, up to 5MB)</span>
                    </label>
                    
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />

                    {imagePreviews.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 px-4 border-2 border-dashed border-slate-200 hover:border-primary/40 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-all bg-slate-50/50 mb-3"
                      >
                        <Upload className="w-4 h-4" />
                        Add Product Pictures
                      </button>
                    )}

                    {/* ✨ UX FIX: Massive, detailed, beautiful preview layout grids */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                        {imagePreviews.map((url, index) => (
                          <div 
                            key={index} 
                            className="relative aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden group border border-slate-100 shadow-sm bg-slate-100"
                          >
                            <img 
                              src={url} 
                              alt="Preview" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                            
                            {/* Overlay with subtle delete trigger action layout */}
                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                <Eye className="w-3 h-3" /> Ready
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-slate-900/80 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors shadow-md z-20"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !name || !text}
                    className="w-full bg-primary text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-primary/10 hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isSubmitting ? 'Optimizing & Uploading...' : 'Submit Magic Review'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};