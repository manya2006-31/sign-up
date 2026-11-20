// React 18 via CDN, written WITHOUT JSX (React.createElement only)
const h = React.createElement;
const { useState } = React;

async function api(path, body) {
  const res = await fetch("/api/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function Field(props) {
  return h("div", { className: "field" },
    h("label", { htmlFor: props.id }, props.label),
    h("input", {
      id: props.id,
      type: props.type,
      value: props.value,
      autoComplete: props.autoComplete,
      onChange: (e) => props.onChange(e.target.value),
    })
  );
}

function AuthForm(props) {
  const isSignup = props.mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const data = await api(isSignup ? "signup" : "login", { email, password });
      if (isSignup) {
        setMsg({ type: "success", text: data.message });
        setEmail("");
        setPassword("");
      } else {
        props.onLogin(data.email);
      }
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  const title = isSignup ? "Sign Up" : "Log In";

  return h("div", { className: "card" },
    h("h1", null, title),
    h("p", { className: "switch-text" },
      isSignup ? "Already a member? " : "Don't have an account? ",
      h("button", { type: "button", className: "link", onClick: props.onSwitch },
        isSignup ? "Log In" : "Sign Up")
    ),
    msg && h("div", { className: "alert " + msg.type }, msg.text),
    h("form", { onSubmit: submit, noValidate: true },
      h(Field, { id: "email", label: "Email", type: "email", value: email, onChange: setEmail, autoComplete: "email" }),
      h(Field, { id: "password", label: "Password", type: "password", value: password, onChange: setPassword,
        autoComplete: isSignup ? "new-password" : "current-password" }),
      h("button", { type: "submit", className: "btn", disabled: loading },
        loading ? "Please wait..." : title)
    )
  );
}

function Welcome(props) {
  return h("div", { className: "card welcome" },
    h("span", { className: "badge" }, "\u2713 Active Session"),
    h("h1", null, "Welcome!"),
    h("p", null, "You are successfully authenticated."),
    h("div", { className: "who" }, h("small", null, "LOGGED IN AS:"), h("strong", null, props.email)),
    h("button", { className: "btn", onClick: props.onLogout }, "Log Out")
  );
}

function App() {
  const [view, setView] = useState("signup");
  const [user, setUser] = useState(null);

  if (user)
    return h(Welcome, { email: user, onLogout: () => { setUser(null); setView("login"); } });

  return h(AuthForm, {
    key: view,
    mode: view,
    onSwitch: () => setView(view === "signup" ? "login" : "signup"),
    onLogin: setUser,
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));