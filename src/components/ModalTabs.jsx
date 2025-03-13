import React, { useState, Children, cloneElement } from 'react';

const ModalTabs = ({ children, tabHeader }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div>
            <div className="tabsHeader flex flex-row gap-2">
                {Children.map(children, (child, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`${index === activeTab ? 'active bg-m-blue-700' : 'bg-m-blue-900 hover:bg-m-blue-700 duration-150 ease-in transition-colors'} text-sm font-normal leading-none text-m-blue-100 py-2 px-4 rounded-md`}
                    >
                        {child.props.title}
                    </button>
                ))}
            </div>
            <div className="tabsContent">
                {Children.map(children, (child, index) =>
                    cloneElement(child, { isActive: index === activeTab })
                )}
            </div>
        </div>
    );
};



const ModalTab = ({ isActive, children }) => {
    return <div style={{ display: isActive ? 'block' : 'none' }}>{children}</div>;
};


export {ModalTab, ModalTabs}
