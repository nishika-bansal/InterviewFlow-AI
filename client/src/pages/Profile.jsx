import { KeyRound, Save } from "lucide-react";
import { useMemo, useState } from "react";
import Alert from "../components/Alert.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [profileForm, setProfileForm] = useState(() => ({
    name: user?.name || "",
    phone: user?.profile?.phone || "",
    location: user?.profile?.location || "",
    targetRole: user?.profile?.targetRole || "",
    experienceLevel: user?.profile?.experienceLevel || "fresher",
    skillsText: (user?.profile?.skills || []).join(", ")
  }));
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const skills = useMemo(
    () =>
      profileForm.skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    [profileForm.skillsText]
  );

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        location: profileForm.location,
        targetRole: profileForm.targetRole,
        experienceLevel: profileForm.experienceLevel,
        skills
      });
      setMessage("Profile updated");
    } catch (err) {
      setError(err.message);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setMessage("Password changed");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-stack">
      <div className="page-title-row">
        <div>
          <h1>User Profile</h1>
          <p>Profile details, target role and password.</p>
        </div>
      </div>

      <Alert type="error" message={error} />
      <Alert type="success" message={message} />

      <section className="two-column">
        <form className="panel form-grid" onSubmit={saveProfile}>
          <div className="panel-heading">
            <h2>Profile Details</h2>
          </div>
          <label>
            Name
            <input
              value={profileForm.name}
              onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
            />
          </label>
          <label>
            Phone
            <input
              value={profileForm.phone}
              onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
            />
          </label>
          <label>
            Location
            <input
              value={profileForm.location}
              onChange={(event) => setProfileForm({ ...profileForm, location: event.target.value })}
            />
          </label>
          <label>
            Target Role
            <input
              value={profileForm.targetRole}
              onChange={(event) =>
                setProfileForm({ ...profileForm, targetRole: event.target.value })
              }
            />
          </label>
          <label>
            Experience
            <select
              value={profileForm.experienceLevel}
              onChange={(event) =>
                setProfileForm({ ...profileForm, experienceLevel: event.target.value })
              }
            >
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </label>
          <label>
            Skills
            <input
              value={profileForm.skillsText}
              onChange={(event) =>
                setProfileForm({ ...profileForm, skillsText: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit">
            <Save size={18} />
            <span>Save Profile</span>
          </button>
        </form>

        <form className="panel form-grid" onSubmit={savePassword}>
          <div className="panel-heading">
            <h2>Change Password</h2>
          </div>
          <label>
            Current Password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
              }
              required
            />
          </label>
          <label>
            New Password
            <input
              type="password"
              minLength="6"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, newPassword: event.target.value })
              }
              required
            />
          </label>
          <button className="secondary-button" type="submit">
            <KeyRound size={18} />
            <span>Update Password</span>
          </button>
        </form>
      </section>
    </div>
  );
}
