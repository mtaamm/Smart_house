import { useState, useEffect } from 'react';
import { getHouseItems, saveHouseMap } from './apiService';
import useStore from './useStore';

export const useHouseData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { items, setItemsFromApi, markAsSaved, getHasUnsavedChanges } = useStore();

  // Xử lý sự kiện refresh trang
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (getHasUnsavedChanges()) {
        const message = "Bạn có muốn lưu các thay đổi trước khi rời trang?";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [getHasUnsavedChanges]);

  // Fetch dữ liệu từ API khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiItems = await getHouseItems();
        
        // Cập nhật store với dữ liệu từ API
        if (apiItems && apiItems.length > 0) {
          setItemsFromApi(apiItems);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching house data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [setItemsFromApi]);

  // Hàm lưu dữ liệu lên server
  const saveData = async () => {
    try {
      setLoading(true);
      await saveHouseMap(items);
      markAsSaved();
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error saving house data:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  return { loading, error, items, saveData };
}; 