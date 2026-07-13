"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("techstore_user");
    if (!user) {
      alert("Kamu harus login dulu untuk menggunakan AI Assistant!");
      router.push("/");
    }
  }, [router]);
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string; products?: any[] }>>([
    {
      role: "ai",
      content: "Halo! Saya AI Assistant dari TechStore. Mau cari laptop untuk kebutuhan apa hari ini? Sebutkan juga budget kamu ya!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // First, try to get recommendations from our FastAPI endpoint through Laravel
      // Usually, we'd send the extracted needs. For now, let's simulate sending chat to Laravel.
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await res.json();
      
      // Simulate checking if AI returned a specific product list, or just text
      // We'll mock a product response if the user mentions "budget" and "laptop"
      let productMock = undefined;
      let aiContent = "Maaf, saya tidak mengerti pertanyaanmu.";
      
      if (data?.choices?.[0]?.message?.content) {
          aiContent = data.choices[0].message.content;
      } else if (data?.error) {
          const errMsg = typeof data.error === 'object' ? JSON.stringify(data.error) : data.error;
          aiContent = `[Error AI]: ${errMsg}. ${data.details || data.message || ''}`;
      } else {
          aiContent = `[System Error]: Gagal mendapatkan respon valid. Respons mentah: ${JSON.stringify(data).substring(0, 100)}...`;
      }
      
      // Extract JSON block if AI decided to recommend
      const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/i;
      const fallbackRegex = /(\{[\s\S]*"intent"\s*:\s*"recommendation"[\s\S]*?\})/i;
      const match = aiContent.match(jsonRegex) || aiContent.match(fallbackRegex);
      
      if (match) {
        try {
          const sanitizedJson = match[1].replace(/,\s*([\}\]])/g, '$1');
          const params = JSON.parse(sanitizedJson);
          if (params.intent && params.intent.toLowerCase() === "recommendation") {
            // Remove the JSON block from the text shown to user
            aiContent = aiContent.replace(match[0], "").trim();
            
            const recRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendation`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(params)
            });
            const recData = await recRes.json();
            if (recData.recommendations && recData.recommendations.length > 0) {
              productMock = recData.recommendations;
            }
          }
        } catch (e) {
          console.error("Failed to parse AI JSON", e);
        }
      }

      // MOCK: Save log to database
      const userObj = localStorage.getItem("techstore_user");
      let userId = null;
      if (userObj) {
        try { userId = JSON.parse(userObj).id; } catch(e){}
      }
      
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_message: userMessage,
            ai_response: aiContent,
            user_id: userId
          })
        });
      } catch (e) {
        console.error("Gagal menyimpan log", e);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: aiContent,
          products: productMock,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Oops, terjadi kesalahan sistem saat menghubungi AI Gateway." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <a href="/" className="text-gray-500 hover:text-gray-800 transition-colors mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </a>
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">TechStore AI</h1>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-4xl mx-auto flex flex-col gap-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

              {/* Product Cards Integration */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {msg.products.map((p, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <a href={`/product/${p.id}`} target="_blank" className="hover:text-blue-600 transition-colors">
                          <h3 className="font-bold text-gray-900 leading-tight">{p.name}</h3>
                        </a>
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                          Match: {Math.round(p.similarity_score * 100)}%
                        </span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">Rp {p.price.toLocaleString("id-ID")}</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>RAM: {p.ram} GB | Storage: {p.storage} GB</p>
                      </div>
                      <button 
                        onClick={() => addToCart(p)}
                        className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex justify-center items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        Tambah ke Keranjang
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t p-4 pb-8 md:pb-4">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya soal laptop, budget, atau spec..."
            className="w-full resize-none bg-white text-black placeholder-gray-500 border border-gray-300 rounded-2xl pl-4 pr-14 py-3 min-h-[52px] max-h-[150px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">AI dapat membuat kesalahan. Harap verifikasi info penting.</p>
      </footer>
    </div>
  );
}
