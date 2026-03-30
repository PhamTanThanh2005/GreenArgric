import { useState, useEffect } from 'react';

// file .env
const AIO_USERNAME = 'tri_nguyenm1405'; 
const AIO_KEY = '';

export const useAdafruitFeed = (feedKey: string) => {
  const [status, setStatus] = useState<'ON' | 'OFF'>('OFF');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const response = await fetch(
          `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/${feedKey}/data/last`,
          {
            headers: {
              'X-AIO-Key': AIO_KEY,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setStatus(data.value === '1' ? 'ON' : 'OFF');
        }
      } catch (error) {
        console.error(`Lỗi khi lấy dữ liệu feed ${feedKey}:`, error);
      }
    };

    fetchInitialStatus();
  }, [feedKey]);

  const toggleDevice = async () => {
    if (isLoading) return;
    setIsLoading(true); 

    const newValue = status === 'ON' ? '0' : '1'; 

    try {
      const response = await fetch(
        `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/${feedKey}/data`,
        {
          method: 'POST',
          headers: {
            'X-AIO-Key': AIO_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: newValue }),
        }
      );

      if (response.ok) {
        setStatus(newValue === '1' ? 'ON' : 'OFF');
      } else {
        alert('Gửi tín hiệu thất bại!');
      }
    } catch (error) {
      console.error(`Lỗi khi bật/tắt feed ${feedKey}:`, error);
      alert('Không thể kết nối đến máy chủ Adafruit!');
    } finally {
      setIsLoading(false);
    }
  };

  return { status, toggleDevice, isLoading };
};