export default function ChatList ({chats, currentChat, newChat}) {
    const chatList = chats.map((chat) => {
        return(<p className={currentChat ? currentChat.id === chat.id ? "active-chat" : "chat" : "chat"} key={chat.id}>
            {chat.name}
        </p>)
    })
    return (
        <div className={"chat-list"}>
                <p className={currentChat.name === "New chat" ? "disabled-button" : "add-chat"} style={{fontWeight: 700}} onClick={newChat}>
                    + New Chat
                </p>
                {chatList}
        </div>
    )
}