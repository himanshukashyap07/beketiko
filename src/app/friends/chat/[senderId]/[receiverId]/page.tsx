"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";

interface Message {
    _id: string;
    content: string;
    sender: string;
    reciver: string;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;
}

let socket: Socket;

export default function Page() {
    const params = useParams();
    const senderId = params.senderId as string;
    const receiverId = params.receiverId as string;
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const msgContainerRef = useRef<HTMLDivElement>(null);

    const room = [senderId, receiverId].sort().join("_");

    // ---------------------------------------------------
    // FETCH PAGINATED MESSAGES
    // ---------------------------------------------------
    const fetchMessages = async (pageNumber: number) => {
        const res = await axios.get(
            `https://chatbackend-2frf.onrender.com/api/msg/${senderId}/${receiverId}?page=${pageNumber}&limit=30`
        );

        const data = res.data.data;

        if (data.length === 0) {
            setHasMore(false);
            return;
        }

        // On page 1 → replace messages
        if (pageNumber === 1) {
            setMessages(data);
        } else {
            // On next pages → prepend older messages
            setMessages((prev) => [...data, ...prev]);
        }
    };

    // ---------------------------------------------------
    // LOAD MORE WHEN SCROLL TOP
    // ---------------------------------------------------
    const handleScroll = () => {
        const container = msgContainerRef.current;
        if (!container || !hasMore) return;

        if (container.scrollTop === 0) {
            const nextPage = page + 1;
            setPage(nextPage);

            const oldHeight = container.scrollHeight;

            fetchMessages(nextPage).then(() => {
                setTimeout(() => {
                    container.scrollTop = container.scrollHeight - oldHeight;
                }, 80);
            });
        }
    };

    // ---------------------------------------------------
    // SEND/UPDATE MESSAGE
    // ---------------------------------------------------
    const sendMessage = async () => {
        if (!text.trim()) return;

        if (editingId) {
            await axios.put(
                `https://chatbackend-2frf.onrender.com/api/msg/${editingId}`,
                { content: text }
            );
            setEditingId(null);
            setText("");
            return;
        }

        await axios.post("https://chatbackend-2frf.onrender.com/api/msg", {
            content: text,
            sender: senderId,
            reciver: receiverId,
        });

        setText("");
    };

    // ---------------------------------------------------
    // DELETE MESSAGE
    // ---------------------------------------------------
    const deleteMsg = async (id: string) => {
        await axios.delete(`https://chatbackend-2frf.onrender.com/api/msg/${id}`);
    };

    // ---------------------------------------------------
    // SOCKET SETUP
    // ---------------------------------------------------
    useEffect(() => {
        socket = io("https://chatbackend-2frf.onrender.com/");
        socket.emit("join", senderId);
        socket.emit("join-room", { room });

        fetchMessages(1); // Load latest 15

        socket.on("new-message", (msg: Message) => {
            if (
                (msg.sender === senderId && msg.reciver === receiverId) ||
                (msg.sender === receiverId && msg.reciver === senderId)
            ) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        socket.on("message-updated", (msg: Message) => {
            setMessages((prev) =>
                prev.map((m) => (m._id === msg._id ? msg : m))
            );
        });

        socket.on("message-deleted", (msg: Message) => {
            setMessages((prev) =>
                prev.map((m) =>
                    m._id === msg._id ? { ...m, isDelete: true } : m
                )
            );
        });

        socket.on("typing", (sender) => {
            if (sender !== senderId) setTypingUser(sender);
        });

        socket.on("stop-typing", () => setTypingUser(null));

        return () => {
            socket.disconnect();
        };
    }, [senderId, receiverId, messages]);

    // ---------------------------------------------------
    // TYPING INDICATOR
    // ---------------------------------------------------
    useEffect(() => {
        if (!text) {
            socket.emit("stop-typing", { room, sender: senderId });
            return;
        }

        socket.emit("typing", { room, sender: senderId });

        const timeout = setTimeout(() => {
            socket.emit("stop-typing", { room, sender: senderId });
        }, 800);

        return () => clearTimeout(timeout);
    }, [text]);

    // ---------------------------------------------------
    // AUTO SCROLL FOR NEW MESSAGES ONLY
    // ---------------------------------------------------
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------
    return (
        <div className="h-screen flex flex-col text-black bg-gray-100">
            <div className="p-4 bg-blue-600 text-white text-lg font-semibold">
                Chat with {receiverId}
            </div>

            {/* MESSAGES */}
            <div
                ref={msgContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto text-black p-4 space-y-3"
            >
                {messages.map((msg) => {
                    const isMe = msg.sender === senderId;
                    return (
                        <div
                            key={msg._id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`p-3 max-w-xs rounded-lg ${isMe
                                    ? "bg-blue-500 text-white rounded-br-none"
                                    : "bg-gray-300 text-black rounded-bl-none"
                                    }`}
                            >
                                <p>
                                    {msg.isDelete ? "Message deleted" : msg.content}
                                </p>


                                {!msg.isDelete && isMe && (
                                    <div className="flex gap-2 mt-1 text-xs opacity-90">
                                        <button
                                            className="bg-green-400 px-2 rounded-full"
                                            onClick={() => {
                                                setEditingId(msg._id);
                                                setText(msg.content);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-400 px-2 rounded-full"
                                            onClick={() => deleteMsg(msg._id)}>
                                            Delete
                                        </button>
                                    </div>
                                )}
                                <div>
                                    {
                                        !msg.isDelete && (
                                            <div className="flex justify-between">
                                                <span className="text-xs">
                                                    {
                                                        (new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", }) !== new Date(msg.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", })) ? "Edited" : ""
                                                    }
                                                </span>
                                                <span className="text-xs">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    );
                })}

                {typingUser && (
                    <div className="px-4 py-1 text-sm text-gray-600">
                        {typingUser} is typing...
                    </div>
                )}
                <div ref={scrollRef}></div>

            </div>

            {/* INPUT */}
            <div className="p-4 bg-white flex text-black gap-2 border-t">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                    className="flex-1 p-2 border rounded-lg"
                />

                <button
                    onClick={sendMessage}
                    className="px-4 bg-blue-600 text-white rounded-lg"
                >
                    {editingId ? "Update" : "Send"}
                </button>
            </div>
        </div>
    );


}
