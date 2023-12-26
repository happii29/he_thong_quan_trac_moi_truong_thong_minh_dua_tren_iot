import React from 'react'
import { WiHumidity } from 'react-icons/wi'
import { APIQueryKey } from '../services/react-query'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '../services/axios.config'

const Report = () => {

  const { data: maxTemperature } = useQuery({
    queryKey: [APIQueryKey.GET_MAX_TEMPERATURE],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        '/report/temperature/max'
      )

      return data
    }
  })   
  
  const { data: minTemperature } = useQuery({
    queryKey: [APIQueryKey.GET_MIN_TEMPERATURE],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        '/report/temperature/min'
      )

      return data
    },
  })   

  const { data: maxHumidity } = useQuery({
    queryKey: [APIQueryKey.GET_MAX_HUMIDITY],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        '/report/humidity/max'
      )

      return data
    }
  })   

  const { data: minHumidity } = useQuery({
    queryKey: [APIQueryKey.GET_MIN_HUMIDITY],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        '/report/humidity/min'
      )

      return data
    }
  }) 

  const { data: maxGas } = useQuery({
    queryKey: [APIQueryKey.GET_MAX_HUMIDITY],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        '/report/gas/max'
      )

      return data
    }
  })   

  const { data: minGas } = useQuery({
    queryKey: [APIQueryKey.GET_MIN_HUMIDITY],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        '/report/gas/min'
      )

      return data
    }
  })     

  return (
     <main className='main-container'>
        <div className='main-title'>
            <h3>Báo cáo</h3>
        </div>

        <div className='main-cards' style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '20px'}}>
            <div className='card' style={{background: '#2962ff'}}>
                <div className='card-inner'>
                    <h3>Độ ẩm cao nhất</h3>
                    <WiHumidity  className='card_icon'/>
                </div>
                <h1>{maxHumidity?.data} %</h1>
            </div>

           <div className='card' style={{background: '#2962ff'}}>
                <div className='card-inner'>
                    <h3>Độ ẩm thấp nhất</h3>
                    <WiHumidity  className='card_icon'/>
                </div>
                <h1>{minHumidity?.data} %</h1>
            </div>
        </div>

        <div className='main-cards' style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '20px'}}>
            <div className='card' style={{background: '#ff6d00'}}>
                <div className='card-inner'>
                    <h3>Nhiệt độ cao nhất</h3>
                    <WiHumidity  className='card_icon'/>
                </div>
                <h1>{maxTemperature?.data} °C</h1>
            </div>

           <div className='card' style={{background: '#ff6d00'}}>
                <div className='card-inner'>
                    <h3>Nhiệt độ thấp nhất</h3>
                    <WiHumidity  className='card_icon'/>
                </div>
                <h1>{minTemperature?.data} °C</h1>
            </div>
        </div>

        <div className='main-cards' style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '20px'}}>
            <div className='card' style={{background: '#2e7d32'}}>
                <div className='card-inner'>
                    <h3>Lượng khí gas cao nhất</h3>
                    <WiHumidity  className='card_icon'/>
                </div>
                <h1>{maxGas?.data} %</h1>
            </div>

           <div className='card' style={{background: '#2e7d32'}}>
                <div className='card-inner'>
                    <h3>Lượng khí gas thấp nhất</h3>
                    <WiHumidity  className='card_icon'/>
                </div>
                <h1>{minGas?.data} %</h1>
            </div>
        </div>


    </main>
  )
}

export default Report