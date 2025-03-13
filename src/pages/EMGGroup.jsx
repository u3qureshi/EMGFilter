import Head from "../partials/Head";
import "./emggroup.css";
import "../icomoon/style.css";
// import EMGModal from "../components/EMGModal";
// import NewGroup from "../components/NewGroup";
// import CurrentGroups from "../components/CurrentGroups";
import { useEffect, useState } from "react";
import { ModalTab, ModalTabs } from "../components/ModalTabs";
import { AutoComplete, Select, Table } from "antd";
import axios from "axios";
import { Calendar, DateObject } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import { ChartTabs, Tab } from "../components/ChartTabs";
import CustomChart from "../components/custom/CustomChart";
import ControlledCharts from "../components/controlled/ControlledCharts";


const url = 'https://netstat.rogers.com/getLocationSearch-2.php'; // for getting EMG Codes
const api = `https://netstat.rogers.com/sql/api/Groups.php?api=`;
const chartDataUrl = 'https://netstat.rogers.com/sql/group/sql.php?'; // for getting emg group chart data


const EMGGroup = () => {
    const last3Days = () => {
        const dates = [];
        const today = new Date();
        const calendarDates = [];

        for (let i = 0; i < 3; i++) {
            const currentDate = new Date(today)
            currentDate.setDate(today.getDate() - i)
            calendarDates.push(currentDate)
            const formattedDate = currentDate.toISOString().split('T')[0]
            dates.push(formattedDate)
        }

        return {
            dates: dates.join(','),
            calendarDates
        }
    }
    const [chartData, setChartData] = useState(null);
    const [cellNames, setCellNames] = useState(null);
    const [modalStatus, setModalStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const [emgOptions, setEmgOptions] = useState(null);
    const [selectedEmg, setSelectedEmg] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedDates, setSelectedDates] = useState(last3Days().calendarDates);


    const [updateInputeValue, setUpdateInputeValue] = useState('');
    const [updateOptions, setUpdateOptions] = useState([]);
    const [updateSelectedItems, setUpdateSelectedItems] = useState([]);

    const [newSelectedItems, setNewSelectedItems] = useState([]);
    const [newInputeValue, setNewInputeValue] = useState('');
    const [newOptions, setNewOptions] = useState([]);
    const [newMessage, setNewMessage] = useState(null);

    const loadGroups = async () => {
        try {
            const response = await axios.get(`${api}get`);
            const data = response.data;
            if (response.data.error) {
                setEmgOptions(null);
                return;
            }
            setEmgOptions(data);
            setSelectedEmg(data[0])
            setUpdateSelectedItems(data[0].groupType)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        loadGroups();
        // setSelectedEmg(ops[0])
        // setEmgOptions(ops)
    }, [])

    const fetchChartData = async () => {
        setLoading(true);
        setError(false);
        setModalStatus(false);

        const groupedType = selectedEmg.groupType.reduce((acc, item) => {
            if (!acc[item.type]) {
                acc[item.type] = [];
            }
            acc[item.type].push(item.code);
            return acc;
        }, {});

        try {
            const dates = selectedDates.map(d => d.toString()).toString();
            const emg = groupedType.EMG ? groupedType.EMG.toString() : null;
            const loc = groupedType['Location Code'] ? groupedType['Location Code'].toString() : null;
            // const urlData = `${emg ?? "emg=" + emg}${loc ?? "loc=" + loc}&selected_dates=${dates}`;
            // const response = await axios.get(`${chartDataUrl}${urlData}`);
            const response = await axios.get(`${chartDataUrl}emg=${emg}&loc=${loc}&selected_dates=${dates}`);
            // const response = await axios.get(`${chartDataUrl}emg=${groupedType?.EMG.toString()}&locCodes=${groupedType?.['Location Code'].toString()}&selected_dates=${dates}`);

            // const response = await axios.get(`${chartDataUrl}`, body)
            const data = response.data?.agg
            if (data.cols) {
                setChartData(data)
                setCellNames(response.data?.cellNames)
                setError(false)
            } else {
                setChartData(null)
                setCellNames(null)
                setError(true)
            }
            setLoading(false);
        } catch (error) {
            console.error(error)
        }
    }

    const handleEmgChange = (_, label) => {
        setSelectedEmg(label)
        setUpdateSelectedItems(label.groupType)
    }

    const updateEmgGroup = async (group) => {
        try {
            const response = await axios.post(`${api}update`, group)
            const data = response.data;
            setEditMode(false);
            setUpdateInputeValue('');
            setUpdateOptions([]);
            setUpdateSelectedItems(null);
        } catch (error) {
            console.error(error)
        }
        loadGroups()
    }

    const deleteEmgGroup = async () => {
        try {
            const response = await axios.post(`${api}delete`, {
                api: 'delete',
                grouptType: selectedEmg.groupType,
                id: selectedEmg.value,
                label: selectedEmg.label,
            })
        } catch (error) {
            console.error(error)
        }
        loadGroups()
    }

    const toggleEditMode = () => {
        setEditMode(!editMode);
    }

    const handleDateChange = date => {
        if (date.length > 3) date.shift()
        date.sort()
        setSelectedDates(date)
    }

    const updateHandleSearch = async (value) => {
        setUpdateInputeValue(value)
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

                setUpdateOptions(newOptions);

            } catch (error) {
                console.error(`Error fetching data: ${error}`)
            }
        }
    }

    const updateHandleSelect = (value, option) => {
        const isAlreadySelected = updateSelectedItems.some(item => item.code === value && item.type === option.type);
        if (!isAlreadySelected) {
            setUpdateSelectedItems([...updateSelectedItems, { code: value, type: option.type }]);
        }
        setUpdateInputeValue('');
        setUpdateOptions([]);
    }

    const updateRemoveItem = event => {
        if (!event.target.closest(".chip")) return;

        const code = event.target.dataset.code;
        const type = event.target.dataset.type;

        if (code && type) {
            setUpdateSelectedItems(updateSelectedItems.filter(item => item.code !== code || item.type !== type));
        }
    }

    const handleUpdateGroup = () => {
        const id = selectedEmg.value;
        const label = updateSelectedItems.map(item => item.code).toString();
        const reg_date = selectedEmg.reg_date;
        const groupType = updateSelectedItems;

        updateEmgGroup({
            api: 'update',
            id,
            label,
            reg_date,
            groupType
        })
    }

    const newHandleSearch = async (value) => {
        setNewInputeValue(value)
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

                setNewOptions(newOptions);

            } catch (error) {
                console.error(`Error fetching data: ${error}`)
            }
        }
    }

    const newHandleSelect = (value, option) => {
        const isAlreadySelected = newSelectedItems.some(item => item.code === value && item.type === option.type);
        if (!isAlreadySelected) {
            // setNewSelectedItems(prev => prev.push({ code: value, type: option.type}))
            setNewSelectedItems([...newSelectedItems, { code: value, type: option.type }]);
        }
        setNewInputeValue('');
        setNewOptions([]);
    }

    const newRemoveItem = event => {
        if (!event.target.closest(".chip")) return;

        const code = event.target.dataset.code;
        const type = event.target.dataset.type;

        if (code && type) {
            setNewSelectedItems(newSelectedItems.filter(item => item.code !== code || item.type !== type));
        }
    }

    const addGroup = async () => {
        try {
            const response = await axios.post(`${api}create`, {
                api: 'create',
                label: newSelectedItems.map(item => item.code).toString(),
                groupType: newSelectedItems
            })
            setNewSelectedItems([]);
            setNewOptions([]);
            setNewInputeValue('');
            setNewMessage('New group successfully created.');
            setTimeout(() => {
                setNewMessage(null);
            }, 1500)
        } catch (err) {
            console.error(err)
        }
        loadGroups()
    }

    const columns = [
        {
            title: 'Cell Name',
            dataIndex: 'cell_name',
            key: 'cell_name'
        }
    ]

    return (
        <>
            <Head />
            <div className="form-reveal relative w-full max-w-5xl mx-auto">
                <div className="hover-item flex justify-center items-center border border-m-blue-300 rounded-sm py-1.5 h-auto cursor-pointer" onClick={() => setModalStatus(!modalStatus)}>
                    <span className="icon-double-arrow-down text-m-blue-400 text-sm leading-none block"></span>
                </div>
                <div className={`modal-container absolute shadow-lg hidden z-10 w-full ${modalStatus && "active"}`}>
                    <div className="expand-modal w-full bg-white">
                        <div className="w-full py-6 px-4 shadow-2xl">
                            <ModalTabs>
                                <ModalTab title="Set EMG Groups">
                                    <div className="tab-content pt-6">
                                        {
                                            selectedEmg ? (
                                                <div className={`relative ${editMode && "is-updating"}`}>
                                                    <div className="date-picker-wrapper relative flex flex-row gap-3">
                                                        <Calendar
                                                            multiple
                                                            maxDate={new Date()}
                                                            minDate={new DateObject().subtract(4, "days")}
                                                            format="YYYY-MM-DD"
                                                            plugins={[<DatePanel header="Dates Selected" />]}
                                                            onChange={handleDateChange}
                                                            value={selectedDates}
                                                        />
                                                        <div className="flex-grow">
                                                            <div>
                                                                <p className="mb-2">Choose a grouping</p>
                                                                <Select
                                                                    showSearch
                                                                    value={selectedEmg.label}
                                                                    onChange={handleEmgChange}
                                                                    options={emgOptions.map(item => ({
                                                                        label: item.label,
                                                                        value: item.id,
                                                                        regDate: item.reg_date,
                                                                        groupType: item.groupType
                                                                    }))}
                                                                    className="w-full mb-2"
                                                                />
                                                            </div>
                                                            <div className="flex flex-row gap-3">
                                                                <div
                                                                    onClick={fetchChartData}
                                                                    className={`text-sm font-light leading-none py-2 px-4 bg-m-blue-700 text-m-blue-100 border rounded-sm w-max cursor-pointer hover:bg-blue-900 transition-colors duration-150 ease-in`}
                                                                >Fetch Data</div>
                                                                <div
                                                                    onClick={() => setEditMode(!editMode)}
                                                                    className={`text-sm leading-none py-2 px-4 bg-m-blue-900 text-m-blue-100 border rounded-sm w-max cursor-pointer hover:bg-blue-700 transition-colors duration-150 ease-in`}
                                                                >Update</div>
                                                                <div
                                                                    onClick={deleteEmgGroup}
                                                                    className={`text-sm leading-none py-2 px-4 bg-m-red-600 text-m-red-100 border rounded-sm w-max cursor-pointer hover:bg-red-900 transition-colors duration-150 ease-in`}
                                                                >Delete</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <h3 className="text-xl text-m-blue-800">There are no set groups currently.</h3>
                                            )
                                        }

                                        {
                                            editMode && (
                                                <>
                                                    <div className="flex flex-row gap-2 my-4">
                                                        <div className="flex-grow">
                                                            <AutoComplete
                                                                onSearch={updateHandleSearch}
                                                                options={updateOptions}
                                                                value={updateInputeValue}
                                                                onSelect={updateHandleSelect}
                                                                placeholder="Search for EMG/location Codes"
                                                                className="w-full"
                                                            />
                                                        </div>

                                                        <div className="flex flex-row gap-2">
                                                            <div
                                                                // onClick={() => setEditMode(!editMode)}
                                                                onClick={() => {
                                                                    setUpdateInputeValue('')
                                                                    setUpdateOptions([])
                                                                    setUpdateSelectedItems(selectedEmg.groupType)
                                                                    setEditMode(false)
                                                                }}
                                                                className="cancel-update text-sm leading-none py-2 px-4 bg-m-red-600 text-m-red-100 border rounded-sm w-max cursor-pointer hover:bg-red-900 transition-colors duration-150 ease-in">Cancel Update</div>
                                                            <div
                                                                className="update-emg text-sm leading-none py-2 px-4 bg-m-blue-600 text-m-blue-100 border rounded-sm w-max cursor-pointer hover:bg-blue-900 transition-colors duration-150 ease-in"
                                                                onClick={handleUpdateGroup}>Update Group</div>
                                                        </div>
                                                    </div>

                                                    {
                                                        updateSelectedItems && (
                                                            <>
                                                                <h3 className="text-xl my-2 text-m-blue-700">Current items in group</h3>
                                                                <div className="bg-m-blue-200 p-4 flex flex-wrap gap-1" onClick={updateRemoveItem}>
                                                                    {
                                                                        updateSelectedItems.map((group, index) => {
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
                                    </div>
                                </ModalTab>
                                <ModalTab title="Create New Group">
                                    <div className="tab-content pt-6">
                                        <div className="flex flex-row gap-4">
                                            <div className="flex-grow">
                                                <AutoComplete
                                                    onSearch={newHandleSearch}
                                                    options={newOptions}
                                                    placeholder="Search for EMG/locCodes Codes"
                                                    value={newInputeValue}
                                                    onSelect={newHandleSelect}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <div
                                                className="w-max bg-m-blue-700 text-base leading-none text-m-blue-100 py-2 px-4 rounded-md cursor-pointer"
                                                onClick={addGroup}>Create New Group</div>
                                        </div>

                                        {
                                            newSelectedItems && (
                                                <>
                                                    <h3 className="text-xl my-2 text-m-blue-700">Current items in group</h3>
                                                    <div className="bg-m-blue-200 p-4 flex flex-wrap gap-1" onClick={newRemoveItem}>
                                                        {
                                                            newSelectedItems.map((item, index) => {
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

                                        {
                                            newMessage && (
                                                <div className="bg-m-blue-200 p-4 flex flex-wrap gap-1">
                                                    {newMessage}
                                                </div>
                                            )
                                        }

                                    </div>
                                </ModalTab>
                            </ModalTabs>
                        </div>
                    </div>
                </div>
            </div>

            {
                loading ? (
                    <div className="content-wrapper flex items-center justify-center flex-grow">
                        <div className="flex justify-center items-center animate-pulse">
                            <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
                                <path fillRule="evenodd" clipRule="evenodd"
                                    d="M5.58028 5.83454C7.15197 5.07499 9.59371 4.20761 12.4126 4.20761C21.2934 4.20761 28.7956 11.7184 31.4374 18.3522C32.1868 17.5192 33.6072 14.9712 33.6072 10.9932C33.6072 5.30511 28.2823 0 19.4594 0C13.8823 0 8.99293 2.3645 5.58028 5.83454ZM4.20654 26.5604C4.20654 29.3755 5.07338 31.8194 5.83347 33.3911C2.36396 29.9789 0 25.0879 0 19.513C0 10.6875 5.30564 5.36411 10.9932 5.36411C14.9702 5.36411 17.5187 6.78345 18.3538 7.53389C11.7184 10.1752 4.20654 17.6758 4.20654 26.5604ZM26.5582 34.7632C29.3766 34.7632 31.8188 33.898 33.39 33.1363C29.9773 36.6036 25.0879 38.9692 19.5103 38.9692C10.688 38.9692 5.36411 33.6657 5.36411 27.9754C5.36411 24.0012 6.78345 21.4511 7.53282 20.6175C10.173 27.2508 17.6774 34.7632 26.5582 34.7632ZM27.9765 33.6067C33.6657 33.6067 38.9713 28.2828 38.9713 19.4599C38.9713 13.8823 36.6058 8.99508 33.1352 5.57921C33.8974 7.14982 34.7637 9.59371 34.7637 12.4115C34.7637 21.2939 27.2513 28.7956 20.617 31.4385C21.4522 32.1863 23.9996 33.6067 27.9765 33.6067Z"
                                    fill="#DA291C" />
                            </svg>
                            <h2 className="a px-4">Loading . . .</h2>
                        </div>
                    </div>
                ) : (
                    error ? (
                        <div className="content-wrapper flex items-center justify-center flex-grow">
                            <p className="text-2xl font-normal text-m-black-500 uppercase tracking-wide">Failed to fetch data for selected dates. Please try a different date.</p>
                        </div>
                    ) : (
                        chartData ? (
                            <div className="chart-content h-full flex flex-row flex-grow">
                                <ChartTabs>
                                    <Tab title="Set Charts">
                                        <div className="w-full pt-8">
                                            <ControlledCharts cData={chartData} />
                                        </div>
                                    </Tab>
                                    <Tab title="Custom Charts">
                                        <CustomChart data={chartData} />
                                    </Tab>
                                    <Tab title="View Cell Names">
                                        <div className="ml-8 mt-8">
                                            <Table columns={columns} dataSource={cellNames} />
                                        </div>
                                    </Tab>
                                </ChartTabs>
                            </div>
                        ) : (
                            <div className="content-wrapper flex items-center justify-center flex-grow">
                                <p className="text-2xl font-normal text-m-black-500 uppercase tracking-wide">Please select a group to fetch chart data.</p>
                            </div>
                        )
                    )
                )
            }
        </>
    )
}

export default EMGGroup;