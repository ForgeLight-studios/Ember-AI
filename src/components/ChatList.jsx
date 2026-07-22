export default function ChatList ({chats}) {
    const chatList = chats.map((chat) => {
        return(<p>
            {chat.name}
        </p>)
    })
    return (
        <div className={"chat-list"}>
                {chatList}
        </div>
    )
}