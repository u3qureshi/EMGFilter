import ReactECharts from "echarts-for-react"
import { extractColumns } from "../../helpers/ChartOptions";
import { useState, useRef, useEffect } from "react";
import "./customttc.css";

const CustomChart = ({ data }) => {
    const [selectedKpi, setSelectedKpi] = useState(new Map());
    const [chartOption, setChartOption] = useState(null);
    const echartRef = useRef(null);

    // const [filterData, setFilterData] = useState(false)
    // const [data, setData] = useState(cData);

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

    // const toggleFilter = () => {
    //     if (!filterData) {
    //         const filteredRows = filterDatesBetween9And5(data.rows);
    //         setData({ cols: data.cols, rows: filteredRows })
    //     } else {
    //         setData(cData)
    //     }
    //     setFilterData(!filterData)
    // }

    const updateChartOption = () => {
        const cols = [...selectedKpi.keys()]
        const kpiTypes = [...selectedKpi.values()].map(x => x.type)

        if (cols.length == 0) {
            setChartOption(null)
        }

        if (cols.length > 0) {
            const chartOp = extractColumns(data, cols, kpiTypes)
            setChartOption(chartOp)
        }
    }

    useEffect(() => {
        const chartInstance = echartRef.current?.getEchartsInstance();
        chartInstance?.setOption(chartOption, true);
    }, [chartOption]);

    useEffect(() => {
        updateChartOption()
    }, [selectedKpi])

    const removeKPI = (index) => {
        setSelectedKpi(prev => {
            const newMap = new Map(prev)
            newMap.delete(Number(index))
            return newMap
        })
    }

    const removeChip = event => {
        const index = event.target.closest('.chip').dataset.index || null;
        if (!index) return;
        removeKPI(index)
    }

    const handleClick = event => {
        const element = event.target.closest('.option')
        if (!element) return;

        const parent = element.parentNode;
        const option = element.dataset.option
        const index = parent.dataset.index;

        if (parent.dataset.selected != option) {
            parent.dataset.selected = option;
            setSelectedKpi(prev => new Map(prev).set(Number(index), { type: option, text: parent.parentNode.childNodes[0].textContent }))
        } else {
            removeKPI(index)
        }
    }

    return (
        <>
            <div className="custom-chart-content w-full">
                <div className="kpi-list">
                    <ul onClick={handleClick}>
                        {
                            data.cols.map((kpi, index) => {
                                if (index == 0 || index == 1) return;

                                return (
                                    <li className={`item-wrapper`} data-index={Number(index)} key={index}>
                                        <span className={`kpi-item ${selectedKpi.has(index) ? 'selected' : ''}`}>
                                            {kpi.label}
                                        </span>
                                        <span
                                            className={`option-container`}
                                            data-selected={`${selectedKpi.get(Number(index))?.type || ''}`}
                                            data-index={Number(index)}
                                        >
                                            <span className={`option ${selectedKpi.get(index)?.type == 'line' ? 'bg-m-black-900 text-m-black-100' : 'bg-m-black-200 hover:bg-m-black-100 text-m-black-900'}`} data-option="line">Line</span>
                                            <span className={`option ${selectedKpi.get(index)?.type == 'bar' ? 'bg-m-black-900 text-m-black-100' : 'bg-m-black-200 hover:bg-m-black-100 text-m-black-900'}`} data-option="bar">Bar</span>
                                            <span className={`option ${selectedKpi.get(index)?.type == 'stack' ? 'bg-m-black-900 text-m-black-100' : 'bg-m-black-200 hover:bg-m-black-100 text-m-black-900'}`} data-option="stack">Stack</span>
                                        </span>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>

                <div className="custom-chart">
                    {
                        chartOption ? (
                            <div className="custom-chart-wrapper">
                                <div
                                    className="selected-kpi-wrapper flex flex-row gap-4 p-4 overflow-x-auto items-center  mx-auto"
                                    onClick={removeChip}
                                >
                                    {
                                        Array.from(selectedKpi).map((item, index) => {
                                            return (
                                                <div data-index={item[0]} className="chip min-w-max text-xs uppercase leading-none px-3 py-1 bg-m-black-200 transition-colors duration-100 hover:bg-m-black-300 rounded-full text-m-black-900 border border-m-black-900 cursor-pointer" key={index}>
                                                    {item[1].text}
                                                </div>
                                            )
                                        })
                                    }
                                </div>

                                {/* <div className="data-filter-toggle flex items-center justify-center my-4">
                                    <div className="flex flex-row gap-4 bg-white rounded-lg py-3 px-9">
                                        <label class="checkbox_wrap">
                                            <span className={`checkbox_inp ${filterData && "active"}`}></span>
                                            <span onClick={toggleFilter} class="checkbox_mark"></span>
                                        </label>
                                        <div>
                                            Filter 9AM - 5PM
                                        </div>
                                    </div>
                                </div> */}


                                <ReactECharts ref={echartRef} option={chartOption} style={{ height: 'calc(100% - 54px)' }} />
                            </div>
                        ) : (
                            <h2 className="text-2xl font-normal text-m-black-500 uppercase tracking-wide">No KPI has been selected</h2>
                        )
                    }
                </div>
            </div>

        </>
    )
}


export default CustomChart;