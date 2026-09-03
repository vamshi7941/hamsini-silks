import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { hasAnalyticsConsent } from '../utils/cookieConsent';
import { generateSlug } from '@/utils/slug';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send } from 'lucide-react';
import { slugify } from '@/utils/cn';

// in-memory chat state that survives component unmounts but resets on full page reload
// this ensures chat persists when closing/opening the chatbox in the same page session
let chatMemory: any = null;

export default function Chatbot() {
  const { user, products, siteContent, showToast, setSelectedCategory } = useStore();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false); // chat window open
  const [showBubble, setShowBubble] = useState(false); // bubble visibility when consented
  const [flowStep, setFlowStep] = useState<'init' | 'phone' | 'name' | 'menu' | 'list' | 'product'>('init');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [listItems, setListItems] = useState<any[]>([]);
  const [listMode, setListMode] = useState<'categories' | 'products' | null>(null);
  const [messages, setMessages] = useState<Array<{ id: number; from: 'bot' | 'user'; text: string }>>([]);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // show chat bubble only if analytics consent exists (user accepted cookies)
    if (!hasAnalyticsConsent()) return;
    setShowBubble(true);

    // try to restore previous chat state (messages, flowStep, phone, name) from in-memory cache
    try {
      const parsed = chatMemory;
      if (parsed) {
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          setMessages(parsed.messages);
        }
        if (parsed.flowStep) setFlowStep(parsed.flowStep);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.name) setName(parsed.name);
      }
    } catch (err) {
      // ignore restore errors
      console.error('Failed to restore chat state', err);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    // if we already have messages restored from storage, do not duplicate the intro
    if (messages.length === 0) {
      if (user.loggedIn) {
        addBotMessage('Hello! How can I help you today? You can browse categories or our hand-picked items.');
        setFlowStep('menu');
      } else {
        addBotMessage('Welcome! Enter the mobile number to start the chat, or open WhatsApp.');
        setFlowStep('phone');
      }
    } else {
      // ensure flowStep is set appropriately if missing
      if (!messages.some((m) => m.text && typeof m.text === 'string')) {
        setFlowStep(user.loggedIn ? 'menu' : 'phone');
      }
    }
  }, [visible, user.loggedIn]);

  useEffect(() => scrollToBottom(), [messages]);

  // persist chat state in-memory so conversation continues when chat is closed and reopened
  // this intentionally does NOT persist across full page reloads
  useEffect(() => {
    if (!hasAnalyticsConsent()) return;
    try {
      const state = { messages, flowStep, phone, name, updatedAt: Date.now() };
      chatMemory = state;
    } catch (err) {
      // ignore storage errors
      console.error('Failed to save chat state', err);
    }
  }, [messages, flowStep, phone, name]);

  const addBotMessage = (text: string) => {
    setMessages((m) => [...m, { id: Date.now() + Math.floor(Math.random() * 1000), from: 'bot', text }]);
  };

  const addUserMessage = (text: string) => {
    setMessages((m) => [...m, { id: Date.now() + Math.floor(Math.random() * 1000), from: 'user', text }]);
  };

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const openWhatsApp = () => {
    // open support chat number (replace with business number if available)
    const waNumber = '917702696161';
    const text = encodeURIComponent('Hi, I would like to chat about products');
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
  };

  const submitPhone = async () => {
    const normalized = phone.replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(normalized)) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return;
    }

    if (!user.loggedIn) {
      setPhone(normalized);
      addUserMessage(normalized);
      addBotMessage("Thanks — what's your name?");
      setFlowStep('name');
    }
  };

  const submitNameAndSave = async () => {
    const normalizedName = String(name || '').trim();
    addUserMessage(normalizedName || '');

    const payload = { phone, name: normalizedName };
    try {
      await fetch(`${(import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001'}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      addBotMessage('Thanks! I have saved your contact. What would you like to browse?');
    } catch (err) {
      console.error('Failed saving lead', err);
      addBotMessage('Thanks — proceeding without saving to server.');
    }

    setFlowStep('menu');
  };

  const showCategories = () => {
    setListItems(siteContent.categories || []);
    setListMode('categories');
    addBotMessage('Here are the categories. Tap any to open the category page.');
    setFlowStep('list');
  };

  const showHandpicked = () => {
    const ids = siteContent.handpickedProducts?.productIds || [];
    const list = products.filter((p) => ids.includes(p._id));
    setListItems(list);
    setListMode('products');
    addBotMessage('Here are our hand-picked selections. Tap any product to view details.');
    setFlowStep('list');
  };

  const onSelectCategory = (cat: any) => {
    // navigate using raw category name as requested: /category/{categoryName}
    const rawName = String(cat.name || cat.label || 'All');
    console.log('Navigating to category:', rawName);
    // set selected category in store so UI reflects selection
    try {
      setSelectedCategory(rawName);
    } catch (err) {
      // ignore if setter not available
    }

    navigate(`/category/${slugify(rawName)}`);
    setVisible(false);
    setShowBubble(true);
  };

  const onSelectProduct = (p: any) => {
    const slug = generateSlug(p._id, p.name);
    navigate(`/product/${slug}`);
    setVisible(false);
    setShowBubble(true);
  };

  // If bubble should be shown but chat isn't open
  if (!visible && showBubble) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          aria-label="Open chat"
          onClick={() => setVisible(true)}
          className="h-16 w-16 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform" style={{ backgroundColor: 'var(--color-maroon-500)' }}
        >
          {/* chat icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.84L3 20l1.24-3.74A7.962 7.962 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px]">
      <div className="flex flex-col h-[420px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--color-maroon-500)' }}>
                <MessageCircle size={22} className="text-white" />
              </div>

              <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-black leading-none">
                Hamsini Assistant
              </h3>

              <p className="text-sm text-gray-400 mt-1">Online</p>
            </div>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="text-gray-500 hover:text-gray-700 text-4xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Chat Area */}
        <div
          ref={messagesRef}
          className="flex-1 overflow-auto bg-[#eef1f4] px-5 py-5 space-y-4 text-[14px]"
        >
          {messages.length === 0 && (
            <div className="text-center text-sm text-gray-400 mt-6">
              Start a conversation
            </div>
          )}

          {/* Messages */}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "bot" ? "justify-start" : "justify-end"
                }`}
            >
              <div>
                {m.from === "bot" && (
                  <div className="flex items-center gap-2 mb-2 ml-1">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: 'var(--color-maroon-500)' }}>
                      HA
                    </div>

                    <span className="text-sm font-medium text-gray-700">
                      Hamsini Assistant
                    </span>
                  </div>
                )}

                <div
                  className={`max-w-[280px] px-5 py-3 text-[14px] leading-relaxed shadow-sm ${m.from === "bot" ? "bg-white text-gray-800 rounded-[20px]" : "text-white rounded-[20px]"}`}
                  style={m.from === "bot" ? undefined : { backgroundColor: 'var(--color-maroon-500)' }}
                >
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {/* Phone Step */}
          {flowStep === "phone" && (
            <div className="flex flex-col items-center gap-3 mt-4">
              <div className="bg-white rounded-[20px] p-4 max-w-full">

                <div className="flex gap-2">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Mobile Number"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                  />

                  <button
                    onClick={submitPhone}
                    className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: 'var(--color-maroon-500)' }}
                  >
                    Next
                  </button>
                </div>
              </div>

              <button
                onClick={openWhatsApp}
                className="px-8 py-2 rounded-full border-2 font-semibold bg-white transition" style={{ borderColor: 'var(--color-maroon-500)', color: 'var(--color-maroon-500)' }}
              >
                Open WhatsApp
              </button>
            </div>
          )}

          {/* Name Step */}
          {flowStep === "name" && (
            <div className="bg-white p-4 rounded-[20px]">
              <p className="text-sm text-gray-700">
                Thanks! What's your name?
              </p>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full mt-3 border border-gray-300 rounded-lg px-3 py-2"
              />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={submitNameAndSave}
                  className="flex-1 text-white py-2 rounded-lg" style={{ backgroundColor: 'var(--color-maroon-500)' }}
                >
                  Start Chat
                </button>

                <button
                  onClick={() => setFlowStep("phone")}
                  className="flex-1 border py-2 rounded-lg"
                >
                  Back
                </button>
              </div>

              <button
                onClick={openWhatsApp}
                className="mt-3 px-8 py-2 rounded-full border-2 font-semibold bg-white transition" style={{ borderColor: 'var(--color-maroon-500)', color: 'var(--color-maroon-500)' }}
              >
                Chat on WhatsApp
              </button>
            </div>
          )}

          {/* Menu Buttons (matches screenshot) */}
          {flowStep === "menu" && (
            <div className="flex flex-col items-center gap-4 mt-6">
              <button
                onClick={showCategories}
                className="px-8 py-2 rounded-full border-2 font-semibold bg-white transition" style={{ borderColor: 'var(--color-maroon-500)', color: 'var(--color-maroon-500)' }}
              >
                📂 Categories
              </button>

              <button
                onClick={showHandpicked}
                className="px-8 py-2 rounded-full border-2 font-semibold bg-white transition" style={{ borderColor: 'var(--color-maroon-500)', color: 'var(--color-maroon-500)' }}
              >
                ⭐ Hand-picked
              </button>
            </div>
          )}

          {/* Products / Categories List */}
          {flowStep === "list" && (
            <div className="space-y-3">
              {listItems.length === 0 && (
                <div className="text-center text-gray-500">
                  No items found
                </div>
              )}

              {listItems.map((it) => (
                <div
                  key={it._id || it.slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => (listMode === 'products' ? onSelectProduct(it) : onSelectCategory(it))}
                  onKeyDown={(e) => { if (e.key === 'Enter') (listMode === 'products' ? onSelectProduct(it) : onSelectCategory(it)); }}
                  className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 focus:outline-none"
                >
                  <div className="font-medium text-gray-800">
                    {it.name || it.label}
                  </div>
                </div>
              ))}

              <button
                onClick={() => setFlowStep("menu")}
                className="w-full py-2 rounded-full border border-gray-300 bg-white"
              >
                Back
              </button>

              <button
                onClick={openWhatsApp}
                className="w-full py-2 rounded-full border-2 font-medium bg-white" style={{ borderColor: 'var(--color-maroon-500)', color: 'var(--color-maroon-500)' }}
              >
                Chat on WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
