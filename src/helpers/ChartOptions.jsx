const parseDateString = dateString => {
    const matches = dateString.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+)\)/);
    if (matches) {
        const year = parseInt(matches[1], 10);
        const month = parseInt(matches[2], 10);
        const day = parseInt(matches[3], 10);
        const hour = parseInt(matches[4], 10);
        const minute = parseInt(matches[5], 10);
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
    return null;
}

const setType = (name, place, unit, offset = 0) => {
    return {
        name,
        place,
        unit,
        offset
    }
}

const setSeries = (type, yAssoc = 0, stack = null) => {
    return {
        type,
        yAssoc,
        stack
    }
}

const ySeries = (name, position, labels, offset = 0) => {
    return {
        type: 'value',
        name,
        position,
        offset,
        // alignTicks: true,
        axisLine: {
            show: true
        },
        axisLabel: {
            formatter: function (value) {
                return `${Math.round((value + Number.EPSILON) * 100) / 100} ${labels}`
            }
        },
        min: 'dataMin',
        max: 'dataMax',
        scale: true,
    }
}

const options = (x, head, labels, zIndex) => {
    return {
        toolbox: {
            feature: {
                saveAsImage: {},
                dataView: {
                    readOnly: false
                },
                magicType: {},
                restore: {}
            }
        },
        title: {
            text: head,
            left: 'center'
        },
        legend: {
            data: labels,
            left: 'center',
            top: '30px',
            type: 'scroll',
            width: 1000,
            height: 300
        },
        dataZoom: [
            {
                show: true,
                type: 'slider',
                realtime: true,
                start: 0,
                end: 100,
                xAxisData: 0
            },
            ...(zIndex !== null && zIndex !== false ? [{
                yAxisIndex: zIndex,
                show: true,
                start: 0,
                end: 100,
                type: 'slider',
                filterMode: 'none',
                left: "0px"
            }] : [])
        ],
        xAxis: {
            type: 'category',
            data: x,
            axisLabel: {
                formatter: function (value) {
                    const date = new Date(value);
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const formattedTime = `${hours % 12 === 0 ? 12 : hours % 12}:${String(minutes).padStart(2, '0')} ${ampm}`;
                    return `${date.getDate()} ${formattedTime}`;
                }
            }
        }
    }
}

const customOptions = (x, head, labels) => {
    return {
        toolbox: {
            feature: {
                saveAsImage: {},
                dataView: {
                    readOnly: false
                },
                magicType: {},
                restore: {}
            }
        },
        title: {
            text: head,
            left: 'center'
        },
        legend: {
            data: labels,
            left: 'center',
            top: '30px',
            type: 'scroll',
            width: 800
        },
        xAxis: {
            type: 'category',
            data: x,
            axisLabel: {
                formatter: function (value) {
                    const date = new Date(value);
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const formattedTime = `${hours % 12 === 0 ? 12 : hours % 12}:${String(minutes).padStart(2, '0')} ${ampm}`;
                    return `${date.getDate()} ${formattedTime}`;
                }
            }
        }
    }
}

const yDataZoom = (yZoom) => {
    const zoom = {
        show: true,
        start: 0,
        end: 100,
        type: "slider",
        filterMode: "none",
    };

    const offsetAmount = 60;
    let leftCounter = 0;
    let rightCounter = 0;

    if (yZoom.length === 1) {
        return [{
            ...zoom,
            yAxisIndex: 0,
            left: "0%"
        }];
    }

    const yZoomAxis = yZoom.map((y, index) => {
        if (index % 2 === 0) {
            const leftOffset = leftCounter === 0 ? "0px" : `${leftCounter * offsetAmount}px`;
            leftCounter++;
            return {
                ...zoom,
                yAxisIndex: y,
                left: leftOffset
            };
        } else {
            const rightOffset = rightCounter === 0 ? "0px" : `${rightCounter * offsetAmount}px`;
            rightCounter++;
            return {
                ...zoom,
                yAxisIndex: y,
                right: rightOffset
            };
        }
    });

    return yZoomAxis;
}



// const yDataZoom = (yZoom) => {
//     const zoom = {
//         show: true,
//         start: 0,
//         end: 100,
//         type: "slider",
//         filterMode: "none",
//     }

//     if (yZoom.length == 1) {
//         return {
//             ...zoom,
//             yAxisIndex: 0,
//             left: "0%"
//         }
//     }
//     const yZoomAxis = [];
//     yZoom.forEach(y => {
//         yZoomAxis.push({
//             ...zoom,
//             yAxisIndex: y,
//             ...(y % 2 ? {left: `${offset}%`} : {right: `${offset}%`})
//         })
//     })
//     return yZoomAxis;
// }

const getColumns = (data, columns, title, types, zoom, ySeriesType) => {
    const x = [];
    const annotation = [];
    const series = columns.map(() => [])
    const labels = columns.map(i => data.cols[i].label)
    const unitType = [];

    data.rows.forEach(row => {
        x.push(parseDateString(row.c[0].v));
        if(row.c[1].v == "null" || row.c[1].v == null) {
            annotation.push(null);
        } else {
            annotation.push(row.c[1].v);
        }

        columns.forEach((colIndex, index) => {
            const v = row.c[colIndex].v;
            const f = row.c[colIndex].f;

            if (row.c[colIndex].f) {
                if (row.c[colIndex].f.includes('%')) {
                    unitType.push(f.split('').at(-1))
                    series[index].push(parseFloat((v * 100).toFixed(2)))
                } else {
                    unitType.push(f.split(' ').at(-1))
                    series[index].push(v)
                }
            } else {
                unitType.push('')
                series[index].push(v)
            }
        })
    })



    const markLine = annotation.map((value, index) => {
        if (value !== null) {
            value = value.replace(/"/g, '');
            return {
                xAxis: x[index],
                label: {
                    show: true,
                    formatter: value,
                    position: 'middle',
                    distance: -30,
                    color: "#000",
                    fontWeight: 'bold',
                    fontSize: 14,
                    borderColor: '#000',
                    borderType: "solid",
                    borderWidth: 1,
                    padding: [4, 4, 6, 6],
                    textBorderColor: "#fff",
                    textBorderWidth: 1,
                    textBorderType: "solid"
                },
                lineStyle: {
                    color: 'red',
                    type: 'solid',
                    width: 6,
                    opacity: 0.2
                }
            }
        }
        return null;
    }).filter(line => line !== null)

    const yAxis = [];

    if (types.length == 1) {
        yAxis.push(ySeries(types[0].name, types[0].place, types[0].unit))
    } else {
        types.forEach(type => {
            yAxis.push(ySeries(type.name, type.place, type.unit, type?.offset))
        })
    }

    const seriesAxis = [];

    const common = (name, data) => {
        return {
            name,
            data,
            emphasis: {
                focus: 'series'
            }
        }
    }

    if (labels.length == 1) {
        const com = common(labels[0], series[0])
        seriesAxis.push({
            ...com,
            type: ySeriesType[0].type,
            yAxisIndex: ySeriesType[0].yAssoc
        })
    } else {
        const com = [];
        for (let i = 0; i < labels.length; i++) {
            com.push(common(labels[i], series[i]))
            if (ySeriesType[i].stack) {
                seriesAxis.push({
                    ...com[i],
                    type: ySeriesType[i].type,
                    stack: ySeriesType[i].stack,
                    yAxisIndex: ySeriesType[i].yAssoc
                })
            } else {
                seriesAxis.push({
                    ...com[i],
                    type: ySeriesType[i].type,
                    yAxisIndex: ySeriesType[i].yAssoc
                })
            }
        }
    }

    seriesAxis.push({
        type: "line",
        stack: "all",
        markLine: {
            data: markLine,
            symbol: "none",
            // precision: 4,
        }
    })

    return {
        ...options(x, title, labels, zoom),
        yAxis,
        series: seriesAxis,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: true
            },
            formatter: function (params) {
                let tooltipContent = `<div class="font-semibold text-color">${params[0].axisValue}</div>`;
                params.forEach((param, index) => {
                    const colorIndicator = param.marker;
                    tooltipContent += `${colorIndicator + param.seriesName} : ${param.value} ${unitType[index]}<br/>`
                });
                return tooltipContent;
            }
        }
    }
}

const extractColumns = (data, columns, kpiTypes) => {
    const x = [];
    const annotation = [];
    const series = columns.map(() => [])
    const labels = columns.map(col => data.cols[col].label)
    const uniqueUnit = new Set();

    data.rows.forEach(row => {
        x.push(parseDateString(row.c[0].v))

        if(row.c[1].v == "null" || row.c[1].v == null) {
            annotation.push(null);
        } else {
            annotation.push(row.c[1].v);
        }
        
        columns.forEach((colIndex, index) => {
            const v = row.c[colIndex].v
            const f = row.c[colIndex].f

            if (row.c[colIndex].f) {
                if (row.c[colIndex].f.includes("%")) {
                    uniqueUnit.add("%")
                    series[index].push(parseFloat((v * 100).toFixed(2)))
                } else if (row.c[colIndex].f) {
                    uniqueUnit.add(f.split(' ').at(-1))
                    series[index].push(v)
                }
            } else {
                uniqueUnit.add('')
                series[index].push(v)
            }
        })
    })

    const markLine = annotation.map((value, index) => {
        if (value !== null) {
            // return {
            //     xAxis: x[index],
            //     label: {
            //         "show": true,
            //         formatter: value,
            //         position: "middle"
            //     },
            //     lineStyle: {
            //         color: "red",
            //         type: "solid"
            //     }
            // }

            return {
                xAxis: x[index],
                label: {
                    show: true,
                    formatter: value,
                    position: 'middle',
                    color: "#000",
                    fontWeight: 'bold',
                    fontSize: 14,
                    borderColor: '#000',
                    borderType: "solid",
                    borderWidth: 1,
                    padding: [4, 4, 6, 6],
                    textBorderColor: "#fff",
                    textBorderWidth: 1,
                    textBorderType: "solid"
                },
                lineStyle: {
                    color: 'red',
                    type: 'solid',
                    width: 6,
                    opacity: 0.2
                }
            }
        }
        return null
    }).filter(line => line !== null)

    const yUnitArray = Array.from(uniqueUnit)
    const unitMap = new Map();
    unitMap.set("%", "Percentage")
    unitMap.set("Mbps", "Megabytes")
    unitMap.set("Kbps", "Kilobytes")
    unitMap.set("GB", "Gigabytes")
    unitMap.set("dBm", "Decibels per Milliwatt")
    unitMap.set("", "Data")

    const yTypes = [];

    for (let i = 0; i < yUnitArray; i++) {
        yTypes.push(unitMap.get(yUnitArray[i]))
    }

    if (uniqueUnit.size == 1) {
        const yAxis = [
            {
                type: 'value',
                name: unitMap.get(yUnitArray[0]),
                position: "left",
                // alignTicks: true,
                axisLine: {
                    show: true
                },
                axisLabel: {
                    formatter: function (value) {
                        return `${Math.round((value + Number.EPSILON) * 100) / 100} ${yUnitArray[0]}`
                    }
                },
                tooltip: {},
                min: 'dataMin',
                max: 'dataMax',
                scale: true,
            }
        ]

        const ySeriesContainer = [];
        labels.forEach((label, index) => {
            ySeriesContainer.push({
                data: series[index],
                type: kpiTypes[index] == "stack" ? "bar" : kpiTypes[index],
                stack: kpiTypes[index] == "stack" ? "one" : null,
                yAxisIndex: 0,
                emphasis: {
                    focus: 'series'
                },
                name: label
            })
        })

        ySeriesContainer.push({
            type: "line",
            stack: "all",
            markLine: {
                data: markLine,
                symbol: "none"
            }
        })

        return {
            ...customOptions(x, "Custom KPI Chart", labels),
            yAxis,
            series: ySeriesContainer,
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "cross"
                }
            },
            dataZoom: [
                {
                    show: true,
                    realtime: true,
                    start: 0,
                    end: 100,
                    xAxisData: [0, 1]
                },
                {
                    type: 'slider',
                    realtime: true,
                    start: 0,
                    end: 100,
                    xAxisData: [0, 1]
                }
            ]
        }
    }

    const yAxis = [...uniqueUnit].map((val, index) => {
        const offset = index > 1 ? (index - 1) * 80 : 0
        const position = index % 2 === 0 ? "left" : "right"

        return {
            type: 'value',
            name: unitMap.get(val),
            position,
            offset,
            // alignTicks: true,
            axisLine: {
                show: true
            },
            axisLabel: {
                formatter: function (value) {
                    return `${Math.round((value + Number.EPSILON) * 100) / 100} ${val}`
                }
            },
            min: 'dataMin',
            max: 'dataMax',
            scale: true,
        }
    })

    const yIndexes = [];
    for (let i = 0; i < columns.length; i++) {
        let yIndex = 0;
        if (data.rows[3].c[columns[i]].f == null) {
            yIndex = yUnitArray.indexOf("")
        } else {
            for (let j = 0; j < yUnitArray.length; j++) {
                if (yUnitArray[j] == "") continue;
                if (data.rows[2].c[columns[i]].f.includes(yUnitArray[j])) yIndex = j
            }
        }

        yIndexes.push({
            data: series[i],
            type: kpiTypes[i] == "stack" ? "bar" : kpiTypes[i],
            stack: kpiTypes[i] == "stack" ? "one" : null,
            yAxisIndex: yIndex,
            emphasis: {
                focus: 'series'
            },
            name: labels[i]
        })
    }

    yIndexes.push({
        type: "line",
        stack: "all",
        markLine: {
            data: markLine,
            symbol: "none"
        }
    })

    return {
        ...customOptions(x, "Custom KPI Chart", labels),
        yAxis,
        series: yIndexes,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: true
            },
        },
        dataZoom: [
            {
                show: true,
                realtime: true,
                start: 0,
                end: 100,
                xAxisData: [0, 1]
            },
            {
                type: 'slider',
                realtime: true,
                start: 0,
                end: 100,
                xAxisData: [0, 1]
            }
        ]
    }
}

export { getColumns, setType, setSeries, extractColumns, yDataZoom }