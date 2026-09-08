import KebabMenuLight from '../assets/kebab-menu-icon-light.svg'
import KebabMenuDark from '../assets/kebab-menu-icon-dark.svg'
import ContextMenu from "./ContextMenu.jsx";
import {useEffect, useState} from "react";

export default function ChatList ({chats, currentChat, newChat, setCurrentChat,
                                  setSelectedModel, models, setIsMenuOpen, viewPort, navigate,
                                  handleNotification, apiCallHelper, setChats, isDarkMode,
                                      activateAreYouSure}) {

    const [whichContextMenu, setWhichContextMenu] = useState("")
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!whichContextMenu) return
        const handleEscape = (e) => {
            if (e.key !== 'Escape') return
            setWhichContextMenu(e.key)
        }
        document.addEventListener("keydown", handleEscape)
        return () => {
            document.removeEventListener("keydown", handleEscape)
        }
    }, [whichContextMenu]);

    async function onSubmit (chat) {
        if (!chat || chat.name === "New chat") {
            setWhichContextMenu("")
            handleNotification("error", "This chat does not exist")
            return
        }
        activateAreYouSure(`delete ${chat.name}`, () => async() => {
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
        })
    }

    const chatList = chats.map((chat) => {
        return(
                <div className={""}>
                        {whichContextMenu === chat.id &&<ContextMenu x={menuPos.x} y={menuPos.y} menuItems={[{name: "Delete", func: () => onSubmit(chat)}, {name: "rename", func: () => {
                                console.log(`Changing chat: ${chat.name} name`)}}]} title={"Chat Menu"}/>}
                    <p className={currentChat ? currentChat.id === chat.id ? "active-chat" : "chat" : "chat"} key={chat.id} onClick={() => {
                        const newCurrentChat = chats.find(c => c.id === chat.id)
                        setCurrentChat(newCurrentChat);
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
                    <img className={"img-button"} src={isDarkMode ? KebabMenuDark : KebabMenuLight} alt={"chat kebab menu"} onClick={async(e) => {
                        if (whichContextMenu === chat.id) {
                            setWhichContextMenu("")
                        } else {
                            setMenuPos({ x: e.clientX, y: e.clientY });
                            setWhichContextMenu(chat.id)
                        }
                    }}/>
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