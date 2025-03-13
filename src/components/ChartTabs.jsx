import { useState } from "react"



const ChartTabs = ({ children }) => {
    const [activeTab, setActiveTab] = useState(0)

    return (
        <div className="tab-container flex flex-col w-full flex-grow">
            <div className="tab-wrapper">
                {
                    children.map((child, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`tab text-sm font-medium leading-none transition-colors duration-150 ease-linear px-4 py-2 ${activeTab === index ? 'bg-m-black-100 text-m-black-500 cursor-default' : 'cursor-pointer bg-m-black-900 text-m-black-100 hover:bg-m-black-800'}`}
                        >
                            {child.props.title}
                        </button>
                    ))
                }
            </div>
            <div className="tab-content flex-grow">
                {children[activeTab]}
            </div>
        </div>
    )
}


const Tab = ({ children }) => {
    return (
        <div className="w-full h-full flex">
            {children}
        </div>
    )
}

export { ChartTabs, Tab };