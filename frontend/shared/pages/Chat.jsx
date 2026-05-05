import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Search, MoreVertical, Paperclip, Send, Check, CheckCheck,
  MessageSquare, UserCircle, ArrowLeft, MessageSquarePlus, Smile,
  Image as ImageIcon, FileText, Video as VideoIcon, Headphones, Mic, Camera,
  Download, ExternalLink, Users, UserPlus, Globe, ChevronDown, Reply, Trash2, CheckSquare, X,
  Copy, Forward, Pin, Star, Flag, SmilePlus, Plus, Ban
} from 'lucide-react';

const EMOJI_LIST = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '👁️‍🗨️', '🔚', '🔙', '🔛', '🔝', '🔜', '〰️', '➰', '➿', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '⬛', '⬜', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕣', '🕥', '🕦', '🕧'];

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const normalized = path.replace(/\\/g, '/');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState({ images: [], index: 0, isOpen: false });
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [selectedForwardUsers, setSelectedForwardUsers] = useState([]);
  const [reactionsPopupId, setReactionsPopupId] = useState(null);
  const [showFullEmojiPickerId, setShowFullEmojiPickerId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMsgTarget, setDeleteMsgTarget] = useState(null);
  const [forwardSearchQuery, setForwardSearchQuery] = useState('');
  const [showReactionDetailsId, setShowReactionDetailsId] = useState(null);

  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDeleteMessage = async (messageId, type = 'everyone') => {
    console.log(`[ACTION] Delete Message: ${messageId}, Type: ${type}`);
    try {
      const res = await axios.delete(`/api/chat/message/${messageId}?deleteType=${type}`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('[API] Delete success:', res.data);
      setActiveMenuId(null);
      if (type === 'me') {
        setMessages(prev => prev.filter(m => String(m._id) !== String(messageId)));
      }
    } catch (error) {
      console.error('[ERROR] Delete message:', error);
    }
  };

  const handleCopyMessage = (text) => {
    console.log('[ACTION] Copy Message:', text);
    navigator.clipboard.writeText(text);
    toast.success('Message copied', { position: 'bottom-center', duration: 2000 });
    setActiveMenuId(null);
  };

  const handleReactMessage = async (messageId, emoji) => {
    console.log(`[ACTION] React Message: ${messageId}, Emoji: ${emoji}`);

    // Optimistic UI Update
    setMessages(prev => prev.map(m => {
      if (String(m._id) === String(messageId)) {
        const reactions = [...(m.reactions || [])];
        const existingIdx = reactions.findIndex(r => String(r.userId) === String(currentUserId));
        if (existingIdx >= 0) {
          if (reactions[existingIdx].emoji === emoji) reactions.splice(existingIdx, 1);
          else reactions[existingIdx].emoji = emoji;
        } else {
          reactions.push({ userId: currentUserId, emoji });
        }
        return { ...m, reactions };
      }
      return m;
    }));

    try {
      await axios.post(`/api/chat/message/${messageId}/react`, { emoji }, { headers: { Authorization: `Bearer ${token}` } });
      setReactionsPopupId(null);
      setActiveMenuId(null);
    } catch (error) {
      console.error('[ERROR] React message:', error);
      toast.error('Failed to react');
    }
  };

  const handlePinMessage = async (messageId) => {
    console.log(`[ACTION] Pin Message: ${messageId}`);
    try {
      const res = await axios.post(`/api/chat/message/${messageId}/pin`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('[API] Pin success:', res.data);
      setActiveMenuId(null);
    } catch (error) {
      console.error('[ERROR] Pin message:', error);
    }
  };

  const handleStarMessage = async (messageId) => {
    console.log(`[ACTION] Star Message: ${messageId}`);
    try {
      const res = await axios.post(`/api/chat/message/${messageId}/star`, {}, { headers: { Authorization: `Bearer ${token}` } });
      console.log('[API] Star success:', res.data);
      setMessages(prev => prev.map(m => String(m._id) === String(messageId) ? { ...m, starredBy: res.data.starredBy } : m));
      setActiveMenuId(null);
    } catch (error) {
      console.error('[ERROR] Star message:', error);
    }
  };

  const handleForwardMessage = async () => {
    if (!forwardMsg || selectedForwardUsers.length === 0) return;
    console.log(`[ACTION] Forwarding Message: ${forwardMsg._id} to:`, selectedForwardUsers);
    try {
      await axios.post('/api/chat/message/forward', { messageId: forwardMsg._id, receiverIds: selectedForwardUsers });
      toast.success('Message forwarded');
      setForwardMsg(null);
      setSelectedForwardUsers([]);
    } catch (error) {
      console.error('[ERROR] Forward message:', error);
      toast.error('Failed to forward');
    }
  };

  const handleReplyMessage = (msg) => {
    setReplyingToMessage(msg);
    setActiveMenuId(null);
  };

  const toggleSelectMessage = (messageId) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) newSelected.delete(messageId);
    else newSelected.add(messageId);
    setSelectedMessages(newSelected);
  };
  const fileInputRef = useRef(null);
  const activeChatRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const token = sessionStorage.getItem('token');
  const userStr = sessionStorage.getItem('user');
  const currentUserObj = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUserObj?._id || currentUserObj?.id || sessionStorage.getItem('userId');
  const currentUserRole = currentUserObj?.role || sessionStorage.getItem('role');

  console.log('[SESSION] Current User:', { id: currentUserId, role: currentUserRole, hasToken: !!token });

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  useEffect(() => {
    if (!token || !currentUserId) return;

    const host = window.location.hostname;
    const socketUrl = host === 'localhost' ? 'http://localhost:5000' : `http://${host}:5000`;

    socketRef.current = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true
    });

    const joinRooms = () => {
      if (socketRef.current && currentUserId) {
        socketRef.current.emit('join_notifications', { userId: currentUserId, role: currentUserRole });
        socketRef.current.emit('get_online_users');
      }
    };

    socketRef.current.on('connect', joinRooms);
    if (socketRef.current.connected) joinRooms();

    socketRef.current.on('online_users', (usersArray) => setOnlineUsers(new Set(usersArray)));
    socketRef.current.on('user_status_change', ({ userId, status }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === 'online') newSet.add(userId); else newSet.delete(userId);
        return newSet;
      });
    });

    socketRef.current.on('message_deleted', ({ messageId, deleteType }) => {
      console.log(`[SOCKET] message_deleted received: ${messageId}, type: ${deleteType}`);
      if (deleteType === 'everyone') {
        setMessages(prev => prev.map(m => String(m._id) === String(messageId) ? { ...m, isDeleted: true, message: 'This message was deleted', attachment: null } : m));
      } else {
        setMessages(prev => prev.filter(m => String(m._id) !== String(messageId)));
      }
    });

    socketRef.current.on('message_reacted', ({ messageId, reactions }) => {
      console.log(`[SOCKET] message_reacted received for ${messageId}`);
      setMessages(prev => prev.map(m => String(m._id) === String(messageId) ? { ...m, reactions } : m));
    });

    socketRef.current.on('message_pinned', ({ messageId, isPinned }) => {
      console.log(`[SOCKET] message_pinned received for ${messageId}: ${isPinned}`);
      setMessages(prev => prev.map(m => String(m._id) === String(messageId) ? { ...m, isPinned } : m));
    });

    socketRef.current.on('receive_message', (message) => {
      const currentActiveChat = activeChatRef.current;
      setMessages(prev => {
        if (prev.find(m => String(m._id) === String(message._id))) return prev;
        const isMe = String(message.senderId) === String(currentUserId);
        // For group messages: chatId matches active group chat
        // For 1-on-1: sender or receiver matches active chat user
        const isFromActiveGroup = currentActiveChat?.isGroup && String(message.chatId) === String(currentActiveChat._id);
        const isFromActiveDM = !currentActiveChat?.isGroup && currentActiveChat && (
          String(message.senderId) === String(currentActiveChat._id) ||
          String(message.receiverId) === String(currentActiveChat._id)
        );
        if (isFromActiveGroup || isFromActiveDM || (isMe && !currentActiveChat?.isGroup && String(message.receiverId) === String(currentUserId))) return [...prev, message];
        if (isMe && (isFromActiveGroup || isFromActiveDM)) return [...prev, message];
        return prev;
      });

      setChats(prevChats => {
        const chatIndex = prevChats.findIndex(c => String(c._id) === String(message.chatId));
        if (chatIndex >= 0) {
          const updatedChats = [...prevChats];
          const isReceiver = String(message.receiverId) === String(currentUserId);
          const isSelfMsg = String(message.senderId) === String(currentUserId) && String(message.receiverId) === String(currentUserId);
          const isCurrentlyActive = currentActiveChat && (String(message.senderId) === String(currentActiveChat._id) || String(message.receiverId) === String(currentActiveChat._id));
          const shouldIncrementUnread = isReceiver && !isSelfMsg && (!isCurrentlyActive || String(message.senderId) !== String(currentActiveChat?._id));
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastMessage: { ...message, status: isReceiver && !shouldIncrementUnread ? 'seen' : message.status },
            unreadCount: (updatedChats[chatIndex].unreadCount || 0) + (shouldIncrementUnread ? 1 : 0)
          };
          const [movedChat] = updatedChats.splice(chatIndex, 1);
          return [movedChat, ...updatedChats];
        }
        return prevChats;
      });

      if (currentActiveChat && (String(message.senderId) === String(currentActiveChat._id) || String(message.receiverId) === String(currentActiveChat._id))) {
        if (String(message.senderId) !== String(currentUserId)) {
          markMessagesAsSeen(message.senderId);
        }
      } else if (String(message.senderId) !== String(currentUserId)) {
        socketRef.current.emit('mark_delivered', { messageId: message._id, senderId: message.senderId });
      }
    });

    socketRef.current.on('message_delivered', ({ messageId }) => {
      setMessages(prev => prev.map(m => String(m._id) === String(messageId) && m.status !== 'seen' ? { ...m, status: 'delivered' } : m));
      setChats(prevChats => prevChats.map(c => c.lastMessage && String(c.lastMessage._id) === String(messageId) && c.lastMessage.status !== 'seen' ? { ...c, lastMessage: { ...c.lastMessage, status: 'delivered' } } : c));
    });

    socketRef.current.on('messages_seen', ({ receiverId }) => {
      setMessages(prev => prev.map(m => String(m.receiverId) === String(receiverId) ? { ...m, status: 'seen' } : m));
    });

    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, [currentUserId, token]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [usersRes, chatsRes] = await Promise.all([
          axios.get('/api/chat/users', config),
          axios.get('/api/chat/list', config)
        ]);
        setUsers(usersRes.data || []);
        setChats(chatsRes.data || []);
      } catch (err) { console.error('Error fetching chat data:', err); }
      finally { setLoading(false); }
    };
    if (token) fetchInitialData();
  }, [token]);

  useEffect(() => {
    if (activeChat) {
      if (activeChat.isGroup) {
        fetchMessages(activeChat._id, true);
      } else {
        fetchMessages(activeChat._id, false);
        markMessagesAsSeen(activeChat._id);
      }
    }
  }, [activeChat]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchMessages = async (chatOrUserId, isGroup = false) => {
    try {
      let res;
      if (isGroup) {
        res = await axios.get(`/api/chat/group-messages/${chatOrUserId}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        res = await axios.get(`/api/chat/messages/${chatOrUserId}`, { headers: { Authorization: `Bearer ${token}` } });
      }
      console.log(`[API] Fetched ${isGroup ? 'Group' : 'Private'} Messages for ${chatOrUserId}:`, res.data);
      setMessages(res.data || []);
    } catch (err) {
      console.error('[API ERROR] Fetching messages:', err);
      toast.error('Failed to load messages');
    }
  };

  const markMessagesAsSeen = async (senderId) => {
    try {
      await axios.put('/api/chat/seen', { senderId }, { headers: { Authorization: `Bearer ${token}` } });
      setChats(prevChats => prevChats.map(c => c.participants.some(p => String(p._id) === String(senderId)) ? { ...c, unreadCount: 0, lastMessage: c.lastMessage ? { ...c.lastMessage, status: 'seen' } : c.lastMessage } : c));
    } catch (err) { console.error('Error marking as seen:', err); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    try {
      const isSelfChat = !activeChat.isGroup && String(activeChat._id) === String(currentUserId);
      const payload = {
        message: newMessage.trim(),
        receiverId: activeChat.isGroup ? null : (isSelfChat ? currentUserId : activeChat._id),
        chatId: activeChat.isGroup ? activeChat._id : null,
        replyTo: replyingToMessage ? replyingToMessage._id : null
      };
      setNewMessage('');
      setReplyingToMessage(null);
      const res = await axios.post('/api/chat/send', payload, { headers: { Authorization: `Bearer ${token}` } });
      // For self-chat: manually append messages and update sidebar since socket won't duplicate
      if (isSelfChat && Array.isArray(res.data)) {
        res.data.forEach(msg => {
          setMessages(prev => prev.find(m => String(m._id) === String(msg._id)) ? prev : [...prev, msg]);
        });
        setChats(prevChats => {
          const lastMsg = res.data[res.data.length - 1];
          const idx = prevChats.findIndex(c => String(c._id) === String(lastMsg.chatId));
          if (idx >= 0) {
            const updated = [...prevChats];
            updated[idx] = { ...updated[idx], lastMessage: lastMsg, updatedAt: lastMsg.createdAt };
            return updated;
          } else {
            // Add new chat to the list
            const newChat = {
              _id: lastMsg.chatId,
              participants: isSelfChat ? [currentUserId] : [currentUserId, activeChat._id],
              lastMessage: lastMsg,
              isGroup: false,
              updatedAt: lastMsg.createdAt
            };
            return [newChat, ...prevChats];
          }
        });
      }
    } catch (err) { console.error('Error sending message:', err); }
  };

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0 || !activeChat) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const isSelfChat = !activeChat.isGroup && String(activeChat._id) === String(currentUserId);
    formData.append('receiverId', activeChat.isGroup ? '' : (isSelfChat ? currentUserId : activeChat._id));
    formData.append('chatId', activeChat.isGroup ? activeChat._id : '');
    formData.append('fileType', type);
    if (replyingToMessage) formData.append('replyTo', replyingToMessage._id);

    try {
      setShowAttachmentMenu(false);
      const res = await axios.post('/api/chat/send', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setReplyingToMessage(null);
      // For self-chat parity
      if (isSelfChat && Array.isArray(res.data)) {
        res.data.forEach(msg => {
          setMessages(prev => prev.find(m => String(m._id) === String(msg._id)) ? prev : [...prev, msg]);
        });
        setChats(prevChats => {
          const lastMsg = res.data[res.data.length - 1];
          const idx = prevChats.findIndex(c => String(c._id) === String(lastMsg.chatId));
          if (idx >= 0) {
            const updated = [...prevChats];
            updated[idx] = { ...updated[idx], lastMessage: lastMsg, updatedAt: lastMsg.createdAt };
            return updated;
          } else {
            // Add new chat to the list
            const newChat = {
              _id: lastMsg.chatId,
              participants: isSelfChat ? [currentUserId] : [currentUserId, activeChat._id],
              lastMessage: lastMsg,
              isGroup: false,
              updatedAt: lastMsg.createdAt
            };
            return [newChat, ...prevChats];
          }
        });
      }
    } catch (err) { console.error('Error uploading files:', err); alert('Failed to upload file(s)'); }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length === 0) return;
    try {
      const res = await axios.post('/api/chat/group', { name: groupName, participants: selectedParticipants }, { headers: { Authorization: `Bearer ${token}` } });
      const newGroup = { ...res.data, isGroup: true };
      setChats(prev => [newGroup, ...prev]);
      setActiveChat(newGroup);
      setIsCreatingGroup(false);
      setIsNewChatOpen(false);
      setGroupName('');
      setSelectedParticipants([]);
    } catch (err) { console.error('Error creating group:', err); }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Safely extract sender ID whether senderId is a plain string or populated object
  const getSenderId = (senderId) => senderId?._id ? String(senderId._id) : String(senderId || '');

  // Self-chat — always pinned at top of sidebar
  const selfChatObj = { ...currentUserObj, _id: currentUserObj?._id || currentUserObj?.id, isSelf: true };
  const selfChatLastMsg = (() => {
    const selfChat = chats.find(c =>
      !c.isGroup &&
      c.participants.every(p => String(p._id || p) === String(currentUserId))
    );
    return selfChat?.lastMessage || null;
  })();
  const selfChatEntry = {
    isSelf: true,
    user: selfChatObj,
    chatId: 'self',
    lastMessage: selfChatLastMsg,
    unreadCount: 0,
    updatedAt: new Date('2099-01-01')
  };

  const sidebarItems = [
    selfChatEntry,
    ...chats.filter(c => c.isGroup).map(group => ({
      isGroup: true,
      user: group,
      chatId: group._id,
      lastMessage: group.lastMessage,
      unreadCount: group.unreadCount || 0,
      updatedAt: group.updatedAt
    })),
    ...users
      .map(user => {
        // Find a DM chat with this specific user (one where they are a participant and it's not a self-chat)
        const chat = chats.find(c =>
          !c.isGroup &&
          c.participants.length > 1 &&
          c.participants.some(p => String(p._id || p) === String(user._id))
        );
        return { user, chatId: chat?._id, lastMessage: chat?.lastMessage, unreadCount: chat?.unreadCount || 0, updatedAt: chat?.updatedAt || user.lastActive || new Date(0) };
      })
      .filter(item => item.lastMessage && String(item.user._id) !== String(currentUserId))
  ].sort((a, b) => {
    if (a.isSelf) return -1;
    if (b.isSelf) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  })
    .filter(item => {
      if (!searchQuery) return true;
      const lowerQ = searchQuery.toLowerCase();
      if (item.isSelf) return "it's me".includes(lowerQ) || (currentUserObj?.name || '').toLowerCase().includes(lowerQ);
      const name = item.isGroup ? item.user.groupName : item.user.name;
      return (name || '').toLowerCase().includes(lowerQ);
    });

  const filteredNewChatUsers = users
    .filter(u => {
      if (!newChatSearch) return true;
      const lowerQ = newChatSearch.toLowerCase();
      return (u.name || '').toLowerCase().includes(lowerQ) || (u.employeeId || '').toLowerCase().includes(lowerQ);
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const groupedUsers = filteredNewChatUsers.reduce((groups, user) => {
    const letter = (user.name || '').charAt(0).toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(user);
    return groups;
  }, {});

  return (
    <div className="absolute inset-0 z-20 flex bg-white border-t border-l border-[#E6E8EA] overflow-hidden font-sans">
      <div className={`w-full md:w-[350px] lg:w-[400px] flex flex-col border-r border-[#E6E8EA] bg-[#F5F7FA] relative ${activeChat ? 'hidden md:flex' : 'flex'}`}>

        {/* MAIN SIDEBAR */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isNewChatOpen ? '-translate-x-full opacity-0 invisible absolute inset-0' : 'translate-x-0 opacity-100 visible'}`}>
          <div className="p-4 bg-[#F5F7FA] border-b border-[#E6E8EA] flex items-center justify-between relative">
            <h2 className="text-xl font-bold text-[#1E2026]">Messages</h2>
            <MoreVertical size={20} className="text-[#848E9C] cursor-pointer hover:text-[#1E2026] transition-colors" onClick={() => setShowMenu(!showMenu)} />
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-4 top-14 bg-white border border-[#E6E8EA] shadow-xl rounded-xl py-2 w-48 z-50 overflow-hidden">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-[#1E2026] hover:bg-[#F5F7FA] font-medium transition-colors">Settings</button>
                  <div className="h-px bg-[#E6E8EA] my-1"></div>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors" onClick={() => { sessionStorage.clear(); window.location.href = '/login'; }}>Log out</button>
                </div>
              </>
            )}
          </div>
          <div className="p-3 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E9C]" size={16} />
              <input ref={searchInputRef} id="chat-search-input" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by Name, Email, or ID..." className="w-full bg-[#F5F7FA] text-[#1E2026] text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3E74FF]/20 transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
            {loading ? (<div className="p-6 text-center text-sm text-[#848E9C]">Loading contacts...</div>) : (
              sidebarItems.map((item) => {
                const u = item.user;
                const isOnline = onlineUsers.has(u._id);
                const isUnread = item.lastMessage && getSenderId(item.lastMessage.senderId) === String(u._id) && item.lastMessage.status !== 'seen';
                const displayUnreadCount = item.unreadCount > 0 ? item.unreadCount : (isUnread ? 1 : 0);
                const isSelfItem = item.isSelf;
                const displayName = isSelfItem ? "It's Me (You)" : (item.isGroup ? u.groupName : (u.name || 'Unknown User'));
                const displaySub = isSelfItem ? 'Message yourself' : null;

                return (
                  <div
                    key={item.chatId || u._id}
                    onClick={() => setActiveChat(isSelfItem ? { ...u, isSelf: true } : u)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-[#F5F7FA] transition-colors border-b border-[#F5F7FA] ${activeChat && (
                        isSelfItem
                          ? String(activeChat._id) === String(currentUserId)
                          : activeChat._id === u._id
                      ) ? 'bg-[#EEF2FF]' : ''
                      }`}
                  >
                    <div className="relative">
                      {item.isGroup ? (
                        <div className="w-12 h-12 rounded-full bg-[#00A884]/10 text-[#00A884] flex items-center justify-center font-bold text-lg"><Users size={24} /></div>
                      ) : u.profileImage ? (
                        <img src={getImageUrl(u.profileImage)} alt={u.name} className="w-12 h-12 rounded-full object-cover border border-[#E6E8EA]" />
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#3E74FF]/10 text-[#3E74FF]`}>
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      {!isSelfItem && !item.isGroup && isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="text-[15px] font-semibold text-[#1E2026] truncate">{displayName}</h3>
                        <span className="text-[11px] text-[#848E9C]">{formatTime(item.lastMessage?.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[13px] truncate text-[#848E9C]">
                          {isSelfItem ? (
                            item.lastMessage
                              ? <span>{item.lastMessage.message || (item.lastMessage.attachment ? '📎 Attachment' : '')}</span>
                              : <span className="italic">Message yourself</span>
                          ) : item.lastMessage ? (
                            <>
                              {getSenderId(item.lastMessage.senderId) === String(currentUserId) && (
                                <span className="inline-block mr-1">
                                  {item.lastMessage.status === 'seen' ? <CheckCheck size={14} className="text-blue-500 inline" /> : <Check size={14} className="text-[#848E9C] inline" />}
                                </span>
                              )}
                              {item.lastMessage.message || (item.lastMessage.attachment ? '📎 Attachment' : '')}
                            </>
                          ) : (
                            <span className="italic text-[#B4B9C0]">Tap to start chatting</span>
                          )}
                        </p>
                        {displayUnreadCount > 0 && !isSelfItem && (
                          <div className="min-w-[20px] h-[20px] px-1.5 bg-[#3E74FF] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">{displayUnreadCount}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button onClick={() => setIsNewChatOpen(true)} className="absolute bottom-6 right-6 w-14 h-14 bg-[#ff4f00] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#e64600] hover:scale-105 active:scale-95 transition-all z-20"><MessageSquarePlus size={24} /></button>
        </div>

        {/* NEW CHAT PANEL */}
        <div className={`flex-1 flex flex-col bg-white transition-all duration-300 absolute inset-0 z-30 ${isNewChatOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'}`}>
          <div className="p-4 bg-[#F5F7FA] border-b border-[#E6E8EA] flex items-center gap-6">
            <button onClick={() => setIsNewChatOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={20} className="text-[#111B21]" /></button>
            <h2 className="text-lg font-bold text-[#111B21]">New chat</h2>
          </div>
          <div className="p-3 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E9C]" size={16} />
              <input type="text" value={newChatSearch} onChange={(e) => setNewChatSearch(e.target.value)} placeholder="Search name or ID" className="w-full bg-[#F5F7FA] text-[#1E2026] text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3E74FF]/20 transition-all" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* New Group, Contact, Community placeholders */}
            <div className="py-2">
              <div onClick={() => setIsCreatingGroup(true)} className="flex items-center gap-4 px-4 py-3 hover:bg-[#F5F7FA] cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-[#00A884] rounded-full flex items-center justify-center text-white"><Users size={24} /></div>
                <span className="text-[16px] font-medium text-[#111B21]">New group</span>
              </div>
              <div onClick={() => { setIsNewContactOpen(true); }} className="flex items-center gap-4 px-4 py-3 hover:bg-[#F5F7FA] cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-[#00A884] rounded-full flex items-center justify-center text-white"><UserPlus size={24} /></div>
                <span className="text-[16px] font-medium text-[#111B21]">New contact</span>
              </div>
              <div className="flex items-center gap-4 px-4 py-3 hover:bg-[#F5F7FA] cursor-pointer transition-colors">
                <div className="w-12 h-12 bg-[#00A884] rounded-full flex items-center justify-center text-white"><Globe size={24} /></div>
                <span className="text-[16px] font-medium text-[#111B21]">New community</span>
              </div>
            </div>

            {/* Message Yourself */}
            <div onClick={() => { setActiveChat({ ...currentUserObj, _id: currentUserObj?._id || currentUserObj?.id, isSelf: true }); setIsNewChatOpen(false); }} className="flex items-center gap-4 px-4 py-3 hover:bg-[#F5F7FA] cursor-pointer transition-colors border-t border-[#F5F7FA]">
              <div className="relative">
                {currentUserObj?.profileImage ? (<img src={getImageUrl(currentUserObj.profileImage)} alt="Me" className="w-12 h-12 rounded-full object-cover border border-[#E6E8EA]" />) : (<div className="w-12 h-12 rounded-full bg-[#3E74FF]/10 text-[#3E74FF] flex items-center justify-center font-bold text-lg">{(currentUserObj?.name || 'U').charAt(0).toUpperCase()}</div>)}
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-medium text-[#111B21]">It's Me (You)</span>
                <span className="text-[13px] text-[#848E9C]">Message yourself</span>
              </div>
            </div>

            {/* Sorted Contact List */}
            {Object.keys(groupedUsers).sort().map(letter => (
              <div key={letter}>
                <div className="px-6 py-4 text-[#00A884] font-semibold text-sm bg-white uppercase tracking-wider">{letter}</div>
                {groupedUsers[letter].map(u => (
                  <div key={u._id} onClick={() => { setActiveChat(u); setIsNewChatOpen(false); }} className="flex items-center gap-4 px-4 py-3 hover:bg-[#F5F7FA] cursor-pointer transition-colors">
                    <div className="relative">
                      {u.profileImage ? (<img src={getImageUrl(u.profileImage)} alt={u.name} className="w-12 h-12 rounded-full object-cover border border-[#E6E8EA]" />) : (<div className="w-12 h-12 rounded-full bg-[#3E74FF]/10 text-[#3E74FF] flex items-center justify-center font-bold text-lg">{(u.name || 'U').charAt(0).toUpperCase()}</div>)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[16px] font-medium text-[#111B21]">{u.name}</span>
                      <span className="text-[13px] text-[#848E9C] uppercase">{u.role || 'Team Member'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`flex-1 flex-col bg-[#F0F2F5] relative ${!activeChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeChat ? (
          <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md"><MessageSquare size={40} className="text-[#3E74FF]" /></div>
            <h2 className="text-2xl font-light text-[#1E2026] mb-2">Real-Time Messaging</h2>
            <p className="text-[#848E9C] text-sm max-w-sm mx-auto">Select a contact to start communicating securely with your team.</p>
          </div>
        ) : (
          <>
            <div className="h-[60px] bg-white border-b border-[#E6E8EA] px-4 flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="md:hidden mr-2 p-1 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} className="text-[#1E2026]" /></button>
                <div className="relative">
                  {activeChat.isGroup ? (
                    <div className="w-10 h-10 rounded-full bg-[#00A884]/10 text-[#00A884] flex items-center justify-center font-bold"><Users size={20} /></div>
                  ) : (
                    <>
                      {activeChat.profileImage ? (<img src={getImageUrl(activeChat.profileImage)} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />) : (<div className="w-10 h-10 rounded-full bg-[#3E74FF]/10 text-[#3E74FF] flex items-center justify-center font-bold">{(activeChat.name || 'U').charAt(0).toUpperCase()}</div>)}
                      {onlineUsers.has(activeChat._id) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>}
                    </>
                  )}
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1E2026] leading-none mb-1">
                    {activeChat.isGroup
                      ? activeChat.groupName
                      : (String(activeChat._id) === String(currentUserId)
                        ? <span className="flex items-center gap-1.5">{currentUserObj?.name || 'Me'} <span className="text-[10px] font-bold bg-[#3E74FF]/10 text-[#3E74FF] px-1.5 py-0.5 rounded-full">YOU</span></span>
                        : activeChat.name)
                    }
                  </h3>
                  <p className="text-[11px] text-[#848E9C] font-medium">
                    {activeChat.isGroup
                      ? `${activeChat.participants?.length || 0} participants`
                      : (String(activeChat._id) === String(currentUserId)
                        ? 'Notes to self'
                        : (onlineUsers.has(activeChat._id) ? 'Online' : 'Offline'))
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#848E9C]">
                <Search size={20} className="cursor-pointer hover:text-[#1E2026] transition-colors" />
                <MoreVertical size={20} className="cursor-pointer hover:text-[#1E2026] transition-colors" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E5DDD5] custom-scrollbar relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }}>

              {/* MESSAGES RENDERING */}

              {(() => {
                // Grouping logic for images
                const groups = [];
                let currentImgGroup = null;

                messages.forEach((msg, idx) => {
                  const senderId = getSenderId(msg.senderId);
                  const isImg = msg.fileType === 'image' && msg.attachment && !msg.message;

                  if (isImg) {
                    if (currentImgGroup && currentImgGroup.senderId === senderId) {
                      currentImgGroup.items.push(msg);
                    } else {
                      currentImgGroup = { type: 'image-group', senderId, items: [msg], firstMsg: msg };
                      groups.push(currentImgGroup);
                    }
                  } else {
                    currentImgGroup = null;
                    groups.push({ type: 'single', ...msg });
                  }
                });

                const ImageGrid = ({ items }) => {
                  const count = items.length;
                  const openLightbox = (idx) => {
                    const imageUrls = items.map(item => getImageUrl(item.attachment));
                    setLightboxData({ images: imageUrls, index: idx, isOpen: true });
                  };

                  if (count === 1) {
                    return (
                      <div className="rounded-lg overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
                        <img src={getImageUrl(items[0].attachment)} alt="Attachment" className="max-w-full max-h-[220px] w-full object-cover" />
                      </div>
                    );
                  }

                  if (count === 2) {
                    return (
                      <div className="grid grid-cols-2 gap-[2px] rounded-lg overflow-hidden h-[180px]">
                        {items.map((item, idx) => (
                          <img key={idx} src={getImageUrl(item.attachment)} alt="Attachment" className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(idx)} />
                        ))}
                      </div>
                    );
                  }

                  if (count >= 3) {
                    return (
                      <div className="flex flex-col gap-[2px] rounded-lg overflow-hidden bg-black/5">
                        <img src={getImageUrl(items[0].attachment)} alt="Attachment" className="w-full h-[200px] object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(0)} />
                        <div className="grid grid-cols-2 gap-[2px] h-[120px]">
                          <img src={getImageUrl(items[1].attachment)} alt="Attachment" className="w-full h-[120px] object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={() => openLightbox(1)} />
                          <div className="relative w-full h-[120px] cursor-pointer group" onClick={() => openLightbox(2)}>
                            <img src={getImageUrl(items[2].attachment)} alt="Attachment" className="w-full h-full object-cover group-hover:opacity-95 transition-opacity" />
                            {count > 3 && (
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                <span className="text-white text-4xl font-bold leading-none select-none">
                                  +{count - 2}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                };

                return groups.map((group, i) => {
                  const msg = group.type === 'image-group' ? group.firstMsg : group;
                  const senderIdStr = getSenderId(msg.senderId);
                  const isSelfChat = !activeChat?.isGroup && String(activeChat?._id) === String(currentUserId);
                  const isMe = isSelfChat || senderIdStr === String(currentUserId);

                  const senderUser = isMe
                    ? currentUserObj
                    : (msg.senderId?._id
                      ? msg.senderId
                      : [...(users || []), ...(activeChat?.participants || [])].find(u => u && String(u._id || u.id) === senderIdStr)
                    );

                  const profileImg = senderUser?.profileImage || null;
                  const profileName = senderUser?.name || (isMe ? (currentUserObj?.name || 'Me') : 'User');

                  const Avatar = () => (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-black/5 bg-white flex items-center justify-center shadow-sm" title={profileName}>
                      {profileImg
                        ? <img src={getImageUrl(profileImg)} alt={profileName} className="w-full h-full object-cover" />
                        : <span className="text-[10px] font-bold text-[#3E74FF]">{profileName.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                  );

                  return (
                    <div key={msg._id || i} id={`msg-${msg._id}`} className={`flex w-full items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${isSelectionMode ? 'cursor-pointer' : ''}`} onClick={() => { if (isSelectionMode) toggleSelectMessage(msg._id); }}>
                      {isSelectionMode && (
                        <div className="flex items-center justify-center self-center px-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedMessages.has(msg._id) ? 'bg-[#3E74FF] border-[#3E74FF]' : 'border-gray-300 bg-white'}`}>
                            {selectedMessages.has(msg._id) && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                      )}
                      {!isMe && <Avatar />}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                        {activeChat?.isGroup && !isMe && (
                          <span className="text-[11px] font-semibold text-[#3E74FF] mb-1 px-1">{profileName}</span>
                        )}
                        <div
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setActiveMenuId(activeMenuId === (msg._id || i) ? null : (msg._id || i));
                          }}
                          className={`relative group px-3 py-2 rounded-[16px] shadow-sm transition-all ${msg.isDeleted ? (isMe ? 'bg-[#D9FDD3]/50' : 'bg-[#F0F2F5]') : (isMe ? 'bg-[#D9FDD3] rounded-tr-none text-[#111B21]' : 'bg-white rounded-tl-none text-[#111B21]')} ${msg.isPinned ? 'ring-1 ring-[#3E74FF]/30' : ''}`}
                        >
                          {msg.isDeleted ? (
                            <div className="flex items-center gap-2 py-1 px-1">
                              <Ban size={14} className="text-[#8696A0]" />
                              <span className="text-[13.5px] italic text-[#8696A0] font-normal">
                                {isMe ? 'You deleted this message' : 'This message was deleted'}
                              </span>
                            </div>
                          ) : (
                            <>
                              {/* HOVER ACTION BUTTON */}
                              <button
                                className="absolute top-0 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/5 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === (msg._id || i) ? null : (msg._id || i));
                                }}
                              >
                                <ChevronDown size={18} className="text-[#8696A0]" />
                              </button>

                              {/* STARRED INDICATOR */}
                              {msg.starredBy?.includes(currentUserId) && (
                                <div className="absolute -top-2 right-4 bg-[#FFD700] text-white p-0.5 rounded-full shadow-sm border border-white">
                                  <Star size={10} fill="white" />
                                </div>
                              )}

                              {/* DROPDOWN MENU */}
                              {activeMenuId === (msg._id || i) && (
                                <>
                                  <div className="fixed inset-0 z-40 cursor-default" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}></div>
                                  <div className={`absolute ${i >= groups.length - 2 ? 'bottom-0' : 'top-0'} right-full mr-2 bg-white shadow-xl rounded-xl py-2 w-48 z-50 animate-in fade-in zoom-in-95 duration-100 border border-[#E6E8EA] flex flex-col`}>

                                    {/* EMOJI QUICK REACTIONS */}
                                    <div className="flex items-center justify-around px-2 pb-2 border-b border-[#F5F6F6] mb-1 relative">
                                      {['👍', '❤️', '😂', '😮', '😢'].map(emoji => (
                                        <button key={emoji} onClick={() => handleReactMessage(msg._id, emoji)} className="hover:scale-125 transition-transform p-1">{emoji}</button>
                                      ))}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setShowFullEmojiPickerId(showFullEmojiPickerId === msg._id ? null : msg._id); }}
                                        className="hover:scale-125 transition-transform p-1 text-[#8696A0] bg-gray-50 rounded-full"
                                      >
                                        <Plus size={18} />
                                      </button>

                                      {showFullEmojiPickerId === msg._id && (
                                        <div className="absolute bottom-full left-0 z-[100] shadow-2xl">
                                          <EmojiPicker
                                            onEmojiClick={(emojiObj) => {
                                              handleReactMessage(msg._id, emojiObj.emoji);
                                              setShowFullEmojiPickerId(null);
                                            }}
                                            width={280}
                                            height={350}
                                            previewConfig={{ showPreview: false }}
                                          />
                                        </div>
                                      )}
                                    </div>

                                    <button onClick={(e) => { e.stopPropagation(); handleReplyMessage(msg); }} className="w-full px-4 py-2 text-left text-[13.5px] hover:bg-[#F5F6F6] flex items-center gap-3 transition-colors text-[#3B4A54]">
                                      <Reply size={16} className="text-[#8696A0]" /> Reply
                                    </button>

                                    <button onClick={(e) => { e.stopPropagation(); handleCopyMessage(msg.message); }} className="w-full px-4 py-2 text-left text-[13.5px] hover:bg-[#F5F6F6] flex items-center gap-3 transition-colors text-[#3B4A54]">
                                      <Copy size={16} className="text-[#8696A0]" /> Copy
                                    </button>

                                    <button onClick={(e) => { e.stopPropagation(); setForwardMsg(msg); setActiveMenuId(null); }} className="w-full px-4 py-2 text-left text-[13.5px] hover:bg-[#F5F6F6] flex items-center gap-3 transition-colors text-[#3B4A54]">
                                      <Forward size={16} className="text-[#8696A0]" /> Forward
                                    </button>

                                    <button onClick={(e) => { e.stopPropagation(); handlePinMessage(msg._id); }} className="w-full px-4 py-2 text-left text-[13.5px] hover:bg-[#F5F6F6] flex items-center gap-3 transition-colors text-[#3B4A54]">
                                      <Pin size={16} className={msg.isPinned ? 'text-[#3E74FF]' : 'text-[#8696A0]'} /> {msg.isPinned ? 'Unpin' : 'Pin'}
                                    </button>

                                    <button onClick={(e) => { e.stopPropagation(); handleStarMessage(msg._id); }} className="w-full px-4 py-2 text-left text-[13.5px] hover:bg-[#F5F6F6] flex items-center gap-3 transition-colors text-[#3B4A54]">
                                      <Star size={16} className={msg.starredBy?.includes(currentUserId) ? 'text-[#FFD700]' : 'text-[#8696A0]'} fill={msg.starredBy?.includes(currentUserId) ? '#FFD700' : 'none'} /> {msg.starredBy?.includes(currentUserId) ? 'Unstar' : 'Star'}
                                    </button>

                                    <button onClick={(e) => { e.stopPropagation(); setIsSelectionMode(true); toggleSelectMessage(msg._id); setActiveMenuId(null); }} className="w-full px-4 py-2 text-left text-[13.5px] hover:bg-[#F5F6F6] flex items-center gap-3 transition-colors text-[#3B4A54]">
                                      <CheckSquare size={16} className="text-[#8696A0]" /> Select
                                    </button>

                                    <div className="border-t border-[#F5F6F6] mt-1 pt-1">
                                      <button onClick={(e) => { e.stopPropagation(); setDeleteMsgTarget(msg); setShowDeleteModal(true); setActiveMenuId(null); }} className="w-full px-4 py-2 text-left text-[13.5px] hover:bg-red-50 text-red-500 flex items-center gap-3 transition-colors">
                                        <Trash2 size={16} /> Delete
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                              {/* REACTIONS DISPLAY moved to bottom of message bubble */}

                              {/* REPLY PREVIEW INSIDE BUBBLE */}
                              {msg.replyTo && (
                                <div className="mb-2 bg-black/5 rounded-lg border-l-4 border-[#3E74FF] p-2 overflow-hidden max-w-full">
                                  <p className="text-[11px] font-bold text-[#3E74FF] truncate">
                                    {String(msg.replyTo.senderId?._id || msg.replyTo.senderId) === String(currentUserId) ? 'Me' : (msg.replyTo.senderId?.name || 'User')}
                                  </p>
                                  <p className="text-[12px] text-[#54656F] truncate line-clamp-1 italic">
                                    {msg.replyTo.attachment ? (
                                      <span className="flex items-center gap-1"><ImageIcon size={12} /> Attachment</span>
                                    ) : msg.replyTo.message}
                                  </p>
                                </div>
                              )}

                              {group.type === 'image-group' ? (
                                <div className="mb-1 w-[280px]">
                                  <ImageGrid items={group.items} />
                                </div>
                              ) : (
                                msg.attachment && (
                                  <div className="mb-2 rounded-lg overflow-hidden border border-black/5 bg-black/5">
                                    {msg.fileType === 'image' && (
                                      <img src={getImageUrl(msg.attachment)} alt="Attachment" className="max-w-full max-h-[300px] object-contain cursor-pointer" onClick={() => setLightboxData({ images: [getImageUrl(msg.attachment)], index: 0, isOpen: true })} />
                                    )}
                                    {msg.fileType === 'video' && (
                                      <video src={getImageUrl(msg.attachment)} controls className="max-w-full max-h-[300px]" />
                                    )}
                                    {msg.fileType === 'audio' && (
                                      <audio src={getImageUrl(msg.attachment)} controls className="max-w-full w-[250px]" />
                                    )}
                                    {msg.fileType === 'document' && (
                                      <div className="p-3 flex items-center gap-3 bg-black/5">
                                        <div className="w-10 h-10 bg-[#7F66FF] rounded flex items-center justify-center text-white">
                                          <FileText size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[13px] font-medium truncate">{msg.fileName || 'Document'}</p>
                                          <p className="text-[11px] text-[#848E9C]">File</p>
                                        </div>
                                        <a href={getImageUrl(msg.attachment)} download={msg.fileName} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                          <Download size={18} className="text-[#3E74FF]" />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )
                              )}

                              {msg.message && <p className="text-[14.5px] leading-relaxed break-words whitespace-pre-wrap">{msg.message}</p>}
                            </>
                          )}
                          <div className="flex items-center justify-end gap-1.5 mt-1 opacity-70">
                            <span className="text-[10px] font-medium leading-none">{formatTime(msg.createdAt)}</span>
                            {isMe && (<span className="ml-0.5">{msg.status === 'seen' ? <CheckCheck size={14} className="text-[#53BDEB]" /> : msg.status === 'delivered' ? <CheckCheck size={14} className="text-[#8696A0]" /> : <Check size={14} className="text-[#8696A0]" />}</span>)}
                          </div>

                          {/* REACTIONS DISPLAY - Absolute to Bubble */}
                          {msg.reactions?.length > 0 && (
                            <>
                              <div
                                onClick={(e) => { e.stopPropagation(); setShowReactionDetailsId(showReactionDetailsId === msg._id ? null : msg._id); }}
                                className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} flex items-center gap-0.5 bg-white shadow-md border border-[#E6E8EA] rounded-full px-1 py-1 z-20 hover:scale-110 transition-transform cursor-pointer min-w-[24px] justify-center`}
                              >
                                {Object.entries(
                                  msg.reactions.reduce((acc, r) => {
                                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                    return acc;
                                  }, {})
                                ).map(([emoji, count]) => {
                                  const hasReacted = msg.reactions.some(r => String(r.userId) === String(currentUserId) && r.emoji === emoji);
                                  return (
                                    <div key={emoji} className={`flex items-center justify-center rounded-full ${hasReacted ? 'bg-[#3E74FF]/5' : ''} ${msg.reactions.length === 1 ? 'w-5 h-5' : 'px-1'}`}>
                                      <span className="text-[13px] leading-none">{emoji}</span>
                                      {count > 1 && <span className={`text-[9px] font-extrabold ml-0.5 ${hasReacted ? 'text-[#3E74FF]' : 'text-[#848E9C]'}`}>{count}</span>}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* REACTION DETAILS POPUP */}
                              {showReactionDetailsId === msg._id && (
                                <>
                                  <div className="fixed inset-0 z-[60]" onClick={() => setShowReactionDetailsId(null)}></div>
                                  <div className={`absolute bottom-6 ${isMe ? 'right-0' : 'left-0'} z-[70] bg-white border border-[#E6E8EA] shadow-2xl rounded-xl py-2 w-[220px] animate-in fade-in zoom-in-95 duration-200`}>
                                    <div className="px-3 py-1 border-b border-gray-100 flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-[#8696A0] uppercase tracking-wider">Reactions</span>
                                      <button onClick={() => setShowReactionDetailsId(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={14} /></button>
                                    </div>
                                    <div className="max-h-[150px] overflow-y-auto custom-scrollbar">
                                      {msg.reactions.map((r, idx) => {
                                        const reactor = [...(users || []), ...(activeChat?.participants || [])].find(u => u && String(u._id || u.id) === String(r.userId));
                                        const isSelf = String(r.userId) === String(currentUserId);
                                        return (
                                          <div
                                            key={idx}
                                            onClick={() => { if (isSelf) { handleReactMessage(msg._id, r.emoji); setShowReactionDetailsId(null); } }}
                                            className={`flex items-center justify-between px-3 py-2 hover:bg-[#F5F7FA] transition-colors ${isSelf ? 'cursor-pointer' : ''}`}
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-[#3E74FF]">
                                                {(reactor?.name || 'U').charAt(0).toUpperCase()}
                                              </div>
                                              <span className="text-[13px] text-[#111B21]">{isSelf ? 'You' : (reactor?.name || 'Someone')}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <span className="text-[14px]">{r.emoji}</span>
                                              {isSelf && <span className="text-[9px] text-[#3E74FF] font-medium">(Click to remove)</span>}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {isMe && <Avatar />}
                    </div>
                  );
                });
              })()}
              <div ref={messagesEndRef} />
            </div>

            {/* SELECTION MODE TOOLBAR (Fixed at top of chat area) */}
            {isSelectionMode && (
              <div className="absolute top-[60px] left-0 right-0 z-[60] bg-[#3E74FF] text-white p-3 flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-4">
                  <button onClick={() => { setIsSelectionMode(false); setSelectedMessages(new Set()); }} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                  <span className="font-bold text-[15px]">{selectedMessages.size} selected</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => { /* Implement bulk star if needed */ }} className="p-2 hover:bg-white/20 rounded-full transition-colors"><Star size={20} /></button>
                  <button
                    onClick={() => {
                      const firstSelectedId = Array.from(selectedMessages)[0];
                      const msg = messages.find(m => String(m._id) === String(firstSelectedId));
                      if (msg) setForwardMsg(msg);
                    }}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <Forward size={20} />
                  </button>
                  <button
                    onClick={() => {
                      const firstId = Array.from(selectedMessages)[0];
                      const msg = messages.find(m => String(m._id) === String(firstId));
                      setDeleteMsgTarget(msg);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  ><Trash2 size={20} /></button>
                </div>
              </div>
            )}

            {/* PINNED MESSAGES BAR (Compact at Top) */}
            {messages.filter(m => m.isPinned).length > 0 && (
              <div className="absolute top-[64px] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6E8EA] py-1.5 px-4 flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2">
                <div className="text-[#3E74FF] shrink-0"><Pin size={14} fill="#3E74FF" /></div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-[#3E74FF] uppercase tracking-tighter whitespace-nowrap">Pinned</span>
                  <p className="text-[13px] text-[#111B21] truncate font-medium flex-1">
                    {messages.find(m => m.isPinned)?.message || '📎 Attachment'}
                  </p>
                </div>
                <button onClick={() => {
                  const pinnedMsg = messages.find(m => m.isPinned);
                  if (pinnedMsg) {
                    const el = document.getElementById(`msg-${pinnedMsg._id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }} className="text-[11px] font-bold text-[#3E74FF] hover:bg-[#3E74FF]/5 px-3 py-1 rounded-full transition-all border border-[#3E74FF]/20 shrink-0">View</button>
              </div>
            )}

            <div className="bg-[#F0F2F5] p-3 flex flex-col gap-2 shrink-0 relative">
              {replyingToMessage && (
                <div className="mx-2 bg-[#E9EDEF] border-l-4 border-[#3E74FF] rounded-lg p-3 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[12px] font-bold text-[#3E74FF] mb-0.5 truncate">
                      {String(replyingToMessage.senderId?._id || replyingToMessage.senderId) === String(currentUserId) ? 'Me' : (replyingToMessage.senderId?.name || 'User')}
                    </p>
                    <p className="text-[13px] text-[#54656F] truncate line-clamp-1">
                      {replyingToMessage.attachment ? (
                        <span className="flex items-center gap-1.5"><ImageIcon size={14} /> Attachment</span>
                      ) : replyingToMessage.message}
                    </p>
                  </div>
                  <button onClick={() => setReplyingToMessage(null)} className="p-1.5 hover:bg-black/5 rounded-full transition-colors shrink-0">
                    <X size={18} className="text-[#8696A0]" />
                  </button>
                </div>
              )}

              <div className="flex items-end gap-3 w-full">
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-4 bg-white border border-[#E6E8EA] shadow-2xl rounded-2xl w-80 h-80 p-3 z-[60] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className="text-[11px] font-bold text-[#848E9C] mb-2 uppercase tracking-wider sticky top-0 bg-white py-1">Smileys & People</div>
                    <div className="flex-1 overflow-y-auto grid grid-cols-8 gap-1 custom-scrollbar pr-1">
                      {EMOJI_LIST.map((e, idx) => (<button key={idx} type="button" onClick={() => setNewMessage(prev => prev + e)} className="text-2xl hover:bg-gray-100 rounded-lg flex items-center justify-center p-1.5 transition-all hover:scale-110 active:scale-95">{e}</button>))}
                    </div>
                  </div>
                )}
                {showEmojiPicker && <div className="fixed inset-0 z-50" onClick={() => setShowEmojiPicker(false)}></div>}

                {/* ATTACHMENT MENU — staggered pop-up animation */}
                <style>{`
                @keyframes attachPop {
                  0%   { opacity: 0; transform: scale(0) translateY(20px); }
                  70%  { transform: scale(1.15) translateY(-4px); }
                  100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .attach-btn {
                  opacity: 0;
                  animation: attachPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
                }
              `}</style>

                {showAttachmentMenu && (
                  <>
                    <div className="fixed inset-0 z-50" onClick={() => setShowAttachmentMenu(false)} />
                    <div className="absolute bottom-[72px] left-2 flex flex-col-reverse gap-3 items-center z-[60] pb-1">

                      {/* Image — delay 0ms (first to appear, bottom) */}
                      <input type="file" id="image-upload" accept="image/*" multiple className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                      <button
                        onClick={() => document.getElementById('image-upload').click()}
                        className="attach-btn group relative flex items-center justify-center w-14 h-14 bg-[#00A884] text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
                        style={{ animationDelay: '0ms' }}
                      >
                        <ImageIcon size={22} />
                        <span className="absolute left-16 bg-[#111B21] text-white text-[10px] font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Photos & Videos</span>
                      </button>

                      {/* Audio — delay 60ms */}
                      <input type="file" id="audio-upload" accept="audio/*" multiple className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} />
                      <button
                        onClick={() => document.getElementById('audio-upload').click()}
                        className="attach-btn group relative flex items-center justify-center w-14 h-14 bg-[#FF9F00] text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
                        style={{ animationDelay: '60ms' }}
                      >
                        <Headphones size={22} />
                        <span className="absolute left-16 bg-[#111B21] text-white text-[10px] font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Audio</span>
                      </button>

                      {/* Video — delay 120ms */}
                      <input type="file" id="video-upload" accept="video/*" multiple className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                      <button
                        onClick={() => document.getElementById('video-upload').click()}
                        className="attach-btn group relative flex items-center justify-center w-14 h-14 bg-[#007BFF] text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
                        style={{ animationDelay: '120ms' }}
                      >
                        <VideoIcon size={22} />
                        <span className="absolute left-16 bg-[#111B21] text-white text-[10px] font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Video</span>
                      </button>

                      {/* Document — delay 180ms */}
                      <input type="file" id="doc-upload" multiple className="hidden" onChange={(e) => handleFileUpload(e, 'document')} />
                      <button
                        onClick={() => document.getElementById('doc-upload').click()}
                        className="attach-btn group relative flex items-center justify-center w-14 h-14 bg-[#7F66FF] text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
                        style={{ animationDelay: '180ms' }}
                      >
                        <FileText size={22} />
                        <span className="absolute left-16 bg-[#111B21] text-white text-[10px] font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Document</span>
                      </button>

                      {/* Camera — delay 240ms (top) */}
                      <button
                        onClick={() => { setShowAttachmentMenu(false); alert('Camera capture coming soon!'); }}
                        className="attach-btn group relative flex items-center justify-center w-14 h-14 bg-[#FF2E74] text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
                        style={{ animationDelay: '240ms' }}
                      >
                        <Camera size={22} />
                        <span className="absolute left-16 bg-[#111B21] text-white text-[10px] font-medium px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Camera</span>
                      </button>

                    </div>
                  </>
                )}

                <button onClick={() => setShowAttachmentMenu(!showAttachmentMenu)} className={`p-3 transition-all shrink-0 active:scale-90 ${showAttachmentMenu ? 'bg-gray-300 text-[#111B21]' : 'text-[#54656F] hover:bg-gray-200'} rounded-full`}><Paperclip size={24} className={showAttachmentMenu ? 'rotate-45 transition-transform' : 'transition-transform'} /></button>
                <form onSubmit={handleSendMessage} className="flex-1 flex items-end bg-white rounded-2xl border border-[#E6E8EA] overflow-hidden focus-within:ring-2 focus-within:ring-[#3E74FF]/20 shadow-sm relative z-50 transition-all">
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-3 transition-all shrink-0 active:scale-90 ${showEmojiPicker ? 'text-[#3E74FF]' : 'text-[#848E9C] hover:text-[#54656F]'}`}><Smile size={24} /></button>
                  <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} placeholder="Type a message" className="w-full bg-transparent border-none py-3 pr-4 text-[15px] text-[#1E2026] font-medium focus:outline-none resize-none max-h-32 min-h-[44px] custom-scrollbar" rows="1" style={{ height: 'auto' }} />
                </form>
                <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-3.5 bg-[#3E74FF] text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 shadow-md hover:bg-[#2B5DE5] transition-all shrink-0 active:scale-90 flex items-center justify-center"><Send size={18} className="ml-1" /></button>
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
      `}</style>

      <Toaster />

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white w-full max-w-[320px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <h3 className="text-[17px] font-medium text-[#111B21] mb-6">
                {selectedMessages.size > 1 ? `Delete ${selectedMessages.size} messages?` : 'Delete message?'}
              </h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={async () => {
                    if (selectedMessages.size > 1) {
                      for (const id of selectedMessages) await handleDeleteMessage(id, 'me');
                      setSelectedMessages(new Set());
                      setIsSelectionMode(false);
                    } else if (deleteMsgTarget) {
                      handleDeleteMessage(deleteMsgTarget._id, 'me');
                    }
                    setShowDeleteModal(false);
                  }}
                  className="w-full text-right py-3 px-4 text-[#3E74FF] hover:bg-gray-50 font-medium transition-colors"
                >
                  Delete for me
                </button>
                {deleteMsgTarget && String(deleteMsgTarget.senderId?._id || deleteMsgTarget.senderId) === String(currentUserId) && (
                  <button
                    onClick={async () => {
                      if (selectedMessages.size > 1) {
                        for (const id of selectedMessages) await handleDeleteMessage(id, 'everyone');
                        setSelectedMessages(new Set());
                        setIsSelectionMode(false);
                      } else if (deleteMsgTarget) {
                        handleDeleteMessage(deleteMsgTarget._id, 'everyone');
                      }
                      setShowDeleteModal(false);
                    }}
                    className="w-full text-right py-3 px-4 text-[#3E74FF] hover:bg-gray-50 font-medium transition-colors"
                  >
                    Delete for everyone
                  </button>
                )}
                <button onClick={() => setShowDeleteModal(false)} className="w-full text-right py-3 px-4 text-[#3E74FF] hover:bg-gray-50 font-medium transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORWARD MODAL */}
      {forwardMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => { setForwardMsg(null); setSelectedForwardUsers([]); }}>
          <div className="bg-white w-full max-w-[400px] h-[550px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-4 w-full">
                <button onClick={() => { setForwardMsg(null); setSelectedForwardUsers([]); setForwardSearchQuery(''); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={forwardSearchQuery}
                    onChange={(e) => setForwardSearchQuery(e.target.value)}
                    className="w-full bg-[#F0F2F5] border-none rounded-lg py-2 pl-10 pr-4 text-[14px] focus:ring-1 focus:ring-[#3E74FF] outline-none"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696A0]" />
                </div>
              </div>
            </div>

            {/* PREVIEW BOX */}
            <div className="p-4 bg-[#F0F2F5] border-b">
              <div className="bg-white rounded-lg p-3 border-l-4 border-[#3E74FF] shadow-sm">
                <p className="text-[11px] text-[#3E74FF] font-bold uppercase mb-1">Message Preview</p>
                <p className="text-[14px] text-[#54656F] line-clamp-2">{forwardMsg.message || 'Media file'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {/* Combine Users and Groups for forwarding */}
              {[
                ...users.map(u => ({ id: u._id, name: u.name, isGroup: false })),
                ...chats.filter(c => c.isGroup).map(g => ({ id: g._id, name: g.groupName, isGroup: true }))
              ]
                .filter(item => {
                  if (String(item.id) === String(currentUserId) && !item.isGroup) return true; // Keep self
                  return item.name?.toLowerCase().includes(forwardSearchQuery.toLowerCase());
                })
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                .map(item => {
                  const isSelected = selectedForwardUsers.includes(item.id);
                  const isMe = String(item.id) === String(currentUserId) && !item.isGroup;

                  return (
                    <div
                      key={`${item.isGroup ? 'group' : 'user'}-${item.id}`}
                      onClick={() => {
                        setSelectedForwardUsers(prev => isSelected ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                      }}
                      className={`flex items-center justify-between p-3 hover:bg-[#F5F7FA] cursor-pointer rounded-xl transition-colors ${isSelected ? 'bg-[#3E74FF]/5' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${item.isGroup ? 'bg-[#00A884]/10 text-[#00A884]' : 'bg-[#3E74FF]/10 text-[#3E74FF]'}`}>
                          {item.isGroup ? <Users size={20} /> : (item.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-[15px]">{isMe ? "You (Me)" : item.name}</span>
                          <span className="text-[11px] text-[#8696A0]">{item.isGroup ? 'Group' : 'Member'}</span>
                        </div>
                      </div>
                      {isSelected && <div className="w-5 h-5 bg-[#3E74FF] rounded-full flex items-center justify-center shadow-sm"><Check size={12} className="text-white" /></div>}
                    </div>
                  );
                })}
            </div>

            {/* FOOTER SEND BUTTON */}
            <div className="p-4 border-t bg-white flex justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button
                onClick={handleForwardMessage}
                disabled={selectedForwardUsers.length === 0}
                className="bg-[#3E74FF] text-white px-10 py-3 rounded-full font-bold shadow-lg disabled:opacity-50 disabled:bg-gray-300 hover:bg-[#2B5DE5] transition-all active:scale-95 flex items-center gap-2"
              >
                Send <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {isCreatingGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#F5F7FA] border-b border-[#E6E8EA] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111B21]">New Group</h2>
              <button onClick={() => setIsCreatingGroup(false)} className="text-[#848E9C] hover:text-[#111B21] transition-colors"><Search size={20} className="rotate-45" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#848E9C] mb-2 uppercase tracking-wider">Group Name</label>
                <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Enter group name..." className="w-full bg-[#F5F7FA] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#3E74FF]/20 transition-all text-[#1E2026]" />
              </div>
              <div className="flex-1 flex flex-col min-h-0 max-h-[300px]">
                <label className="block text-sm font-semibold text-[#848E9C] mb-2 uppercase tracking-wider">Select Participants</label>
                <div className="flex-1 overflow-y-auto custom-scrollbar border border-[#E6E8EA] rounded-xl p-2 space-y-1">
                  {users.filter(u => String(u._id) !== String(currentUserId)).map(u => (
                    <div key={u._id} onClick={() => {
                      if (selectedParticipants.includes(u._id)) {
                        setSelectedParticipants(prev => prev.filter(id => id !== u._id));
                      } else {
                        setSelectedParticipants(prev => [...prev, u._id]);
                      }
                    }} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedParticipants.includes(u._id) ? 'bg-[#3E74FF]/10 border border-[#3E74FF]/20' : 'hover:bg-[#F5F7FA]'}`}>
                      <div className="w-8 h-8 rounded-full bg-[#3E74FF]/10 text-[#3E74FF] flex items-center justify-center font-bold text-xs">{(u.name || 'U').charAt(0).toUpperCase()}</div>
                      <span className="flex-1 text-sm font-medium text-[#1E2026]">{u.name}</span>
                      {selectedParticipants.includes(u._id) && <Check size={16} className="text-[#3E74FF]" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#F5F7FA] border-t border-[#E6E8EA] flex gap-3">
              <button onClick={() => setIsCreatingGroup(false)} className="flex-1 py-3 text-sm font-bold text-[#848E9C] hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleCreateGroup} disabled={!groupName.trim() || selectedParticipants.length === 0} className="flex-1 py-3 text-sm font-bold bg-[#3E74FF] text-white rounded-xl shadow-md hover:bg-[#2B5DE5] disabled:opacity-50 disabled:bg-gray-300 transition-all">Create Group</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW CONTACT MODAL */}
      {isNewContactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-[#F5F7FA] border-b border-[#E6E8EA] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#111B21]">New Contact</h2>
              <button onClick={() => setIsNewContactOpen(false)} className="text-[#848E9C] hover:text-[#111B21] transition-colors p-1 hover:bg-gray-200 rounded-full"><ArrowLeft size={20} /></button>
            </div>
            <div className="p-4">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E9C]" size={16} />
                <input
                  type="text"
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  placeholder="Search by name or employee ID..."
                  className="w-full bg-[#F5F7FA] text-[#1E2026] text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3E74FF]/20 transition-all"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[360px] px-2 pb-4">
              {filteredNewChatUsers.length === 0 ? (
                <div className="text-center py-8 text-sm text-[#848E9C]">No contacts found</div>
              ) : (
                Object.keys(groupedUsers).sort().map(letter => (
                  <div key={letter}>
                    <div className="px-4 py-2 text-[#00A884] font-semibold text-xs uppercase tracking-wider">{letter}</div>
                    {groupedUsers[letter].map(u => (
                      <div
                        key={u._id}
                        onClick={() => {
                          setActiveChat(u);
                          setIsNewContactOpen(false);
                          setIsNewChatOpen(false);
                          setNewChatSearch('');
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F7FA] cursor-pointer transition-colors rounded-xl"
                      >
                        <div className="relative">
                          {u.profileImage ? (
                            <img src={getImageUrl(u.profileImage)} alt={u.name} className="w-11 h-11 rounded-full object-cover border border-[#E6E8EA]" />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-[#3E74FF]/10 text-[#3E74FF] flex items-center justify-center font-bold text-base">{(u.name || 'U').charAt(0).toUpperCase()}</div>
                          )}
                          {onlineUsers.has(u._id) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[15px] font-semibold text-[#1E2026] truncate">{u.name}</span>
                          <span className="text-[12px] text-[#848E9C] uppercase">{u.role || 'Team Member'}{u.employeeId ? ` · ${u.employeeId}` : ''}</span>
                        </div>
                        <div className="text-[11px] text-[#3E74FF] font-medium">{onlineUsers.has(u._id) ? 'Online' : ''}</div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* LIGHTBOX MODAL */}
      {lightboxData.isOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10 animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setLightboxData(prev => ({ ...prev, isOpen: false }))}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxData(prev => ({ ...prev, isOpen: false })); }}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md z-10"
          >
            <ArrowLeft size={24} className="rotate-45" />
          </button>

          {lightboxData.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxData(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-md transition-all z-10"
              >
                <ArrowLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxData(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-md transition-all z-10 rotate-180"
              >
                <ArrowLeft size={32} />
              </button>
            </>
          )}

          <div className="relative max-w-[50vw] max-h-[60vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxData.images[lightboxData.index]}
              alt="Full Preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 cursor-default border border-white/10"
            />

            <div className="flex items-center gap-4">
              <a
                href={lightboxData.images[lightboxData.index]}
                download
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full backdrop-blur-md flex items-center gap-2 transition-all font-medium border border-white/10 text-sm"
              >
                <Download size={18} />
                Download ({lightboxData.index + 1} / {lightboxData.images.length})
              </a>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default Chat;
