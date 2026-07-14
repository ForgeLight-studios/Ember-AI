export default function Notifications (props) {
    const notification = props.notification.slice(0, 4)
    return (
        <div className={'notification-container'}>
            {notification.map(notification => (
                <div
                    key={notification.id}
                    className={`notification ${notification.active ? "notification__active" : ""}`}
                    style={notification.type === "error" ? { backgroundColor: "palevioletred", borderRight: "3px solid red" } : {}}>
                    <p className="title">{notification.type === "error" ? "Error" : "Notification"}</p>
                    <p>{notification.message}</p>
                </div>
            ))}
        </div>
    )
}