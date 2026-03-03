import React, { useState } from "react";
import "../styles/AuthStyles.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../model/auth/auth.context";

import {
  loginUser,
  registerUser,
} from "../../controller/auth/auth.controller";

const AuthPage = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Base Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("USER"); // Added role state
  const [isRegistering, setIsRegistering] = useState(false);

  // Organization Specific State
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("College");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgState, setOrgState] = useState("");
  const [orgPincode, setOrgPincode] = useState("");
  const [orgCountry, setOrgCountry] = useState("");

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({
        email: loginEmail,
        password: loginPassword,
      });

      login({
        token: data.token,
        user: data.user,
      });

      toast.success("Logged in successfully");

      const routes = {
        USER: "/dashboard/user",
        ORG_ADMIN: "/dashboard/org-admin",
        SUPER_ADMIN: "/dashboard/super-admin",
        EVENT_MANAGER: "/dashboard/event-manager",
        EVENT_STAFF: "/dashboard/event-staff"
      };
      
      navigate(routes[data.user.role] || "/unauthorized");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  /* ---------------- REGISTER ---------------- */
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);

    // Construct merged payload
    const payload = {
      full_name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
    };

    if (regRole === "ORG_ADMIN") {
      Object.assign(payload, {
        org_name: orgName,
        org_type: orgType,
        org_email: orgEmail,
        org_phone: orgPhone,
        org_address: orgAddress,
        org_city: orgCity,
        org_state: orgState,
        org_pincode: orgPincode,
        org_country: orgCountry
      });
    }

    try {
      await registerUser(payload);
      toast.success("Registration successful. Please verify your email.");

      setIsSignUpMode(false);
      setRegName(""); setRegEmail(""); setRegPassword("");
      setRegRole("USER");
      // Reset Org Fields
      setOrgName(""); setOrgEmail(""); setOrgPhone(""); setOrgAddress("");
      setOrgCity(""); setOrgState(""); setOrgPincode(""); setOrgCountry("");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className={`container ${isSignUpMode ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">

          {/* ---------- SIGN IN ---------- */}
          <form className="sign-in-form" onSubmit={handleLogin}>
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input type="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            </div>
            <button type="submit" className="login btn solid">Login</button>
            <p className="social-text">
              Don't have an account?
              <span className="login toggle-link" onClick={() => setIsSignUpMode(true)}>Sign up</span>
            </p>
          </form>

          {/* ---------- SIGN UP ---------- */}
          <form className="sign-up-form" onSubmit={handleRegister}>
            <h2 className="title">Sign up</h2>

            <div className="input-field">
              <i className="fas fa-user"></i>
              <input type="text" placeholder="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
            </div>

            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            </div>

            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
            </div>

            {/* Role Selection Dropdown */}
            <div className="input-field">
              <i className="fas fa-briefcase"></i>
              <select 
                value={regRole} 
                onChange={(e) => setRegRole(e.target.value)} 
                className="select-input" 
                style={{width: '100%', background: 'none', border: 'none', outline: 'none', fontWeight: '600', color: '#333'}}
              >
                <option value="USER">Standard User</option>
                <option value="ORG_ADMIN">Register an Institute</option>
              </select>
            </div>

            {/* Conditional Org Fields with Scroll for UI Fit */}
            {regRole === "ORG_ADMIN" && (
              <div className="org-fields-container" style={{
                maxHeight: '180px', 
                overflowY: 'auto', 
                width: '100%', 
                padding: '5px', 
                marginTop: '10px', 
                borderTop: '1px solid #ccc'
              }}>
                <p style={{textAlign: 'left', margin: '10px 0', color: '#47B599', fontSize: '14px', fontWeight: 'bold'}}>Institution Details</p>
                <div className="input-field"><i className="fas fa-building"></i><input type="text" placeholder="Institute Name" value={orgName} onChange={(e) => setOrgName(e.target.value)} required /></div>
                <div className="input-field">
                  <i className="fas fa-university"></i>
                  <select value={orgType} onChange={(e) => setOrgType(e.target.value)} style={{width: '100%', background: 'none', border: 'none', outline: 'none', color: '#333'}} required>
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="School">School</option>
                    <option value="Institute">Institute</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="input-field"><i className="fas fa-envelope-open-text"></i><input type="email" placeholder="Official Email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} required /></div>
                <div className="input-field"><i className="fas fa-phone"></i><input type="tel" placeholder="Phone Number" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} required /></div>
                <div className="input-field"><i className="fas fa-map-marker-alt"></i><input type="text" placeholder="Address" value={orgAddress} onChange={(e) => setOrgAddress(e.target.value)} required /></div>
                <div className="input-field"><i className="fas fa-city"></i><input type="text" placeholder="City" value={orgCity} onChange={(e) => setOrgCity(e.target.value)} required /></div>
                <div className="input-field"><i className="fas fa-map"></i><input type="text" placeholder="State" value={orgState} onChange={(e) => setOrgState(e.target.value)} required /></div>
                <div className="input-field"><i className="fas fa-thumbtack"></i><input type="text" placeholder="Pincode" value={orgPincode} onChange={(e) => setOrgPincode(e.target.value)} required /></div>
                <div className="input-field"><i className="fas fa-globe"></i><input type="text" placeholder="Country" value={orgCountry} onChange={(e) => setOrgCountry(e.target.value)} required /></div>
              </div>
            )}

            <button type="submit" className="signup btn solid" disabled={isRegistering}>
              {isRegistering ? "Creating..." : "Sign up"}
            </button>

            <p className="social-text">
              Already have an account?
              <span className="signup toggle-link" onClick={() => setIsSignUpMode(false)}>Sign in</span>
            </p>
          </form>

        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>Welcome!</h3>
            <p>Your platform for secure and smart event management.</p>
          </div>
          <img src="https://i.ibb.co/6HXL6q1/log.png" className="image" alt="login" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>Join us!</h3>
            <p>Create your account and start managing events.</p>
          </div>
          <img src="/img/register.svg" className="image" alt="register" />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;