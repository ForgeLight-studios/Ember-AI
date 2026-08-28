export default function ChatList ({chats, currentChat, newChat, setCurrentChat, setActiveView}) {
    const chatList = chats.map((chat) => {
        return(<p className={currentChat ? currentChat.id === chat.id ? "active-chat" : "chat" : "chat"} key={chat.id} onClick={() => {
            const newCurrentChat = () => {
                return chats.find(c => c.id === chat.id)
            };
            setCurrentChat(newCurrentChat);
            setActiveView("Chat");
        }}>
            {chat.name}
        </p>)
    })

    const isNewChat = chats.find(c => c.name === "New chat")
    return (
        <div className={"chat-list"}>
                <p className={isNewChat ? "disabled-button" : "add-chat"} style={{fontWeight: 700}} onClick={newChat}>
                    + New Chat
                </p>
                {chatList}
        </div>
    )
}