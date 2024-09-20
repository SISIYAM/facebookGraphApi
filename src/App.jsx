import { useEffect, useState } from "react";
import axios from "axios";
import Conversations from "./components/Conversations";
import ChatBox from "./components/ChatBox";
import "bootstrap/dist/css/bootstrap.min.css";

const pageAccessToken = import.meta.env.VITE_PAGE_ACCESS_TOKEN;
const conversationsUrl = `https://graph.facebook.com/v20.0/me/conversations?access_token=${pageAccessToken}`;

function App() {
  const [pageId, setPageId] = useState(null);
  const [pageName, setPageName] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [userName, setUserName] = useState("");

  // fetch page ID and name
  const fetchPageId = async () => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/me?access_token=${pageAccessToken}`
      );
      setPageId(response.data.id);
      setPageName(response.data.name);
    } catch (error) {
      console.error("Error fetching Page ID:", error);
    }
  };

  // fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await axios.get(conversationsUrl);
      setConversations(response.data.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // fetch user name based on conversation ID
  const fetchUserName = async (conversationId) => {
    const apiUrl = `https://graph.facebook.com/v20.0/${conversationId}/messages?fields=message,from&access_token=${pageAccessToken}`;
    try {
      const response = await axios.get(apiUrl);
      const incomingMessage = response.data.data.find(
        (message) => message.from && message.from.id !== pageId
      );
      setUserName(incomingMessage ? incomingMessage.from.name : "Unknown");
    } catch (error) {
      console.error("Error fetching username:", error);
      setUserName("Error fetching username");
    }
  };

  useEffect(() => {
    fetchPageId();
    fetchConversations();
  }, []);

  return (
    <div className="wrapper">
      <div className="container">
        {selectedConversation ? (
          <ChatBox
            conversationId={selectedConversation}
            userName={userName}
            pageId={pageId}
            onBack={() => {
              setSelectedConversation(null);
              setUserName("");
            }}
          />
        ) : (
          <Conversations
            pageId={pageId}
            pageName={pageName}
            pageAccessToken={pageAccessToken}
            conversations={conversations}
            onSelect={(conversationId) => {
              setSelectedConversation(conversationId);
              fetchUserName(conversationId);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
