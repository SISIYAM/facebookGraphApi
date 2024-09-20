import { useEffect, useState } from "react";
import axios from "axios";

const Conversations = ({
  conversations,
  onSelect,
  pageId,
  pageName,
  pageAccessToken,
}) => {
  const [usernames, setUsernames] = useState({});

  // fetch User Name based on Conversation ID
  const getUserName = async (conversationId) => {
    const apiUrl = `https://graph.facebook.com/v20.0/${conversationId}/messages?fields=message,from&access_token=${pageAccessToken}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data && response.data.data.length > 0) {
        const incomingMessages = response.data.data.filter(
          (message) => message.from && message.from.id !== pageId
        );

        if (incomingMessages.length > 0) {
          const lastIncomingMessage =
            incomingMessages[incomingMessages.length - 1];
          return lastIncomingMessage.from.name || "Unknown";
        } else {
          return "No external user messages";
        }
      } else {
        console.log(`No messages found in Conversation ID ${conversationId}.`);
        return "No messages found.";
      }
    } catch (error) {
      console.error("Error fetching username:", error);
      return "Error fetching username";
    }
  };

  useEffect(() => {
    const fetchUsernames = async () => {
      const names = {};
      for (const conversation of conversations) {
        const username = await getUserName(conversation.id);
        names[conversation.id] = username;
      }
      setUsernames(names);
    };

    if (conversations.length > 0) {
      fetchUsernames();
    }
  }, [conversations, pageId, pageAccessToken]);

  // page name style
  const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div>
      {pageName && (
        <div style={style}>
          <h3>{pageName}</h3>
        </div>
      )}
      <div style={style}>
        <h5 className="text-primary">All Conversations</h5>
      </div>
      {conversations.length > 0 ? (
        conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="shadow-sm p-3 my-3 bg-white rounded"
          >
            <button
              className="bg-white border-0 seeConversations"
              onClick={() => onSelect(conversation.id)}
            >
              {usernames[conversation.id] || (
                <div style={{ transform: "scale(0.5)" }}>
                  <div class="spinner-grow text-primary" role="status">
                    <span class="sr-only"></span>
                  </div>
                  <div class="spinner-grow text-secondary mx-2" role="status">
                    <span class="sr-only"></span>
                  </div>
                  <div class="spinner-grow text-success" role="status">
                    <span class="sr-only"></span>
                  </div>
                </div>
              )}
            </button>
          </div>
        ))
      ) : (
        <p className="shadow-sm p-3 my-3 bg-white rounded">
          No conversations found.
        </p>
      )}
    </div>
  );
};

export default Conversations;
