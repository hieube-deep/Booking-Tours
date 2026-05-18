import React from 'react'

function App() {
  return (
    <div>
      <div className='flex justify-around w-full p-4 bg-blue-600'>
        <h2 className='text-white text-2xl font-bold'>Booking.com</h2>
        <nav className='text-white'>
          <ul className='flex justify-between gap-4' >
            <li><a href="">Trang chủ</a></li>
            <li><a href="">Bài viết</a></li>
            <li><a href="">liên hệ</a></li>
            <li><a href="">Giới thiệu</a></li>
          </ul>
        </nav>
        <form action="" className='flex gap-3'>
          <input type="text" className='border border-gray-400 rounded-md p-1 bg-white' placeholder='search' />
          <button className='border border-gray-300 rounded-md px-2 py-1 cursor-pointer bg-white text-blue-500 font-bold' type='submit'>submit</button>
        </form>
      </div>

    </div>
  )
}

export default App