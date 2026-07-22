export default function ChatList ({chats, currentChat}) {
    const chatList = chats.map((chat) => {
        return(<p className={currentChat ? currentChat.name === chat.name ? "active-chat" : "" : ""}>
            {chat.name}
        </p>)
    })
    return (
        <div className={"chat-list"}>
                {chatList}
        </div>
    )
}