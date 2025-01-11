"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [theme, setTheme] = useState("light"); // Theme state

  const apiKey = `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`;

  // Theme configurations
  const themes = {
    light: {
      backgroundColor: "white",
      textColor: "black",
      inputBackground: "white",
      inputBorder: "border-gray-300",
      inputText: "text-black",
      chatBackground: "bg-white/90",
      messageUserBackground: "bg-purple-500",
      messageUserText: "text-white",
      messageAIBackground: "bg-pink-100",
      messageAIText: "text-pink-800",
      codeBackground: "bg-gray-800",
      codeText: "text-green-400",
      listBackground: "bg-pink-50",
      listText: "text-pink-800",
      buttonBackground: "bg-purple-500",
      buttonHover: "hover:bg-purple-600",
      buttonDisabled: "bg-purple-300",
    },
    dark: {
      backgroundColor: "#121212",
      textColor: "white",
      inputBackground: "#1E1E1E",
      inputBorder: "border-gray-600",
      inputText: "text-white", // Input text is white in dark mode
      chatBackground: "bg-black/90",
      messageUserBackground: "bg-purple-700",
      messageUserText: "text-white",
      messageAIBackground: "bg-gray-700",
      messageAIText: "text-white",
      codeBackground: "bg-gray-900",
      codeText: "text-green-400",
      listBackground: "bg-gray-800",
      listText: "text-white",
      buttonBackground: "bg-purple-700",
      buttonHover: "hover:bg-purple-800",
      buttonDisabled: "bg-purple-400",
    },
  };

  const handleSend = async () => {
    if (!userPrompt.trim()) return;

    setLoading(true);

    // Add user message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: userPrompt,
        sender: "user",
      },
    ]);

    try {
      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: userPrompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiResponse = res.data.choices[0].message.content;

      // Format the AI response
      const formattedMessages = formatResponse(aiResponse);

      // Add AI response to the chat
      setMessages((prevMessages) => [...prevMessages, ...formattedMessages]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Error: Unable to fetch AI response.",
          sender: "ai",
          isCode: false,
        },
      ]);
    } finally {
      setLoading(false);
      setUserPrompt("");
    }
  };

  const formatResponse = (res) => {
    const parts = res.split(/(```[\s\S]*?```)/g);
    return parts.map((chunk) => {
      if (chunk.startsWith("```") && chunk.endsWith("```")) {
        return {
          text: chunk.slice(3, -3).trim(),
          sender: "ai",
          isCode: true,
        };
      } else if (chunk.match(/^\d+\.\s+/m)) {
        // Ordered list detection
        const listItems = chunk
          .split(/\n+/)
          .filter((line) => line.match(/^\d+\.\s+/)) // Match numbered list items
          .map((item) => item.replace(/^\d+\.\s+/, "").trim()); // Remove numbering
        return {
          text: listItems,
          sender: "ai",
          isCode: false,
          isList: true,
        };
      } else {
        return {
          text: chunk.trim(),
          sender: "ai",
          isCode: false,
        };
      }
    });
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{
        backgroundColor: themes[theme].backgroundColor,
        color: themes[theme].textColor,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4">
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={`px-3 py-2 ${
            theme === "light" ? "bg-gray-200 text-black" : "bg-gray-700 text-white"
          } rounded-lg hover:bg-opacity-80`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <div className="flex-grow mx-auto w-full max-w-2xl p-4">
        <div
          className={`${themes[theme].chatBackground} backdrop-blur-sm p-4 rounded-lg shadow-sm flex flex-col h-full`}
        >
          <div
            ref={chatContainerRef}
            className="overflow-y-auto mb-4 px-2 max-h-[75vh] w-full"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  msg.sender === "user" ? "text-right" : "text-left"
                }`}
              >
                {msg.isCode ? (
                  <div className="relative">
                    <pre
                      className={`${themes[theme].codeBackground} ${themes[theme].codeText} p-3 rounded-lg overflow-x-auto text-sm`}
                    >
                      <code>{msg.text}</code>
                    </pre>
                    <button
                      onClick={() => handleCopy(msg.text, index)}
                      className={`absolute top-2 right-2 ${
                        theme === "light" ? "bg-gray-700" : "bg-gray-600"
                      } text-white px-2 py-1 text-xs rounded hover:bg-${
                        theme === "light" ? "gray-600" : "gray-500"
                      }`}
                    >
                      {copiedIndex === index ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ) : msg.isList ? (
                  <div
                    className={`p-2 rounded-lg ${themes[theme].listBackground} ${themes[theme].listText} text-sm`}
                  >
                    <ol className="list-decimal ml-6">
                      {msg.text.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div
                    className={`inline-block p-2 rounded-lg text-sm ${
                      msg.sender === "user"
                        ? `${themes[theme].messageUserBackground} ${themes[theme].messageUserText}`
                        : `${themes[theme].messageAIBackground} ${themes[theme].messageAIText}`
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className={`p-2 rounded-lg ${themes[theme].messageAIBackground} ${themes[theme].messageAIText} text-sm`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`w-full max-w-2xl mx-auto p-4 ${themes[theme].chatBackground} backdrop-blur-sm border-t ${
          theme === "light" ? "border-gray-200" : "border-gray-600"
        }`}
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className={`flex-grow p-2 border ${
              theme === "light" ? "border-gray-300" : "border-gray-600"
            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm ${
              theme === "light" ? "bg-white" : "bg-gray-800"
            } ${themes[theme].inputText}`}
            placeholder="Type a message..."
          />
          <button
            disabled={isLoading}
            onClick={handleSend}
            className={`px-3 py-2 ${
              themes[theme].buttonBackground
            } text-white rounded-lg ${
              themes[theme].buttonHover
            } disabled:${themes[theme].buttonDisabled} disabled:cursor-not-allowed text-sm`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}