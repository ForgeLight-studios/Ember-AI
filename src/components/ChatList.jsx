export default function ChatList ({chats, currentChat, newChat, setCurrentChat,
                                  setSelectedModel, models, setIsMenuOpen, viewPort, navigate,
                                  handleNotification, apiCallHelper, setChats}) {

    async function onSubmit (chat) {
        if (!chat) {
            handleNotification("error", "This chat does not exist")
            return
        }
        try {
            const resData = await apiCallHelper("chats/delete", "DELETE", null, {id: chat.id, title: chat.name, model: chat.model})
            if (!resData.success) {
                handleNotification("error", "Could not delete chat")
                return
            }
            setChats((prev) => prev.filter(c => c.id !== chat.id))
            handleNotification("notice", `Successfully deleted chat: ${chat.name}`)
            console.log("Successfully deleted chat")
        } catch (e) {
            console.error(`Failed to delete chat ${chat.name} ERROR: ` + e)
        }
    }

    const chatList = chats.map((chat) => {
        return(
                <div className={""}>
                    <p className={currentChat ? currentChat.id === chat.id ? "active-chat" : "chat" : "chat"} key={chat.id} onClick={() => {
                        const newCurrentChat = chats.find(c => c.id === chat.id)
                        setCurrentChat(newCurrentChat);
                        // setActiveView("Chats");
                        navigate(`/chat/${chat.id}`);
                        const modelObj = models.find(m => m.name === newCurrentChat.model);
                        setSelectedModel(modelObj ?? null);
                        console.log("CHAT ITERATION FOR LIST: " + newCurrentChat )
                        if (viewPort <= 700) {
                            setIsMenuOpen(prev => !prev)
                        }
                    }}>
                    {chat.name}
                </p>
                    <button className={"general-button danger-button"} style={{fontSize: "15px", padding: "10px"}}
                        onClick={async() => {
                            await onSubmit(chat)
                        }}
                    >x</button>
            </div>
            )
    })

    const isNewChat = chats.find(c => c.name === "New chat")
    return (
        <div className={"chat-list"}>
            <div>
                <p className={isNewChat ? "disabled-button" : "add-chat"} style={{fontWeight: 700}} onClick={() => {
                    const chat = newChat()
                    navigate(`/chat/${chat.id}`)
                    if (viewPort <= 700) {
                        setIsMenuOpen(prev => !prev)
                        navigate(`/chat/${chat.id}`)
                    }
                }}
                    >
                    + New Chat
                </p>
            </div>
                {chatList}
        </div>
    )
}