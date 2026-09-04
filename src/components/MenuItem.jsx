export default function MenuItem({itemImage, itemName, isMenuOpen, setActiveView, activeView, viewPort, setIsMenuOpen}) {
    return (
        <div title={itemName} className={activeView === itemName ? "menu-item menu-item__selected" : "menu-item"} onClick={() => {
            setActiveView(itemName)
            if (viewPort <= 700) {
                setIsMenuOpen(prev => !prev)
            }
        }}>
            <img style={isMenuOpen ? {width: "30px", height: "30px"} : {}} src={itemImage} alt={itemName} />
            {isMenuOpen && <p>{itemName}</p>}
        </div>
    )
}