import { useState } from 'react';
import { Send, Upload, FileText, Bot, User } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Corporate Policy Assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleIngest = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadStatus('Uploading...');
    try {
      const response = await fetch('http://localhost:8080/api/ingest', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setUploadStatus(`Ingested: ${file.name}`);
      } else {
        setUploadStatus('Upload failed.');
      }
    } catch (error) {
      setUploadStatus('Error uploading file.');
    }
  };

  const handleChat = async () => {
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 p-6 flex flex-col border-r border-slate-700">
        <div className="flex items-center gap-2 mb-8">
          <Bot className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold text-white">CorpRAG</h1>
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
            <input type="file" className="hidden" onChange={handleIngest} accept=".pdf,.docx,.txt" />
          </label>
          {uploadStatus && <p className="text-xs mt-2 text-slate-400">{uploadStatus}</p>}
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Knowledge Base</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-white cursor-pointer p-2 rounded hover:bg-slate-700">
            <FileText className="w-4 h-4" />
            <span>HR_Policy_2024.pdf</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
              <div className={`max-w-3xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600/20 text-blue-100' : 'bg-slate-800 text-slate-200'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                 <Bot className="w-5 h-5 text-white" />
               </div>
               <div className="bg-slate-800 p-4 rounded-2xl">
                 <div className="flex gap-1">
                   <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                   <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                   <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Ask a question about company policies..."
              className="w-full bg-slate-800 text-white rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            />
            <button
              onClick={handleChat}
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 mt-2">AI-generated answers may vary. Always verify with official documents.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
