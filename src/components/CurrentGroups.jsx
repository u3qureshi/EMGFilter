import { AutoComplete, Select } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import UpdateGroup from "./UpdateGroup";
import DatePicker, { Calendar, DateObject } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";


const api = `http://netstat.rogers.com/sql/api/Groups.php?api=`;
// const dataUrl = `http://netstat.rogers.com/sql/api/data`
const chartDataUrl = 'http://netstat.rogers.com/sql/group/sql.php?'; // for getting emg group chart data

const ops =
    [
        {
            label: "BTHA,TBR,T52M",
            value: "3",
            regDate: "random_date",
            groupType: [
                { code: "T52M", label: "T52M", type: "EMG" },
                { code: "TBR", label: "TBR", type: "EMG" },
                { code: "BTHA", label: "BTHA", type: "EMG" },
            ]
        },
        {
            label: "BTHA,TBR",
            value: "3",
            regDate: "random_date",
            groupType: [
                { code: "TBR", label: "TBR", type: "EMG" },
                { code: "BTHA", label: "BTHA", type: "EMG" },
            ]
        },
        {
            label: "BTHA,T52M",
            value: "3",
            regDate: "random_date",
            groupType: [
                { code: "T52M", label: "T52M", type: "EMG" },
                { code: "BTHA", label: "BTHA", type: "EMG" },
            ]
        }
    ]

const CurrentGroups = () => {
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

    const [emgOptions, setEmgOptions] = useState(null);
    const [selectedEmg, setSelectedEmg] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedDates, setSelectedDates] = useState(last3Days().calendarDates);

    const [updateEmgOptions, setUpdateEmgOptions] = useState();
    const [updateSelectedItems, setUpdateSelectedItems] = useState();

    const [loading, setLoading] = useState(false);

    const loadGroups = async () => {
        try {
            const response = await axios.get(`${api}get`);
            const data = response.data;
            if (response.data.error) {
                setEmgOptions(null);
                return;
            }
            console.log(data)
            setEmgOptions(data);
            setSelectedEmg(data[0])
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        // loadGroups();
        setSelectedEmg(ops[0])
        setEmgOptions(ops)
    }, [])

    const fetchChartData = async () => {
        setLoading(true);

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
            const urlData = `${emg ?? "emg=".emg}${loc ?? "loc=".loc}&selected_dates=${dates}`;
            // const response = await axios.get(`${chartDataUrl}${urlData}`);
            const response = await axios.get(`${chartDataUrl}emg=${emg}&locCodes=${loc}&selected_dates=${dates}`);
            // const response = await axios.get(`${chartDataUrl}emg=${groupedType?.EMG.toString()}&locCodes=${groupedType?.['Location Code'].toString()}&selected_dates=${dates}`);

            // const response = await axios.get(`${chartDataUrl}`, body)
            const data = response.data?.agg
            console.log(data)
            // if (data.cols) {
            //     setChartData(data)
            // } else {
            //     setChartData(null)
            // }
            setLoading(false);
        } catch (error) {
            console.error(error)
        }
    }

    const handleFilterOption = (input, option) => {
        return option.label.toLowerCase().includes(input.toLowerCase());
    }

    const handleEmgChange = (_, label) => {
        console.log(_, label)
        setSelectedEmg(label)
    }

    const updateEmgGroup = async (group) => {
        try {
            const response = await axios.post(`${api}update`, group)
            const data = response.data;
            setEditMode(false);
        } catch (error) {
            console.error(error)
        }
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
    }

    const toggleEditMode = () => {
        setEditMode(!editMode);
    }

    const handleDateChange = date => {
        if (date.length > 3) date.shift()
        date.sort()
        setSelectedDates(date)
    }

    return (
        <>
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
                        <UpdateGroup toggleEdit={toggleEditMode} selectedGroup={selectedEmg} updateGroup={updateEmgGroup} />
                    </>
                )
            }
        </>
    )
}


export default CurrentGroups;