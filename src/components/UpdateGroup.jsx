import { AutoComplete } from "antd";
import axios from "axios";
import { useState } from "react";


const url = 'http://netstat.rogers.com/getLocationSearch-2.php'; // for getting EMG Codes
const api = `http://netstat.rogers.com/sql/api/Groups.php?api=`;

const UpdateGroup = ({ toggleEdit, selectedGroup, updateGroup }) => {
    const [inputValue, setInputValue] = useState(''); //used for search
    const [options, setOptions] = useState([]); // used for options
    const [selectedItems, setSelectedItems] = useState(selectedGroup.groupType);

    const handleUpdateGroup = () => {
        const id = selectedGroup.value;
        const label = selectedItems.map(item => item.code).toString();
        const reg_date = selectedGroup.reg_date;
        const groupType = selectedItems;

        updateGroup({
            api: 'update',
            id,
            label,
            reg_date,
            groupType
        })
    }

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

    // const updateGroup = async() => {
    //     try {
    //         const response = await axios.post(`${api}update`, {
    //             api: 'update',
    //             id: selectedGroup.value,
    //             label: selectedItems.map(item => item.code).toString(),
    //             reg_date: selectedGroup.reg_date,
    //             groupType: selectedItems
    //         })
    //     }catch (err) {
    //         console.error(err)
    //     }
    // }

    return (
        <>
            <div className="flex flex-row gap-2 my-4">
                <div className="flex-grow">
                    <AutoComplete
                        onSearch={handleSearch}
                        options={options}
                        value={inputValue}
                        onSelect={handleSelect}
                        placeholder="Search for EMG/location Codes"
                        className="w-full"
                    />
                </div>

                <div className="flex flex-row gap-2">
                    <div className="cancel-update text-sm leading-none py-2 px-4 bg-m-red-600 text-m-red-100 border rounded-sm w-max cursor-pointer hover:bg-red-900 transition-colors duration-150 ease-in" onClick={toggleEdit}>Cancel Update</div>
                    <div className="update-emg text-sm leading-none py-2 px-4 bg-m-blue-600 text-m-blue-100 border rounded-sm w-max cursor-pointer hover:bg-blue-900 transition-colors duration-150 ease-in" onClick={handleUpdateGroup}>Update Group</div>
                </div>
            </div>

            {
                selectedItems && (
                    <>
                        <h3 className="text-xl my-2 text-m-blue-700">Current items in group</h3>
                        <div className="bg-m-blue-200 p-4 flex flex-wrap gap-1" onClick={removeItem}>
                            {
                                selectedItems.map((group, index) => {
                                    return (
                                        <div
                                            key={index}
                                            data-type={group.type}
                                            data-code={group.code}
                                            className="chip cursor-pointer text-xs rounded-full py-1 px-2.5 bg-m-blue-500 hover:bg-blue-700 transition-colors duration-150 ease-in text-m-blue-100 w-max">
                                            {group.code}
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

export default UpdateGroup