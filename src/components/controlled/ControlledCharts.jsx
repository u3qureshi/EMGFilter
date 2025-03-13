import ReactECharts from "echarts-for-react"
import { getColumns, setSeries, setType, yDataZoom } from "../../helpers/ChartOptions";
import { useState } from "react";



const ControlledCharts = ({ cData }) => {
    const [filterData, setFilterData] = useState(false)
    const [data, setData] = useState(cData);

    // const filterDatesBetween9And5 = (rows) => {
    //     return rows.filter(row => {
    //         const dateString = row.c[0].v;
    //         if (!dateString) return false;
    //         const args = dateString.match(/\d+/g).map(Number);
    //         args[1] -= 1;
    //         const date = new Date(...args);
    //         const hour = date.getHours();
    //         return hour >= 9 && hour < 17;
    //     });
    // }

    const filterDatesBetween9And5AndStartOfDay = (rows) => {
        return rows.filter(row => {
            const dateString = row.c[0].v;
            if (!dateString) return false;
            const args = dateString.match(/\d+/g).map(Number);
            args[1] -= 1;
            const date = new Date(...args);
            const hour = date.getHours();
            const minute = date.getMinutes();
    
            return (hour >= 9 && hour < 17) || (hour === 0 && minute === 0);
        });
    }

    const toggleFilter = () => {
        if (!filterData) {
            const filteredRows = filterDatesBetween9And5AndStartOfDay(data.rows);
            setData({ cols: data.cols, rows: filteredRows })
        } else {
            setData(cData)
        }
        setFilterData(!filterData)
    }


    const ttc = 'Group - ';
    const cellCountTypes = [setType('Data', 'left', '')]
    const cellCountSeries = [setSeries('line', 0)]
    const cellCountView = getColumns(data, [21], 'Group - Cell Count', cellCountTypes, 0, cellCountSeries);

    const accessibilityRateTypes = [setType('Percentage', 'left', '%'), setType('Percentage', 'right', '%')]
    const accessibilityRateSeries = [setSeries('line', 0), setSeries('line', 1)]
    const accessibilityRateView = getColumns(data, [2, 18], 'Group - Accessibility Rate', accessibilityRateTypes, false, accessibilityRateSeries)
    const accZoom = yDataZoom([0, 1])
    accessibilityRateView.dataZoom.push(accZoom[0])
    accessibilityRateView.dataZoom.push(accZoom[1])


    const retainabilityTypes = [setType('Percentage', 'left', '%'), setType('Percentage', 'right', '%')]
    const retainabilitySeries = [setSeries('line', 0), setSeries('line', 1)]
    const retainabilityView = getColumns(data, [3, 19], 'Group - Retainability', retainabilityTypes, false, retainabilitySeries)
    const retZoom = yDataZoom([0, 1])
    retainabilityView.dataZoom.push(retZoom[0])
    retainabilityView.dataZoom.push(retZoom[1])

    const mobilityTypes = [setType('Percentage', 'left', '%'), setType('Percentage', 'right', '%')]
    const mobilitySeries = [setSeries('line', 0), setSeries('line', 1)]
    const mobilityView = getColumns(data, [4, 5], 'Group - Mobility', mobilityTypes, false, mobilitySeries)
    const mobZoom = yDataZoom([0, 1])
    mobilityView.dataZoom.push(mobZoom[0])
    mobilityView.dataZoom.push(mobZoom[1])

    const availabilityTypes = [setType('Percentage', 'left', '%'), setType('Data', 'right', '')]
    const availabilitySeries = [setSeries('line', 0), setSeries('bar', 1, 'one'), setSeries('bar', 1, 'one'), setSeries('bar', 1, 'one')]
    const availabilityView = getColumns(data, [6, 7, 8, 20], `${ttc}Availability`, availabilityTypes, false, availabilitySeries)
    const availZoom = yDataZoom([0, 1]);
    availabilityView.dataZoom.push(availZoom[0])
    availabilityView.dataZoom.push(availZoom[1])

    const resourceUsageTypes = [setType('Data', 'left', ''), setType('Data', 'right', '')]
    const resourceUsageSeries = [setSeries('bar', 0, 'one'), setSeries('bar', 0, 'one'), setSeries('bar', 0, 'one'), setSeries('line', 1), setSeries('bar', 0, 'one')]
    const resourceUsageView = getColumns(data, [9, 10, 11, 12, 13], `${ttc}Resource Usage`, resourceUsageTypes, false, resourceUsageSeries)
    const resZoom = yDataZoom([0, 1])
    resourceUsageView.dataZoom.push(resZoom[0])
    resourceUsageView.dataZoom.push(resZoom[1])

    const integrityTypes = [setType('Gigabyte', 'left', 'GB'), setType('Megabyte', 'right', 'Mbps')]
    const integritySeries = [setSeries('line', 1), setSeries('line', 1), setSeries('bar', 0, 'one'), setSeries('bar', 0, 'one')]
    const integritySeriesView = getColumns(data, [14, 15, 16, 17], `${ttc}Integrity`, integrityTypes, false, integritySeries)
    const intZoom = yDataZoom([0, 1])
    integritySeriesView.dataZoom.push(intZoom[0])
    integritySeriesView.dataZoom.push(intZoom[1])

    const downlinkThroughTypes = [setType('Percentage', 'left', '%'), setType('Megabytes', 'right', 'Mbps')]
    const downlinkThroughSeries = [
        setSeries('line', 1),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('line', 0)
    ]
    const downlinkThroughView = getColumns(data, [14, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40], `${ttc}Downlink Throughput`, downlinkThroughTypes, false, downlinkThroughSeries)
    const downZoom = yDataZoom([0, 1])
    downlinkThroughView.dataZoom.push(downZoom[0])
    downlinkThroughView.dataZoom.push(downZoom[1])

    const uplinkThroughTypes = [setType('Percentage', 'left', '%'), setType('Megabytes', 'right', 'Mbps')]
    const uplinkThroughSeries = [
        setSeries('line', 1),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
        setSeries('bar', 0, 'one'),
    ]
    const uplinkThroughView = getColumns(data, [15, 41, 42, 43, 44, 45, 46, 47, 48], `${ttc}Uplink Throughput`, uplinkThroughTypes, false, uplinkThroughSeries)
    const upZoom = yDataZoom([0, 1])
    uplinkThroughView.dataZoom.push(upZoom[0])
    uplinkThroughView.dataZoom.push(upZoom[1])

    const ulrssiTypes = [setType('Data', 'left', '')]
    const ulrssiSeries = [setSeries('line', 0)]
    const ulrssiView = getColumns(data, [22], `${ttc}ULRSSI`, ulrssiTypes, 0, ulrssiSeries)

    return (
        <div className="flex-grow relative">
            <div className="data-filter-toggle flex items-center justify-center my-4">
                <div className="flex flex-row gap-4 bg-white rounded-lg py-3 px-9">
                    <label class="checkbox_wrap">
                        <span className={`checkbox_inp ${filterData && "active"}`}></span>
                        {/* <input onClick={toggleFilter} type="checkbox" name="checkbox" class="checkbox_inp"/> */}
                        <span onClick={toggleFilter} class="checkbox_mark"></span>
                    </label>
                    <div>
                        Filter 9AM - 5PM
                    </div>
                </div>
            </div>
            <ReactECharts style={{ height: 650 }} option={cellCountView} />
            <ReactECharts style={{ height: 650 }} option={accessibilityRateView} />
            <ReactECharts style={{ height: 650 }} option={retainabilityView} />
            <ReactECharts style={{ height: 650 }} option={mobilityView} />
            <ReactECharts style={{ height: 650 }} option={availabilityView} />
            <ReactECharts style={{ height: 650 }} option={resourceUsageView} />
            <ReactECharts style={{ height: 650 }} option={integritySeriesView} />
            <ReactECharts style={{ height: 850 }} option={downlinkThroughView} />
            <ReactECharts style={{ height: 850 }} option={uplinkThroughView} />
            <ReactECharts style={{ height: 650 }} option={ulrssiView} />
        </div>
    )
}


export default ControlledCharts;