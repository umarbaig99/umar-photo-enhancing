// ===============================
// 📸 Umar Web | AI Photo Enhancer
// ===============================

// 🧠 Backend base URL
// Empty string means frontend & backend are on same server
const BACKEND = "";

// -------------- Elements --------------
const slider = document.querySelector(".slider");
const afterImage = document.querySelector(".after");
const beforeImage = document.querySelector(".before");
const comparison = document.querySelector(".image-comparison");
const fileInput = document.getElementById("fileInput");
const loader = document.getElementById("loader");
const authBtn = document.getElementById("authBtn");
const authModal = document.getElementById("authModal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const toggleAuth = document.getElementById("toggleAuth");
const authActionBtn = document.getElementById("authActionBtn");
const nameField = document.getElementById("nameField");
const emailField = document.getElementById("emailField");
const passwordField = document.getElementById("passwordField");

let isSliding = false;
let isRegister = false;

// ===============================
// 🔄 Slider Control
// ===============================
slider.addEventListener("mousedown", () => (isSliding = true));
window.addEventListener("mouseup", () => (isSliding = false));
comparison.addEventListener("mousemove", (e) => {
  if (!isSliding) return;
  const rect = comparison.getBoundingClientRect();
  let pos = ((e.clientX - rect.left) / rect.width) * 100;
  pos = Math.min(Math.max(pos, 0), 100);
  afterImage.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
  slider.style.left = `${pos}%`;
});

// ===============================
// 📤 File Upload Handler
// ===============================
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const token = localStorage.getItem("umar_token");
  if (!token) {
    alert("Please login first!");
    return;
  }

  // Show local preview
  const reader = new FileReader();
  reader.onload = () => {
    beforeImage.src = reader.result;
  };
  reader.readAsDataURL(file);

  // Show loader
  loader.style.display = "flex";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${BACKEND}/api/enhance`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });

    const data = await res.json();
    loader.style.display = "none";

    if (!res.ok) {
      alert(data.error || "Enhancement failed.");
      return;
    }

    // Update After Image
    afterImage.src = data.enhanced.startsWith("http")
      ? data.enhanced
      : `${BACKEND}${data.enhanced}`;

    alert("✅ Image enhanced successfully!");
  } catch (err) {
    loader.style.display = "none";
    console.error(err);
    alert("Error connecting to backend.");
  }
});

// ===============================
// 🔐 Authentication Modal Control
// ===============================
//authBtn.onclick = () => (authModal.style.display = "flex");
//closeModal.onclick = () => (authModal.style.display = "none");

//toggleAuth.onclick = () => {
  //isRegister = !isRegister;
 // modalTitle.textContent = isRegister ? "Register" : "Login";
 // nameField.style.display = isRegister ? "block" : "none";
  //authActionBtn.textContent = isRegister ? "Register" : "Login";
 // toggleAuth.innerHTML = isRegister
   // ? 'Already have an account? <span>Login</span>'
    //: "Don't have an account? <span>Register</span>";
//};//

// ===============================
// 🧑‍💻 Auth Actions (Login / Register)
// ===============================
//authActionBtn.onclick = async () => {
  //const email = emailField.value.trim();
  //const password = passwordField.value.trim();
 // const name = nameField.value.trim();

 // const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
  //const payload = isRegister ? { name, email, password } : { email, password };

  //try {
    //const res = await fetch(`${BACKEND}${endpoint}`, {
      //method: "POST",
     // headers: { "Content-Type": "application/json" },
     // body: JSON.stringify(payload),
   // });

    //const data = await res.json();
    //if (!res.ok) return alert(data.error || "Auth failed");

    // Store token & user
   // localStorage.setItem("umar_token", data.token);
    //localStorage.setItem("umar_user", JSON.stringify(data.user));

  //  authModal.style.display = "none";
   // updateHeader();
   // alert("✅ Logged in successfully!");
 // } catch (err) {
   // console.error(err);
  // alert("Server error during auth.");
  //}
//};

// ===============================
// 🧭 Update Header on Login
// ===============================
function updateHeader() {
  const token = localStorage.getItem("umar_token");
  const user = JSON.parse(localStorage.getItem("umar_user") || "{}");

  if (token) {
    authBtn.textContent = `Hi, ${user.name || "User"} 👋`;
    authBtn.onclick = () => {
      if (confirm("Do you want to logout?")) {
        localStorage.clear();
        location.reload();
      }
    };
  }
}
updateHeader();
