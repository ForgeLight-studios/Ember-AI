export default function MenuItem({itemImage, itemName, isMenuOpen, currentChat, viewPort, setIsMenuOpen, navigate}) {

    return (
        <div title={itemName} className={currentChat.name === itemName ? "menu-item menu-item__selected" : "menu-item"} onClick={() => {
            navigate(`/${itemName.toLowerCase()}`)
            if (viewPort <= 700) {
                setIsMenuOpen(prev => !prev)
            }
        }}>
            <img style={isMenuOpen ? {width: "30px", height: "30px"} : {}} src={itemImage} alt={itemName} />
            {isMenuOpen && <p>{itemName}</p>}
        </div>
    )
}