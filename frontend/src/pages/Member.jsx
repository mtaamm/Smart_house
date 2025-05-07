import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Member = () => {
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberUid, setNewMemberUid] = useState('');

  useEffect(() => {
    if (!userState || !userState.auth) {
      navigate('/login');
      return;
    }

    // Kiểm tra thông tin userState
    console.log('userState:', userState);
    if (!userState.auth.uid || !userState.house_id) {
      setError('Thiếu thông tin người dùng hoặc nhà');
      setLoading(false);
      return;
    }

    const fetchMembers = async () => {
      try {
        console.log('Fetching members with params:', {
          uid: userState.auth.uid,
          house_id: userState.house_id
        });

        const response = await axios.get(`http://localhost:3000/house/get-members`, {
          params: {
            uid: userState.auth.uid,
            house_id: userState.house_id
          }
        });

        console.log('API Response:', response.data);

        if (response.data && response.data.status === 'successful') {
          setMembers(response.data.data);
        } else {
          setError(response.data?.message || 'Không thể tải danh sách thành viên');
        }
      } catch (error) {
        console.error('Error fetching members:', error);
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách thành viên');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [userState, navigate]);

  const handleDeleteMember = async (memberId) => {
    if (!userState || !userState.auth || !userState.auth.uid || !userState.house_id) {
      setError('Vui lòng đăng nhập lại');
      return;
    }

    try {
      // Xóa thành viên khỏi danh sách
      const deleteResponse = await axios.post('http://localhost:3000/house/delete-member', {
        uid: userState.auth.uid,
        house_id: userState.house_id,
        member_id: memberId
      });

      if (deleteResponse.data.status === 'successful') {
        // Cập nhật danh sách thành viên một cách an toàn
        setMembers(prevMembers => prevMembers.filter(member => member.uid !== memberId));
        setSuccess('Xóa thành viên thành công');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(deleteResponse.data.message || 'Không thể xóa thành viên');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      setError('Thành viên đã xóa refresh lại trang để xem kết quả =))))');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!userState || !userState.auth) {
      setError('Vui lòng đăng nhập lại');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/house/add-member', {
        uid: userState.auth.uid,
        house_id: userState.house_id,
        member_uid: newMemberUid
      });

      if (response.data.status === 'successful') {
        setSuccess('Thêm thành viên thành công');
        setTimeout(() => setSuccess(''), 3000);
        setShowAddMember(false);
        setNewMemberUid('');
        // Refresh danh sách thành viên
        const membersResponse = await axios.get(`http://localhost:3000/house/get-members`, {
          params: {
            uid: userState.auth.uid,
            house_id: userState.house_id
          }
        });
        if (membersResponse.data && membersResponse.data.status === 'successful') {
          setMembers(membersResponse.data.data);
        }
      } else {
        setError(response.data.message || 'Không thể thêm thành viên');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi thêm thành viên');
    }
  };

  if (!userState || !userState.auth || !userState.auth.uid || !userState.house_id) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">Bạn hiện đang không là thành viên của ngôi nhà nào </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách thành viên</h1>
        {userState.root_owner && (
          <button
            onClick={() => setShowAddMember(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Thêm thành viên
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Thêm thành viên mới</h2>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  UID của thành viên
                </label>
                <input
                  type="text"
                  value={newMemberUid}
                  onChange={(e) => setNewMemberUid(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  placeholder="Nhập UID của thành viên"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members && members.map((member) => {
          const isCurrentUser = member.uid === userState.auth.uid;
          return (
            <div key={member.uid} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{isCurrentUser ? '👩‍💼' : '👤'}</span>
                  <div>
                    <div className="font-medium">{member.name || 'Chưa có tên'}</div>
                    <div className="text-sm text-gray-500">
                      <div>Tuổi: {member.age || 'Chưa có'}</div>
                      <div>SĐT: {member.phone_number || 'Chưa có'}</div>
                      <div>Email: {member.email || 'Chưa có'}</div>
                    </div>
                  </div>
                </div>
                {userState.root_owner && !isCurrentUser && (
                  <button
                    onClick={() => handleDeleteMember(member.uid)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Member;
