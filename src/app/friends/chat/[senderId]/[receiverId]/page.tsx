"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { FaBackward } from "react-icons/fa";
import { signOut } from "next-auth/react";

interface Message {
    _id: string;
    content: string;
    sender: string;
    reciver: string;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function Page() {
    const params = useParams();
    const senderId = params.senderId as string;
    const receiverId = params.receiverId as string;

    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    const [onlineUsers, setOnlineUsers] = useState<string[]>([])
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const msgContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
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

        if (pageNumber === 1) {
            setMessages(data);
        } else {
            setMessages((prev) => [...data, ...prev]);
        }
    };

    // ---------------------------------------------------
    // SCROLL TO LOAD OLDER
    // ---------------------------------------------------
    const handleScroll = () => {
        const container = msgContainerRef.current;
        if (!container || !hasMore) return;

        if (container.scrollTop === 0) {
            const nextPage = page + 1;
            setPage(nextPage);

            const oldHeight = container.scrollHeight;

            fetchMessages(nextPage).then(() => {
                requestAnimationFrame(() => {
                    container.scrollTop = container.scrollHeight - oldHeight;
                });
            });
        }
    };

    // ---------------------------------------------------
    // SOCKET SETUP (FIXED)
    // ---------------------------------------------------
    useEffect(() => {
        const s = io("https://chatbackend-2frf.onrender.com", {
            transports: ["websocket"],
        });

        setSocket(s);

        s.on("connect", () => {
            s.emit("join", senderId);
            s.emit("join-room", { room });
            s.emit("join-user", receiverId)
        });

        fetchMessages(1);

        return () => {
            s.disconnect(); 
        };
    }, [senderId, receiverId, room]);

    //all emit and on event
    useEffect(() => {
        if (!socket) return;
        // New Message
        socket.on("new-message", (msg: Message) => {
            if (
                (msg.sender === senderId && msg.reciver === receiverId) ||
                (msg.sender === receiverId && msg.reciver === senderId)
            ) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        // Update
        socket.on("message-updated", (msg: Message) => {
            console.log("message updated");
            console.log(messages);

            setMessages((prev) =>
                prev.map((m) => (m._id === msg._id ? msg : m))
            );
            console.log(messages);

        });

        // Delete
        socket.on("message-deleted", (msg: Message) => {
            setMessages((prev) =>
                prev.map((m) =>
                    m._id === msg._id ? { ...m, isDelete: true } : m
                )
            );
        });

        // Typing
        socket.on("typing", (sender) => {
            if (sender !== senderId) setTypingUser(sender);
        });

        socket.on("stop-typing", () => setTypingUser(null));

        //online indicator
        socket.on("online-users", (users) => {
            setOnlineUsers(users);
        });


    }, [socket, room, senderId, receiverId])

    // ---------------------------------------------------
    // TYPING INDICATOR
    // ---------------------------------------------------
    useEffect(() => {
        if (!socket) return;

        if (!text) {
            socket.emit("stop-typing", { room, sender: senderId });
            return;
        }

        socket.emit("typing", { room, sender: senderId });

        const timeout = setTimeout(() => {
            socket.emit("stop-typing", { room, sender: senderId });
        }, 800);

        return () => clearTimeout(timeout);
    }, [text, socket]);

    // ---------------------------------------------------
    // AUTO SCROLL WHEN AT BOTTOM
    // ---------------------------------------------------
     useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth", 
            });
        }
    }, [messages]);

    // ---------------------------------------------------
    // SEND / UPDATE MESSAGE
    // ---------------------------------------------------
     const sendMessage = async () => {
        if (!text.trim()) return;

        if (editingId) {
            socket?.emit("edit-message", { room, msgId: editingId, newContent: text })
            setEditingId(null);
            setText("");
            return;
        }
        socket?.emit("send-message", {
            room,
            content: text,
            sender: senderId,
            reciver: receiverId
        })

        setText("");
    };

    const deleteMsg = async (id: string) => {
        socket?.emit("delete-message", { room, msgId: id })
    };

    // ---------------------------------------------------
    // UI STARTS
    // ---------------------------------------------------
    return (
        <div className="h-screen flex flex-col text-black bg-gray-100">
            <div className="p-4 bg-blue-600 text-white text-lg font-semibold flex justify-between px-10 items-center gap-4">
                <button onClick={() => router.replace("/friends")}>
                    <FaBackward className="text-xl" />
                </button>

                <div>
                    <button className="bg-orange-600 p-2 opacity-80 text-shadow-amber-600 border border-black rounded-lg" onClick={()=>signOut()}>
                        click me
                    </button>
                </div>
                {/* <div className="flex items-center gap-2">
                    <span>Chat with {receiverId}</span>
                </div> */}
            </div>

            <div
                ref={msgContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-3"
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
                                <p>{msg.isDelete ? "Message deleted" : msg.content}</p>

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
                                            onClick={() => deleteMsg(msg._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}

                                {!msg.isDelete && (
                                    <div className="flex justify-between text-xs mt-1">
                                        <span>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>

                                        <span>
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }) !==
                                                new Date(msg.updatedAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                ? "Edited"
                                                : ""}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            {typingUser && (
                <div className="px-4 py-1 text-sm text-gray-600">
                    {typingUser} is typing...
                </div>
            )}
            <div className="p-4 bg-white flex items-center gap-2 border-t">
                {onlineUsers && onlineUsers.includes(receiverId) ? (
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                ) : (
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                )}
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
                    className="px-4 h-10 bg-blue-600 text-white rounded-lg"
                >
                    {editingId ? "Update" : "Send"}
                </button>
            </div>
        </div>
    );
}
