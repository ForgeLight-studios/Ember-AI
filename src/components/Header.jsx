import Logo from '../assets/logo.svg'
import MenuItem from "./MenuItem.jsx";
import modelImageLight from "../assets/model-icon-light.svg";
import settingsImageLight from "../assets/settings-icon-light.svg";
import settingsImageDark from "../assets/settings-icon-dark.svg";
import modelImageDark from "../assets/model-icon-dark.svg";
import chatImageDark from "../assets/chats-icon-dark.svg";
import chatImageLight from "../assets/chats-icon-light.svg";
import ChatList from "./ChatList.jsx";
import {Route, Routes} from "react-router-dom";

export default function Header ({ isOpen, setIsOpen, isDarkMode, chats, currentChat,
                                    handleNotification, apiCallHelper, setChats, models, activeView,
                                    setCurrentChat, newChat, setSelectedModel, viewPort, navigate}) {

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

    const menu = (
        <>
            <div className={!isOpen? "menu-title" : "menu-title menu-open_title"} style={(isOpen && viewPort <= 700) ? { zIndex: 100 } : { zIndex: 0 }} onClick={() => {
                setIsOpen(prev => !prev)
            }}>
                <img className={!isOpen ? "menu-logo" : "menu-logo menu-open_logo"} src={Logo} alt="logo" />
                {isOpen && <h1>Ember AI</h1>}
            </div>
            <div className={"menu-item-list"}>
                <div title={"Chats"} className={activeView === "Chats" ? "menu-item menu-item__selected" : "menu-item"} onClick={() => {
                    setIsOpen(true)
                    if (viewPort <= 700) {
                        setIsOpen(prev => !prev)
                    }
                }}>
                    <img style={isOpen ? {width: "30px", height: "30px", cursor: "pointer"} : {}} src={isDarkMode ? chatImageDark : chatImageLight} alt={"Chats"}/>
                    {isOpen && <p>{"Chats"}</p>}
                </div>
                {isOpen && <ChatList navigate={navigate} chats={chats} currentChat={currentChat} createNewChat={createNewChat}
                                     setCurrentChat={setCurrentChat} setChats={setChats} newChat={newChat}
                                     setSelectedModel={setSelectedModel} models={models} handleNotification={handleNotification}
                                     viewPort={viewPort} setIsMenuOpen={setIsOpen} apiCallHelper={apiCallHelper} isDarkMode={isDarkMode} />}
                <MenuItem navigate={navigate} itemImage={isDarkMode ? modelImageDark : modelImageLight} itemName={"Models"} isMenuOpen={isOpen}
                          setIsMenuOpen={setIsOpen} viewPort={viewPort} currentChat={currentChat}/>
                <MenuItem navigate={navigate} itemImage={isDarkMode ? settingsImageDark : settingsImageLight} itemName={"Settings"} isMenuOpen={isOpen}
                          setIsMenuOpen={setIsOpen} viewPort={viewPort} currentChat={currentChat}/>
            </div>
        </>
    )

    return(
        <>
            {viewPort >= 700 ?
            <div className={isOpen ? "menu-open menu" : "menu"}>
                {menu}
            </div>
            :
                <div className={isOpen ? "mobile-menu__open menu" : "menu-mobile"}>
                    {!isOpen &&<img src={Logo} alt="logo" className={"menu-logo"}
                          style={{width: "50px", height: "50px", cursor: "pointer", marginTop: "5px"}}
                                    onClick={() => {
                                        setIsOpen(prev => !prev);
                                    }}/>}
                    <Routes>
                        <Route path={"/chat/:chatId"} element={<p className={"chat-name"} style={{margin: "18px"}}>{currentChat?.name}</p>}/>
                    </Routes>
                    {isOpen && <>{menu}</>}
                </div>
            }
    </>
    )
}