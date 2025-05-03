import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/slices/userSlice";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    age: "",
    phone_number: "",
    email: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        if (!formData.username || !formData.password) {
          setError("Vui lòng nhập đầy đủ thông tin đăng nhập");
          return;
        }

        const response = await axios.post("http://localhost:3000/user/login", {
          username: formData.username,
          password: formData.password,
        });
        console.log("Login response:", response.data);

        if (response.data.status === "successful") {
          const { auth, own_house, root_owner, house_id } = response.data.data;
          localStorage.setItem("auth", JSON.stringify(auth));
          localStorage.setItem("house_id", house_id);

          // Lấy thêm thông tin người dùng bao gồm house_id
          const userInfoResponse = await axios.get(
            "http://localhost:3000/user/get",
            {
              params: {
                uid: auth.uid,
                auth_code: auth.auth_code,
              },
            }
          );

          console.log("User info response:", userInfoResponse.data);

          if (userInfoResponse.data.status === "successful") {
            const userInfo = userInfoResponse.data.data;
            console.log("User info:", userInfo);
            dispatch(
              setUser({
                uid: auth.uid,
                own_house,
                root_owner,
                house_id: userInfo.house_id,
                name: userInfo.name,
                age: userInfo.age,
                phone_number: userInfo.phone_number,
                email: userInfo.email,
              })
            );
          } else {
            dispatch(
              setUser({
                uid: auth.uid,
                own_house,
                root_owner,
              })
            );
          }

          navigate("/dashboard");
        } else {
          setError(response.data.message || "Đăng nhập thất bại");
        }
      } else {
        if (
          !formData.username ||
          !formData.password ||
          !formData.name ||
          !formData.email
        ) {
          setError("Vui lòng nhập đầy đủ thông tin đăng ký");
          return;
        }

        const signUpData = {
          ...formData,
          age: parseInt(formData.age) || 0,
        };

        const response = await axios.post(
          "http://localhost:3000/user/sign-up",
          signUpData
        );

        if (response.data.status === "successful") {
          const { auth } = response.data.data;
          localStorage.setItem("auth", JSON.stringify(auth));
          dispatch(
            setUser({
              uid: auth.uid,
              own_house: false,
              root_owner: false,
            })
          );
          navigate("/dashboard");
        } else {
          setError(response.data.message || "Đăng ký thất bại");
        }
      }
    } catch (err) {
      console.error("Lỗi:", err);
      if (err.response) {
        setError(
          err.response.data.message || "Đã xảy ra lỗi khi kết nối với server"
        );
      } else if (err.request) {
        setError("Không thể kết nối với server. Vui lòng thử lại sau");
      } else {
        setError("Đã xảy ra lỗi không xác định");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Họ tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Tuổi
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-700"
          >
            {isLogin
              ? "Chưa có tài khoản? Đăng ký"
              : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
