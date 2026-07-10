export default function MenuItem({itemImage, itemName, isMenuOpen, setActiveView}) {
    return (
        <div className="menu-item" onClick={() => setActiveView(itemName)}>
            <img style={isMenuOpen ? {width: "30px", height: "30px"} : {}} src={itemImage} alt={itemName} />
            {isMenuOpen && <p>{itemName}</p>}
        </div>
    )
}