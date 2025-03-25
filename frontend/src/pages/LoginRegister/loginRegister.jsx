import React from 'react';
import './styles.css';

class LoginRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showLoginPassword: false,
            showRegisterPassword: false,
            showConfirmPassword: false,
            loginData: {
                emailOrUsername: '',
                password: '',
                rememberMe: false
            },
            registerData: {
                email: '',
                username: '',
                password: '',
                confirmPassword: ''
            }
        };
    }

    handleLoginChange = (e) => {
        const { name, value, type, checked } = e.target;
        this.setState(prevState => ({
            loginData: {
                ...prevState.loginData,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    }

    handleRegisterChange = (e) => {
        const { name, value } = e.target;
        this.setState(prevState => ({
            registerData: {
                ...prevState.registerData,
                [name]: value
            }
        }));
    }

    handleLoginSubmit = (e) => {
        e.preventDefault();
        console.log('Login Data:', this.state.loginData);
        // Add your login logic here
    }

    handleRegisterSubmit = (e) => {
        e.preventDefault();
        console.log('Register Data:', this.state.registerData);
        // Add your registration logic here
    }

    togglePasswordVisibility = (field) => {
        this.setState(prevState => ({
            [field]: !prevState[field]
        }));
    }

    render() {
        const { 
            showLoginPassword, 
            showRegisterPassword, 
            showConfirmPassword,
            loginData,
            registerData
        } = this.state;

        return (
            <div className="container">
                <nav className="breadcrumb">
                    <a href="/">Homepage</a>
                    <span> / </span>
                    <span>Login / Register</span>
                </nav>

                <div className="form-container">
                    {/* Login Form */}
                    <div className="form-box">
                        <h2>Login</h2>
                        <form onSubmit={this.handleLoginSubmit}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="emailOrUsername"
                                    placeholder="Email or username*"
                                    value={loginData.emailOrUsername}
                                    onChange={this.handleLoginChange}
                                    required
                                />
                            </div>

                            <div className="form-group password-field">
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password*"
                                    value={loginData.password}
                                    onChange={this.handleLoginChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => this.togglePasswordVisibility('showLoginPassword')}
                                >
                                    👁️
                                </button>
                            </div>

                            <div className="form-group checkbox">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={loginData.rememberMe}
                                    onChange={this.handleLoginChange}
                                />
                                <label htmlFor="rememberMe">Remember me</label>
                            </div>

                            <button type="submit" className="submit-btn">Login</button>

                            <div className="forgot-password">
                                <a href="#">Lost your password?</a>
                            </div>
                        </form>
                    </div>

                    {/* Register Form */}
                    <div className="form-box">
                        <h2>Register</h2>
                        <form onSubmit={this.handleRegisterSubmit}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email*"
                                    value={registerData.email}
                                    onChange={this.handleRegisterChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username*"
                                    value={registerData.username}
                                    onChange={this.handleRegisterChange}
                                    required
                                />
                            </div>

                            <div className="form-group password-field">
                                <input
                                    type={showRegisterPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password*"
                                    value={registerData.password}
                                    onChange={this.handleRegisterChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => this.togglePasswordVisibility('showRegisterPassword')}
                                >
                                    👁️
                                </button>
                            </div>

                            <div className="form-group password-field">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm Password*"
                                    value={registerData.confirmPassword}
                                    onChange={this.handleRegisterChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => this.togglePasswordVisibility('showConfirmPassword')}
                                >
                                    👁️
                                </button>
                            </div>

                            <button type="submit" className="submit-btn">Register</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default LoginRegister;