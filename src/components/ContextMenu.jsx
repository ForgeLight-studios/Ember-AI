export default function ContextMenu({menuItems, title, x, y}) {
    const menuItemElements = menuItems.map(menuItem => {
        return (
            <div className={"context-menu__item"} onClick={(e) => {
                e.stopPropagation();
                console.log("deleting a chat")
                menuItem.func()
            }}>
                {menuItem.name}
            </div>
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