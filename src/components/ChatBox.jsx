import { useEffect, useState } from "react";
import axios from "axios";
import MessageList from "./MessageList";
import LoadingBtn from "./LoadingBtn";

const ChatBox = ({ conversationId, userName, pageId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [sending, setSending] = useState(false);

  const pageAccessToken = import.meta.env.VITE_PAGE_ACCESS_TOKEN;
  // fetch all messages in a conversation
  const fetchMessages = async (nextPageUrl = null) => {
    const apiUrl =
      nextPageUrl ||
      `https://graph.facebook.com/v20.0/${conversationId}/messages?fields=message,from&access_token=${pageAccessToken}`;

    try {
      const response = await axios.get(apiUrl);
      const fetchedMessages = response.data.data.map((msg) => ({
        senderId: msg.from.id,
        senderName: msg.from.name || "Unknown",
        text: msg.message || "[No message content]",
      }));

      setMessages((prev) =>
        nextPageUrl ? [...prev, ...fetchedMessages] : fetchedMessages
      );

      // fetch more messages if available
      if (response.data.paging && response.data.paging.next) {
        fetchMessages(response.data.paging.next);
      }
    } catch (error) {
      console.error(`Error fetching messages:`, error);
    }
  };

  useEffect(() => {
    setMessages([]);
    setInterval(() => {
      fetchMessages();
    }, 1000);
  }, [fetchTrigger]);

  // method for getting the recipient's ID from the conversation
  const getRecipientId = async (conversationId) => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/${conversationId}?fields=participants&access_token=${pageAccessToken}`
      );

      const participants = response.data.participants.data;
      const recipient = participants.find((p) => p.id !== pageId);

      return recipient?.id || null;
    } catch (error) {
      console.error("Error fetching recipient ID:", error);
      return null;
    }
  };

  // send a message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const apiUrl = `https://graph.facebook.com/v20.0/me/messages?access_token=${pageAccessToken}`;
      const recipientId = await getRecipientId(conversationId);

      if (!recipientId) {
        console.error("Failed to get recipient ID. Cannot send message.");
        setSending(false);
        return;
      }

      const payload = {
        recipient: { id: recipientId },
        message: { text: newMessage },
        tag: "CONFIRMED_EVENT_UPDATE",
      };

      const response = await axios.post(apiUrl, payload);
      if (response.status === 200) {
        setMessages((prev) => [
          ...prev,
          {
            senderId: pageId,
            senderName: "You",
            text: newMessage,
          },
        ]);
        setNewMessage("");
        // rerender messages after sending
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button className="btn btn-danger my-2" onClick={onBack}>
        Back
      </button>
      <div className="chatbox">
        {userName ? (
          <div className="chat-header">
            <h5>Chat with {userName}</h5>
          </div>
        ) : (
          <div className="chat-header">
            <h5>Loading...</h5>
          </div>
        )}
        <MessageList messages={messages} pageId={pageId} />
        <div className="chat-footer">
          <input
            type="text"
            className="chat-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          {sending ? (
            <LoadingBtn color="primary" name={" Sending"} />
          ) : (
            <button className="btn btn-primary" onClick={sendMessage}>
              Send
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatBox;
