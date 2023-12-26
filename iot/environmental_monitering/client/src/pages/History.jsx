import React, { useState } from 'react'
import "../css/history.css"
import 'rc-pagination/assets/index.css'
import Pagination from 'rc-pagination'
import Icon from '../components/Icon'
import { APIQueryKey } from '../services/react-query'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '../services/axios.config'

export function formatDateTime(inputDate) {
    const date = new Date(inputDate);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes}`;
    
    return formattedDateTime;
}

const History = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterDate, setFilterDate] = useState(null)

  const limit = 5

   // get remain day off
  const { data: history } = useQuery({
    queryKey: [APIQueryKey.GET_HISTORY, currentPage, filterDate],
    queryFn: async () => {
      let path = `/history?page=${currentPage}&limit=${limit}`

      if(filterDate) {
        path += `&date=${filterDate}`
      }


      const { data } = await axiosInstance.get(path)
      return data
    }
  })

  return (
   <main className='main-container'>
      <div className='main-title' style={{marginBottom: '40px'}}>
          <h3>Lịch sử</h3>

          <div style={{position: "absolute", right: '80px', top: '100px'}}>
          <button style={{padding: '6px 8px', borderRadius: '8px', marginRight: '10px', cursor: 'pointer'}}
          onClick={() => {
            setFilterDate('')
            setCurrentPage(1)
          }}
          >Bỏ lọc</button>
          <input 
            type="date" 
            value={filterDate}
            style={{padding: '6px 8px', borderRadius: '8px', cursor: 'pointer'}}
            onChange={(e) => {
              setFilterDate(e.target.value)
              setCurrentPage(1)
            }}
          />
          </div>

      </div>

      <table id="keywords" cellPadding="0">
        <thead>
          <tr>
            <th><span>Thời gian</span></th>
            <th><span>Độ ẩm</span></th>
            <th><span>Nhiệt độ</span></th>
            <th><span>Khí gas</span></th>
            <th><span>Cường độ sáng</span></th>
            <th><span>Trạng thái mưa</span></th>
          </tr>
        </thead>
        <tbody>
          {
            history?.data?.map((item, index) => (
              <tr key={index}>
                <td className="lalign">{formatDateTime(item.timestamp)}</td>
                <td>{item.humidity} %</td>
                <td>{item.temperature} °C</td>
                <td>{item.gas} %</td>
                <td>{item.light ? 'Yếu' : 'Mạnh'}</td>
                <td>{item.rain ? 'Không mưa' : 'Có mưa'}</td>
              </tr>
            ))
          }
        </tbody>
      </table>

      {history && <Pagination
        pageSize={limit}
        total={history.total}
        current={currentPage}
        onChange={(page) => {
          setCurrentPage(page)
        }}
        className='pagination-style'
        showTitle={false}
        {...paginationIcon}
      />}
    </main>
  )
}

const paginationIcon = {
  prevIcon: (
    <Icon icon="arrowLeftSFill" size="28px" className="text-neutral-900" />
  ),
  nextIcon: (
    <Icon
      icon="arrowRightSFill"
      size="28px"
      className="text-neutral-900 ml-2"
    />
  )
}


export default History