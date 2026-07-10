import Logo from '../assets/logo.svg'
import MenuItem from "./MenuItem.jsx";
import modelImage from "../assets/model-icon.svg";
import homeImage from "../assets/home-Icon.svg";
import themeImage from "../assets/theme-icon.svg";

export default function Header ({ toggleTitle, isOpen, setIsOpen, setActiveView}) {


    return (
        <div className={isOpen ? "menu-open menu" : "menu"}>
            <div className={!isOpen? "menu-title" : "menu-title menu-open_title"} onClick={() => setIsOpen(prev => !prev)}>
                <img className={!isOpen ? "menu-logo" : "menu-logo menu-open_logo"} src={Logo} alt="logo" />
                {toggleTitle && <h1>Ember AI</h1>}
            </div>
            <div className={"menu-item-list"}>
                <MenuItem itemImage={homeImage} itemName={"Home"} isMenuOpen={isOpen}  setActiveView={setActiveView}/>
                <MenuItem itemImage={modelImage} itemName={"Models"} isMenuOpen={isOpen} setActiveView={setActiveView}/>
                <MenuItem itemImage={themeImage} itemName={"Themes"} isMenuOpen={isOpen} setActiveView={setActiveView}/>
            </div>
        </div>
    )
}