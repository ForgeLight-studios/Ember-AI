export default function ChatList ({chats, currentChat, newChat, setCurrentChat, setActiveView, setSelectedModel, models}) {
    const chatList = chats.map((chat) => {
        return(<p className={currentChat ? currentChat.id === chat.id ? "active-chat" : "chat" : "chat"} key={chat.id} onClick={() => {
            const newCurrentChat = chats.find(c => c.id === chat.id)
            setCurrentChat(newCurrentChat);
            setActiveView("Chat");
            const modelObj = models.find(m => m.name === newCurrentChat.model);
            setSelectedModel(modelObj ?? null);
            console.log("CHAT ITERATION FOR LIST: " + newCurrentChat )
        }}>
            {chat.name}
        </p>)
    })

    const isNewChat = chats.find(c => c.name === "New chat")
    return (
        <div className={"chat-list"}>
                <p className={isNewChat ? "disabled-button" : "add-chat"} style={{fontWeight: 700}} onClick={() => {
                    newChat()
                    setSelectedModel({})
                }}
                    >
                    + New Chat
                </p>
                {chatList}
        </div>
    )
}