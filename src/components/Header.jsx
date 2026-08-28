import Logo from '../assets/logo.svg'
import MenuItem from "./MenuItem.jsx";
import modelImageLight from "../assets/model-icon-light.svg";
import themeImageLight from "../assets/theme-icon-light.svg";
import themeImageDark from "../assets/theme-icon-dark.svg";
import modelImageDark from "../assets/model-icon-dark.svg";
import chatImageDark from "../assets/chats-icon-dark.svg";
import chatImageLight from "../assets/chats-icon-light.svg";
import ChatList from "./ChatList.jsx";

export default function Header ({ toggleTitle, isOpen, setIsOpen, setActiveView, isDarkMode, chats, currentChat,
                                    handleNotification, apiCallHelper, setChats,
                                    setCurrentChat, newChat }) {

    async function createNewChat() {
        try {
            const res = await apiCallHelper("chats/createChat", "POST", null, {
                id: currentChat.id, title: currentChat.name
            })

            if (!res.ok) {
                handleNotification("notice", `Could not create new chat Error: ${res.status}`);
                return;
            }
            console.log("New chat was created successfully.");
        } catch (e) {
            console.error(e.message);
            handleNotification("error", `Could not create new chat Error: ${e.message}`);
        }
    }

    return (
        <div className={isOpen ? "menu-open menu" : "menu"}>
            <div className={!isOpen? "menu-title" : "menu-title menu-open_title"} onClick={() => setIsOpen(prev => !prev)}>
                <img className={!isOpen ? "menu-logo" : "menu-logo menu-open_logo"} src={Logo} alt="logo" />
                {toggleTitle && <h1>Ember AI</h1>}
            </div>
            <div className={"menu-item-list"}>
                <div title={"Chats"} className="menu-item" onClick={() => {
                    setIsOpen(true)
                    setActiveView("Chat");
                }}>
                    <img style={isOpen ? {width: "30px", height: "30px"} : {}} src={isDarkMode ? chatImageDark : chatImageLight} alt={"Chats"} />
                    {isOpen && <p>{"Chats"}</p>}
                </div>
                {isOpen && <ChatList chats={chats} currentChat={currentChat} createNewChat={createNewChat}
                                         setCurrentChat={setCurrentChat} setChats={setChats} newChat={newChat}
                                         setActiveView={setActiveView} />}
                <MenuItem itemImage={isDarkMode ? modelImageDark : modelImageLight} itemName={"Models"} isMenuOpen={isOpen} setActiveView={setActiveView}/>
                <MenuItem itemImage={isDarkMode ? themeImageDark : themeImageLight} itemName={"Themes"} isMenuOpen={isOpen} setActiveView={setActiveView}/>
            </div>
        </div>
    )
}