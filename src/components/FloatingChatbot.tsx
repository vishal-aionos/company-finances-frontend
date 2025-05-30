import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ReportData, ReportSection } from './ReportTabsConfig';
import ReactMarkdown from 'react-markdown';

interface FloatingChatbotProps {
  reports: ReportData | null;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const CHAT_HISTORY_KEY = 'chatbot_history';

const FloatingChatbot = ({ reports }: FloatingChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Load from sessionStorage if available
    const saved = sessionStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          {
            id: '1',
            text: "Hello! I can answer questions about the financial data. What would you like to know?",
            isUser: false,
            timestamp: new Date().toLocaleTimeString()
          }
        ];
      }
    }
    return [
      {
        id: '1',
        text: "Hello! I can answer questions about the financial data. What would you like to know?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const defaultWidth = 480;
  const defaultHeight = 600;

  // Sync messages to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  // Clear chat history when company changes
  useEffect(() => {
    if (!reports?.annual?.company_name) return;
    const lastCompany = sessionStorage.getItem('chatbot_last_company');
    if (lastCompany !== reports.annual.company_name) {
      const welcomeMsg = [{
        id: '1',
        text: "Hello! I can answer questions about the financial data. What would you like to know?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      }];
      setMessages(welcomeMsg);
      sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(welcomeMsg));
      sessionStorage.setItem('chatbot_last_company', reports.annual.company_name);
    }
  }, [reports?.annual?.company_name]);

  // Drag handlers
  const onDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };
  const onDrag = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };
  const onDragEnd = () => setIsDragging(false);
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', onDragEnd);
    } else {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', onDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', onDragEnd);
    };
  }, [isDragging]);

  // Scroll to bottom logic
  useEffect(() => {
    if (isOpen && !showScrollButton) {
      chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isOpen]);
  const handleScroll = () => {
    if (!chatBodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    setShowScrollButton(scrollTop + clientHeight < scrollHeight - 40);
  };
  const scrollToBottom = () => {
    chatBodyRef.current?.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' });
    setShowScrollButton(false);
  };

  // Send message logic
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };
    // Add user message to state and sessionStorage
    setMessages(prev => {
      const next = [...prev, userMessage];
      sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
    setInputValue('');
    setIsTyping(true);
    try {
      // Prepare query params for GET request
      const companyName = reports?.annual?.company_name || 'Unknown';
      const reportsJson = encodeURIComponent(JSON.stringify(reports));
      const prompt = encodeURIComponent(userMessage.text);
      // Get last 5 messages (user and assistant)
      const allMessages = [...messages, userMessage];
      const chatHistory = allMessages.map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }));
      const historyParam = encodeURIComponent(JSON.stringify(chatHistory));
      const url = `https://llm-fin-analyser.onrender.com/api/chat?company_name=${companyName}&prompt=${prompt}&reports_json=${reportsJson}&history=${historyParam}`;
      const response = await fetch(url);
      let botText = 'Sorry, no response from server.';
      if (response.ok) {
        const data = await response.json();
        botText = data.answer || data.response || JSON.stringify(data);
      }
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: botText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      // Add assistant response to state and sessionStorage
      setMessages(prev => {
        const next = [...prev, botResponse];
        sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    } catch (err) {
      setMessages(prev => {
        const next = [...prev, {
          id: (Date.now() + 1).toString(),
          text: 'Error contacting server.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        }];
        sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    }
    setIsTyping(false);
  };

  // On open, reset position to default (bottom-right above icon)
  useEffect(() => {
    if (isOpen && !isDragging) {
      setPosition({ x: 0, y: 0 });
    }
    // eslint-disable-next-line
  }, [isOpen]);

  // Animate open/close
  const chatWindowClass = `transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'} ${isMinimized ? 'h-16 w-96' : `h-[${defaultHeight}px] w-[${defaultWidth}px]`} fixed z-50`;

  const generateBotResponse = (question: string, reports: ReportData | null): string => {
    if (!reports) {
      return "Please run an analysis first to get financial data that I can help you with.";
    }

    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('revenue') || lowerQuestion.includes('sales')) {
      return "Based on the analysis, revenue increased by 15% to $12.5 billion, showing strong growth across all segments.";
    }
    
    if (lowerQuestion.includes('profit') || lowerQuestion.includes('income')) {
      return "Operating income improved by 12% to $3.2 billion, driven by operational efficiencies and strategic investments.";
    }
    
    if (lowerQuestion.includes('rating') || lowerQuestion.includes('credit')) {
      return "The company maintains a high investment grade rating with a stable outlook, supported by strong balance sheet fundamentals.";
    }
    
    if (lowerQuestion.includes('outlook') || lowerQuestion.includes('future')) {
      return "The outlook remains positive with expected 8-10% growth in the next quarter, driven by strong market position and expansion opportunities.";
    }
    
    return "I can help you understand the financial data better. Try asking about revenue, profit, credit rating, or future outlook.";
  };

  return (
    <div>
      {/* Chat window */}
      {isOpen && (
        <div
          className={chatWindowClass}
          style={{
            bottom: position.y === 0 ? 104 : position.y + 24, // 104px above the icon (icon is 64px + 40px margin)
            right: position.x === 0 ? 24 : position.x + 24,
            minWidth: defaultWidth,
            maxWidth: defaultWidth,
            minHeight: isMinimized ? 64 : defaultHeight,
            maxHeight: defaultHeight,
            boxShadow: '0 8px 32px 0 rgba(30,41,59,0.18)',
            borderRadius: 18,
            background: '#fff',
            border: '2px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
          }}
        >
          {/* Header (draggable) */}
          <div
            className="cursor-move select-none flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 rounded-t-lg"
            onMouseDown={onDragStart}
          >
            <div className="flex items-center font-semibold text-slate-800">
              <span className="mr-2">💬</span> Financial Assistant
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="text-slate-500 hover:text-slate-700" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <span>🔼</span> : <span>🔽</span>}
              </Button>
              <Button size="icon" variant="ghost" className="text-slate-500 hover:text-slate-700" onClick={() => setIsOpen(false)}>
                ✕
              </Button>
            </div>
          </div>
          {/* Body */}
          {!isMinimized && (
            <>
              <div
                ref={chatBodyRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-white"
                style={{ minHeight: 0 }}
                onScroll={handleScroll}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg shadow-sm transition-all duration-200 ${
                        message.isUser
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {message.isUser ? (
                        <p className="text-sm">{message.text}</p>
                      ) : (
                        <div className="text-sm">
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />, 
                              h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />, 
                              h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />, 
                              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-xs p-3 rounded-lg bg-slate-100 text-slate-800 animate-pulse">
                      <span className="text-sm">Assistant is typing...</span>
                    </div>
                  </div>
                )}
              </div>
              {showScrollButton && (
                <button
                  className="absolute right-8 bottom-28 bg-slate-200 hover:bg-slate-300 rounded-full p-2 shadow transition"
                  onClick={scrollToBottom}
                  aria-label="Scroll to latest"
                >
                  ⬇️
                </button>
              )}
              {/* Input */}
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center" style={{ boxShadow: '0 -2px 8px 0 rgba(30,41,59,0.04)' }}>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about the financial data..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-200 bg-white"
                  style={{ marginRight: 8 }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-slate-800 hover:bg-slate-700 rounded-lg shadow px-6 py-2"
                >
                  Send
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      {/* Floating button */}
      <Button
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 shadow-2xl flex items-center justify-center z-50 transition-transform duration-300"
        style={{ boxShadow: '0 8px 32px 0 rgba(30,41,59,0.18)' }}
      >
        <span className="text-2xl">💬</span>
      </Button>
    </div>
  );
};

export default FloatingChatbot;
