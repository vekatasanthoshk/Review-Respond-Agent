import { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Star, Copy, RefreshCw, Sparkles, Building, MessageSquare, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [businessContext, setBusinessContext] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [starRating, setStarRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (!businessContext.trim()) {
      setError('Please provide some business context.');
      return;
    }
    
    if (!customerName.trim()) {
      setError("Please enter the customer's name.");
      return;
    }

    if (!reviewText.trim()) {
      setError("Please enter the customer's review.");
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedResponse('');
    setCopied(false);

    try {
      const prompt = `You are a professional customer success agent. 
Business Context: ${businessContext}

Customer Name: ${customerName}
Star Rating: ${starRating} out of 5
Review: "${reviewText}"

Task: Draft a professional, empathetic, and concise response to this review. 
- If 4 or 5 stars: Express gratitude and invite them back.
- If 1 to 3 stars: Apologize, address their specific concern, and offer an offline resolution.

Draft Response:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.4,
        }
      });

      if (response.text) {
        setGeneratedResponse(response.text.trim());
      } else {
        setError('Failed to generate response. Please try again.');
      }
    } catch (err) {
      console.error('Error generating response:', err);
      setError('An error occurred while generating the response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedResponse) {
      navigator.clipboard.writeText(generatedResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">Review Reply Agent</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Draft a response</h2>
              <p className="text-neutral-500 text-sm">
                Paste the customer's review and we'll draft a professional, empathetic reply.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
              
              {/* Business Context */}
              <div>
                <label htmlFor="businessContext" className="block text-sm font-medium text-neutral-700 mb-1">
                  Business Context <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <Building className="h-4 w-4 text-neutral-400" />
                  </div>
                  <textarea
                    id="businessContext"
                    rows={2}
                    value={businessContext}
                    onChange={(e) => setBusinessContext(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm transition-shadow resize-none"
                    placeholder="e.g. We are a family-owned Italian restaurant in Chicago."
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Customer Name */}
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-neutral-700 mb-1">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input
                      type="text"
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm transition-shadow"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Star Rating Left by Customer
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStarRating(star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= starRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-neutral-100 text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-medium text-neutral-600">
                      {starRating} {starRating === 1 ? 'Star' : 'Stars'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Review */}
              <div>
                <label htmlFor="reviewText" className="block text-sm font-medium text-neutral-700 mb-1">
                  Customer's Review <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MessageSquare className="h-4 w-4 text-neutral-400" />
                  </div>
                  <textarea
                    id="reviewText"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm transition-shadow resize-none"
                    placeholder="Paste the review here..."
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Drafting Reply...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Reply
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden min-h-[400px] flex flex-col">
                <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                  <h3 className="font-medium text-neutral-900">Drafted Response</h3>
                  {generatedResponse && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleGenerate()}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 relative">
                  <AnimatePresence mode="wait">
                    {isGenerating ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 space-y-4"
                      >
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-neutral-100 rounded-full"></div>
                          <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                        </div>
                        <p className="text-sm font-medium animate-pulse">Drafting the perfect reply...</p>
                      </motion.div>
                    ) : generatedResponse ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full"
                      >
                        <div className="prose prose-neutral max-w-none">
                          <p className="text-neutral-800 text-lg leading-relaxed whitespace-pre-wrap">
                            {generatedResponse}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 text-center px-6"
                      >
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                          <MessageSquare className="w-8 h-8 text-neutral-300" />
                        </div>
                        <p className="text-neutral-500 max-w-sm">
                          Fill out the form on the left and hit generate to see your custom reply here.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Pro tip */}
              <div className="mt-6 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3">
                <div className="shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-indigo-900">Agent Logic</h4>
                  <p className="text-sm text-indigo-700 mt-1">
                    <strong>4-5 Stars:</strong> Expresses gratitude and invites the customer back.<br/>
                    <strong>1-3 Stars:</strong> Apologizes, addresses the specific concern, and offers an offline resolution.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
