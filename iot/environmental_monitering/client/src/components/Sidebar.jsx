import React from 'react'
import 
{BsCart3, BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill}
 from 'react-icons/bs'

 import { RiDeviceFill } from "react-icons/ri";

function Sidebar({openSidebarToggle, OpenSidebar}) {
  return (
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive": ""}>
        <div className='sidebar-title'>
            <div className='sidebar-brand'>
                <RiDeviceFill  className='icon_header'/> IOT Environment
            </div>
            <span className='icon close_icon' onClick={OpenSidebar}>X</span>
        </div>

        <ul className='sidebar-list'>
            <li className='sidebar-list-item'>
                <a href="/">
                    <BsGrid1X2Fill className='icon'/> Trang chủ
                </a>
            </li>
            <li className='sidebar-list-item'>
                <a href="/history">
                    <BsFillArchiveFill className='icon'/> Lịch sử
                </a>
            </li>
            <li className='sidebar-list-item'>
                <a href="/report">
                    <BsFillGrid3X3GapFill className='icon'/> Báo cáo
                </a>
            </li>
            {/* <li className='sidebar-list-item'>
                <a href="/group">
                    <BsPeopleFill className='icon'/> Thông tin nhóm
                </a>
            </li> */}
        </ul>
    </aside>
  )
}

export default Sidebar