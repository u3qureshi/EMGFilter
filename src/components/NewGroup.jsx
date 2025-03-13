import { AutoComplete } from "antd";
import axios from "axios";
import { useState } from "react";

const url = 'http://netstat.rogers.com/getLocationSearch-2.php'; // for getting EMG Codes
const api = `http://netstat.rogers.com/sql/api/Groups.php?api=`;

const NewGroup = () => {
    const [selectedItems, setSelectedItems] = useState([
            { code: "T52M", label: "T52M", type: "EMG" },
            { code: "TBR", label: "TBR", type: "EMG" },
            { code: "BTHA", label: "BTHA", type: "EMG" }
        ]
    );
    
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);

    const handleSearch = async (value) => {
        setInputValue(value)
        if (value.length > 2) {
            try {
                const response = await axios.get(`${url}?term=${value}`)

                const groupedData = response.data.reduce((acc, item) => {
                    const type = item.type;
                    if (!acc[type]) {
                        acc[type] = [];
                    }
                    acc[type].push({ value: item.code, label: item.code, type: item.type });
                    return acc;
                }, {});

                const newOptions = Object.keys(groupedData).map(category => ({
                    label: category,
                    options: groupedData[category],
                }));

                setOptions(newOptions);

            } catch (error) {
                console.error(`Error fetching data: ${error}`)
            }
        }
    }

    const handleSelect = (value, option) => {
        const isAlreadySelected = selectedItems.some(item => item.code === value && item.type === option.type);
        if (!isAlreadySelected) {
            setSelectedItems([...selectedItems, { code: value, type: option.type }]);
        }
        setInputValue('');
        setOptions([]);
    }

    const removeItem = event => {
        if (!event.target.closest(".chip")) return;

        const code = event.target.dataset.code;
        const type = event.target.dataset.type;

        if (code && type) {
            setSelectedItems(selectedItems.filter(item => item.code !== code || item.type !== type));
        }
    }

    const addGroup = async () => {
        try {
            const response = await axios.post(`${api}create`, {
                api: 'create',
                label: selectedItems.map(item => item.code).toString(),
                groupType: selectedItems
            })
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <>
            <div className="flex flex-row gap-4">
                <div className="flex-grow">
                    <AutoComplete
                        onSearch={handleSearch}
                        options={options}
                        placeholder="Search for EMG/locCodes Codes"
                        value={inputValue}
                        onSelect={handleSelect}
                        style={{ width: '100%' }}
                    />
                </div>
                <div
                    className="w-max bg-m-blue-700 text-base leading-none text-m-blue-100 py-2 px-4 rounded-md cursor-pointer"
                    onClick={addGroup}>Create New Group</div>
            </div>

            {
                selectedItems && (
                    <>
                        <h3 className="text-xl my-2 text-m-blue-700">Current items in group</h3>
                        <div className="bg-m-blue-200 p-4 flex flex-wrap gap-1" onClick={removeItem}>
                            {
                                selectedItems.map((item, index) => {
                                    return (
                                        <div
                                            
                                            key={index}
                                            data-type={item.type}
                                            data-code={item.code}
                                            className="chip cursor-pointer text-xs rounded-full py-1 px-2.5 bg-m-blue-500 hover:bg-blue-700 transition-colors duration-150 ease-in text-m-blue-100 w-max">
                                            {item.code}
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </>
                )
            }
        </>
    )
}

export default NewGroup;