import Logo from '../assets/logo.svg'
import MenuItem from "./MenuItem.jsx";
import modelImageLight from "../assets/model-icon-light.svg";
import homeImageLight from "../assets/home-Icon-light.svg";
import themeImageLight from "../assets/theme-icon-light.svg";
import themeImageDark from "../assets/theme-icon-dark.svg";
import modelImageDark from "../assets/model-icon-dark.svg";
import homeImageDark from "../assets/home-icon-dark.svg";

export default function Header ({ toggleTitle, isOpen, setIsOpen, setActiveView, isDarkMode }) {


    return (
        <div className={isOpen ? "menu-open menu" : "menu"}>
            <div className={!isOpen? "menu-title" : "menu-title menu-open_title"} onClick={() => setIsOpen(prev => !prev)}>
                <img className={!isOpen ? "menu-logo" : "menu-logo menu-open_logo"} src={Logo} alt="logo" />
                {toggleTitle && <h1>Ember AI</h1>}
            </div>
            <div className={"menu-item-list"}>
                <MenuItem itemImage={isDarkMode ? homeImageDark : homeImageLight} itemName={"Home"} isMenuOpen={isOpen}  setActiveView={setActiveView}/>
                <MenuItem itemImage={isDarkMode ? modelImageDark : modelImageLight} itemName={"Models"} isMenuOpen={isOpen} setActiveView={setActiveView}/>
                <MenuItem itemImage={isDarkMode ? themeImageDark : themeImageLight} itemName={"Themes"} isMenuOpen={isOpen} setActiveView={setActiveView}/>
            </div>
        </div>
    )
}