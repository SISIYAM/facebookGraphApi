const MessageList = ({ messages, pageId }) => {
  const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };
  return (
    <div className="chat-body">
      {messages.length > 0 ? (
        messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.senderId === pageId ? "outgoing" : "incomming"
            }`}
          >
            {msg.text && <div className="bubble">{msg.text}</div>}
            {/* Display image if available */}
            {msg.imageUrl && (
              <div className="bubble image-bubble">
                <img
                  src={msg.imageUrl}
                  alt="Sent attachment"
                  className="message-image"
                />
              </div>
            )}
          </div>
        ))
      ) : (
        <>
          <div style={style}>
            <strong>Loading...</strong>
            <div
              className="spinner-border text-danger ml-auto"
              role="status"
              aria-hidden="true"
            ></div>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageList;
