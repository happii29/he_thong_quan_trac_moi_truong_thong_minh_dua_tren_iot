import React, { useEffect, useState } from 'react'
 import { WiHumidity } from "react-icons/wi";
 import 
 {  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } 
 from 'recharts';

 import { FaTemperatureHigh } from "react-icons/fa";
 import { FaGasPump } from "react-icons/fa";
 import { FaRegLightbulb } from "react-icons/fa";
 import { FaCloudRain } from "react-icons/fa";
import { useMutation, useQuery } from '@tanstack/react-query';
import { APIQueryKey } from '../services/react-query'
import { axiosInstance } from '../services/axios.config';
import { formatDateTime } from './History';
import { useAtomValue } from 'jotai';
import { socketAtom } from '../services/socket';

function Home() {
  const socketClient = useAtomValue(socketAtom);
  const [dataRealTime, setDataRealTime] = useState({});
  const [ledState, setLedState] = useState(false)

  // get remain day off
  const { data } = useQuery({
    queryKey: [APIQueryKey.GET_CHART_DATA],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        '/chart-data'
      )
      return data
    },
    refetchInterval: 1 * 60 * 1000
  })     

  // change led
  const {mutate} = useMutation({
    mutationKey: ['change led'],
    mutationFn: async (state) => {
      return await axiosInstance.get(`/control/led?state=${state ? 1 : 0}`)
    }
  })

  // socket realtime
  useEffect(() => {
    socketClient.on("connect", () => {
      console.log("Connected to server");
    });

    // socket on emit
    socketClient.on("dataRealtime", (dataRealTime) => {
      setDataRealTime(dataRealTime)
    });
  }, [socketClient]);

  useEffect(() => {
    setLedState(!!dataRealTime?.ledState)
  }, [dataRealTime?.ledState])
  
  const chartData = data?.sensorData?.slice()?.reverse() || []

  const handleChangeLed = (e) => {
    setLedState(e.target.checked)
    mutate(e.target.checked)
  }

  return (
    <main className='main-container'>
        <div className='main-title'>
            <h3>Trang chủ</h3>
        </div>

        <div className='main-cards'>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Độ ẩm</h3>
                    <WiHumidity  className='card_icon'/>
                </div>
                <h1>{dataRealTime?.humidity ? `${dataRealTime?.humidity} %` : ' '}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Nhiệt độ</h3>
                    <FaTemperatureHigh className='card_icon'/>
                </div>
                <h1>{dataRealTime?.temperature ? `${dataRealTime?.temperature.toFixed(2)} °C` : ' '}</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Khí gas</h3>
                    <FaGasPump className='card_icon'/>
                </div>
                <h1>{dataRealTime?.gas ? `${dataRealTime?.gas} %` : ' '}</h1>
            </div>
            <div className='card' style={{position: 'relative'}}>
                <div className='card-inner'>
                    <h3>Cường độ sáng</h3>
                    <FaRegLightbulb className='card_icon'/>
                </div>
                <h1>{dataRealTime?.light !== undefined ? `${dataRealTime?.light ? "Yếu" : "Mạnh"}` : ' '}</h1>

                <input className="l" type="checkbox"  checked={ledState} onChange={handleChangeLed} />
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>Trạng thái mưa</h3>
                    <FaCloudRain className='card_icon'/>
                </div>
                <h1>{dataRealTime?.rain !== undefined ? `${dataRealTime?.rain ? "Không mưa" : "Có mưa"}` : ' '}</h1>
            </div>
        </div>

        {/* one chart  */}
        <div className='charts'>
          <h2 style={{fontSize: '16px', textAlign: 'center'}}>Đồ thị biểu diễn độ ẩm, nhiệt độ, khí gas theo thời gian</h2>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={500}
              height={300}
              data={chartData}
              margin={{
                  top: 5,
                  right: 50,
                  left: 20,
                  bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" interval={0} style={{fontSize: '11px'}} tickFormatter={(timestamp) => formatDateTime(timestamp)} />
              <YAxis style={{fontSize: '11px'}} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="humidity" stroke="#2962ff" name="Độ ẩm" activeDot={{ r: 8 }} label={<CustomizedOneChartLabel />} />
              <Line type="monotone" dataKey="temperature" name="Nhiệt độ" stroke="#ff6d00" label={<CustomizedOneChartLabel />}/>
              <Line type="monotone" dataKey="gas" stroke="#2e7d32" name="Khí gas" label={<CustomizedOneChartLabel />}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* two chart  */}
        <div className='charts'>
          <h2 style={{fontSize: '16px', textAlign: 'center'}}>Đồ thị biểu diễn cường độ ánh sáng theo thời gian</h2>

          <ResponsiveContainer width="100%" height={300}>
           <LineChart
              width={500}
              height={300}
              data={chartData?.map(item => ({...item, light: item.light === 0 ? 1 : 0})) || []}
              margin={{
                  top: 20,
                  right: 50,
                  left: 20,
                  bottom: 5,
              }}
            >
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
              <XAxis dataKey="timestamp" interval={0} style={{fontSize: '11px'}} tickFormatter={(timestamp) => formatDateTime(timestamp)} />
              <YAxis  style={{fontSize: '11px'}}/>
              <Legend />
              <Line type="monotone" dataKey="light" stroke="#d50000" name="Ánh sáng" activeDot={{ r: 8 }} label={<CustomizedTwoChartLabel />} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* three chart  */}
        <div className='charts'>
          <h2 style={{fontSize: '16px', textAlign: 'center'}}>Đồ thị biểu diễn mưa theo thời gian</h2>

          <ResponsiveContainer width="100%" height={300}>
           <LineChart
              width={500}
              height={300}
              data={chartData?.map(item => ({...item, rain: item.rain === 0 ? 1 : 0})) || []}
              margin={{
                  top: 20,
                  right: 50,
                  left: 20,
                  bottom: 5,
              }}
            >
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
              <XAxis dataKey="timestamp" interval={0} style={{fontSize: '11px'}} tickFormatter={(timestamp) => formatDateTime(timestamp)} />
              <YAxis  style={{fontSize: '11px'}}/>
              <Legend />
              <Line type="monotone" dataKey="rain" stroke="#ffd60a" name="Mưa" activeDot={{ r: 8 }} label={<CustomizedThreeChartLabel />} />
            </LineChart>
          </ResponsiveContainer>
        </div>
    </main>
  )
}

const CustomizedOneChartLabel = ({ x, y, stroke, value }) => {
    return (
      <text x={x} y={y} dy={-4} fill={"yellow"} fontSize={12} fontWeight="medium" textAnchor="middle">
        {value}
      </text>
    );
}

const CustomizedTwoChartLabel = ({ x, y, stroke, value }) => {
    return (
      <text x={x} y={y} dy={-4} fill={"yellow"} fontSize={12} fontWeight="medium" textAnchor="middle">
        {value ? 'Mạnh' : 'Yếu'}
      </text>
    ); 
}

const CustomizedThreeChartLabel = ({ x, y, stroke, value }) => {
    return (
      <text x={x} y={y} dy={-4} fill={"yellow"} fontSize={12} fontWeight="medium" textAnchor="middle">
        {value ? 'Có mưa' : 'Không mưa'}
      </text>
    );
  
}

export default Home