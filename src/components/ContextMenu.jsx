import {useState} from "react";

export default function ContextMenu({menuItems, title, x, y, isDarkMode, apiCallHelper, chats, chat, handleNotification,
                                        activateAreYouSure, setChats, setWhichContextMenu}) {
    const [rename, setRename] = useState("");

    async function onSubmit(chat, chats) {
        if (!chat) return;
            activateAreYouSure("change the name?", () => () => {
                try{
                    const resData = apiCallHelper("chats/patch", "PATCH", null, {attributeValue: rename, id: chat.id, attribute: "title"});
                    if (resData.success === false) {
                        handleNotification("error", "Could not update chat name")
                        return;
                    }
                } catch (e) {
                    handleNotification("error", e)
                    return;
                }
                const updatedChats = chats.map((c) => {
                    if (c.id === chat.id) {
                        return {...chat, name: rename};
                    }
                    return c
                })
                setChats(updatedChats);
            }, () => {
                setRename("")
                setWhichContextMenu("")
            });
    }

    const menuItemElements = menuItems.map(menuItem => {
        return (
            <>
                {menuItem.name === "rename" ?
                    <input className={"context-menu__item"} style={{border: isDarkMode ? "1px solid var(--dm-border-colour)" : "1px var(--border-colour)",
                    backgroundColor: isDarkMode ? "var(--dm--neutral)" : "var(--neutral)", highlight: "none",
                    fontSize: "16px", cursor: "text"}} placeholder={menuItem.name} value={rename ? rename : ""} onChange={(e) => {
                        setRename(e.target.value);
                        e.target.addEventListener("keypress", async (e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                await onSubmit(chat, chats);
                            }
                        })
                    }}></input>
                    :
                    <p className={"context-menu__item"} onClick={(e) => {
                        e.stopPropagation();
                        console.log("deleting a chat")
                        menuItem.func()
                    }}>
                        {menuItem.name}
                    </p>
                }
            </>
        )
    })
    return (
        <div id={"context-menu"} style={{left: x + 'px', top: y + 'px'}}>
            <header className="page-header" style={{fontWeight: "bold", margin: 0}}>
                {title}
            </header>
            {menuItemElements}
        </div>
    )
}