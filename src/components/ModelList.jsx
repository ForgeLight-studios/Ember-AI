export default function ModelList({models}) {

    const modelList = models.map((model) => {
        return (
            <div className={"model-list__item"}>
                <p className={"model-list__name"}>{model.name}</p>
                <p className={"model-list__description"}>{model.description}</p>
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