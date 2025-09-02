import React, { useState } from 'react';
import { Palette, Download, Loader2, Sparkles } from 'lucide-react';

interface GeneratedImage {
  url: string;
  prompt: string;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState('');

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedImage({
          url: data.imageUrl,
          prompt: data.prompt,
        });
      } else {
        setError(data.error || 'Failed to generate image');
      }
    } catch (err) {
      setError('Network error. Please make sure the server is running.');
      console.error('Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading image:', err);
      setError('Failed to download image');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      generateImage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-10 h-10 text-white" />
            <h1 className="text-5xl font-bold text-white">AI Art Generator</h1>
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Transform your imagination into stunning artwork using the power of AI. 
            Enter a description and watch your ideas come to life.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Input Section */}
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-white font-medium mb-3 text-lg">
                  Describe your artwork
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="A serene mountain landscape at sunset with purple clouds..."
                  className="w-full px-4 py-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm resize-none transition-all duration-300"
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              <button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Your Artwork...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Image
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg backdrop-blur-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Generated Image Section */}
          {generatedImage && (
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-8 shadow-2xl animate-fade-in">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <img
                    src={generatedImage.url}
                    alt={generatedImage.prompt}
                    className="rounded-xl shadow-2xl max-w-full h-auto border-2 border-white/20"
                    style={{ maxHeight: '512px' }}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-white/80 text-sm italic max-w-lg mx-auto">
                    "{generatedImage.prompt}"
                  </p>
                  
                  <button
                    onClick={downloadImage}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-lg border border-white/30 transition-all duration-300 backdrop-blur-sm hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    Download Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isGenerating && !generatedImage && (
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-12 shadow-2xl">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto">
                  <Loader2 className="w-16 h-16 animate-spin text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Creating Your Artwork</h3>
                <p className="text-white/70">
                  Our AI is working hard to bring your vision to life...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pb-8">
          <p className="text-white/60 text-sm">
            Powered by OpenAI DALL-E 2 • Built with React & Express
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;