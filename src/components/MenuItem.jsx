export default function MenuItem({itemImage, itemName, isMenuOpen, setActiveView, activeView}) {
    return (
        <div title={itemName} className={activeView === itemName ? "menu-item menu-item__selected" : "menu-item"} onClick={() => {
            setActiveView(itemName)
        }}>
            <img style={isMenuOpen ? {width: "30px", height: "30px"} : {}} src={itemImage} alt={itemName} />
            {isMenuOpen && <p>{itemName}</p>}
        </div>
    )
}