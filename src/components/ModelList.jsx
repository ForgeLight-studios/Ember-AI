export default function ModelList({models, apiCallHelper, setModels, handleNotification,
                                  setAreaYouSureFunction, setAreaYouSureMessage, setIsAreYouSure}) {

    const modelList = models.map((model) => {
        return (
            <div className="model-list__wrapper">
                <div className={"model-list__item"}>
                    <div className={"model-list__item-header"}>
                        <p className={"model-list__name"}>{model.name}</p>
                        <p className={"model-list__status"}>{model.status}</p>
                    </div>
                    <p className={"model-list__description"}>{model.description}</p>
                </div>
                <button className={"general-button danger-button"} onClick={() => {
                    setIsAreYouSure(true)
                    setAreaYouSureFunction(() => async() => {
                        const resData = await apiCallHelper("model/delete", "DELETE", null, model)
                        if (!resData.success) {
                            handleNotification("error", "Failed to delete model")
                            return
                        }
                        setModels((prev) => {
                            return prev.filter((m) => m.name !== model.name)
                        })
                    })
                    setAreaYouSureMessage(`delete ${model.name}`)

                }}>X</button>
            </div>
        )
    })
    return (
        <>
            <h2>Your Models</h2>
            <div className="model-list__container">
                    {modelList}
            </div>
        </>

    )
}