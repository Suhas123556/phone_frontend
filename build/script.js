// ================= BASE API CONFIG =================
// Replace the IP below with your backend machine address (or use 13.51.176.139 when running locally)
const API_BASE = "http://localhost:3000";

// ================= REGISTER =================
async function register(){
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  try{
    const res = await fetch(`${API_BASE}/register`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({username,password})
    })

    const data = await res.json()

    alert(data.message)

    // redirect to login
    window.location.href = "login.html"

  }catch(err){
    console.log(err)
    alert("Register failed")
  }
}


// ================= LOGIN =================
async function login(){
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  try{
    const res = await fetch(`${API_BASE}/login`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({username,password})
    })

    const data = await res.json()

    console.log("LOGIN RESPONSE:", data)

    // ✅ handle real backend response
    if(res.ok){
      localStorage.setItem("token", data.token || "userLoggedIn")

      alert("Login successful")
      window.location.href = "index.html"
    }else{
      alert(data.message || "Invalid username or password")
    }

  }catch(err){
    console.log(err)
    alert("Login failed")
  }
}


// ================= ADD TO CART =================
function addToCart(name, price, image){
  let cart = JSON.parse(localStorage.getItem("cart")) || []

  const fallbackImage = "https://via.placeholder.com/180x180.png?text=No+Image"
  cart.push({name, price, image: image || fallbackImage})

  localStorage.setItem("cart", JSON.stringify(cart))

  alert(name + " added to cart")

  if(document.getElementById("chartsSection")?.style?.display === "block") {
    renderCharts()
  }
}


// ================= LOAD CART =================
function loadCart(){
  let cart = JSON.parse(localStorage.getItem("cart")) || []

  const container = document.getElementById("cartItems")
  const totalBox = document.getElementById("total")

  if(!container) return

  container.innerHTML = ""

  let total = 0

  cart.forEach((item, index)=>{
    total += item.price

    container.innerHTML += `
      <div class="item">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:70px;height:70px;object-fit:cover;border-radius:8px;margin-bottom:10px;"/>` : ''}
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
        <button class="remove" onclick="removeItem(${index})">Remove</button>
      </div>
    `
  })

  if(totalBox){
    totalBox.innerText = "Total: ₹" + total
  }
}


// ================= REMOVE ITEM =================
function removeItem(index){
  let cart = JSON.parse(localStorage.getItem("cart")) || []

  cart.splice(index, 1)

  localStorage.setItem("cart", JSON.stringify(cart))

  loadCart()
}


// ================= LOGOUT =================
function logout(){
  localStorage.removeItem("token")
  window.location.href = "login.html"
}


// ================= AUTH CHECK =================
function checkAuth(){
  const token = localStorage.getItem("token")

  // allow guest
  if(!token){
    console.log("Guest mode")
  }
}
function removeOneProduct(name){
  let cart = JSON.parse(localStorage.getItem("cart")) || []
  const index = cart.findIndex(item => item.name === name)
  if(index === -1) return

  cart.splice(index, 1)
  localStorage.setItem("cart", JSON.stringify(cart))

  if(document.getElementById("chartsSection")?.style?.display === "block") {
    renderCharts()
  }
  if(typeof loadCart === 'function') {
    loadCart()
  }
}

function removeAllOfProduct(name){
  let cart = JSON.parse(localStorage.getItem("cart")) || []
  cart = cart.filter(item => item.name !== name)
  localStorage.setItem("cart", JSON.stringify(cart))

  if(document.getElementById("chartsSection")?.style?.display === "block") {
    renderCharts()
  }
  if(typeof loadCart === 'function') {
    loadCart()
  }
}

function clearCart(){
  localStorage.setItem("cart", JSON.stringify([]))

  if(document.getElementById("chartsSection")?.style?.display === "block") {
    renderCharts()
  }
  if(typeof loadCart === 'function') {
    loadCart()
  }
}

function toggleCharts(){
  const section = document.getElementById("chartsSection")
  const btn = document.getElementById("toggleChartsBtn")
  if(!section || !btn) return

  const opening = section.style.display === "none" || section.style.display === ""
  section.style.display = opening ? "block" : "none"
  btn.innerText = opening ? "Hide Charts" : "Show Charts"

  if(opening) {
    renderCharts()
  }
}

// Global chart remove button handler. Uses event delegation to avoid onclick string parsing issues.
document.addEventListener("click", function(event){
  const oneBtn = event.target.closest(".remove-one-product")
  if(oneBtn){
    const name = oneBtn.dataset.name ? decodeURIComponent(oneBtn.dataset.name) : ""
    if(name) removeOneProduct(name)
    return
  }

  const allBtn = event.target.closest(".remove-all-product")
  if(allBtn){
    const name = allBtn.dataset.name ? decodeURIComponent(allBtn.dataset.name) : ""
    if(name) removeAllOfProduct(name)
    return
  }
})

function renderCharts(){
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const total = cart.reduce((sum,item)=> sum + (item.price || 0), 0)
  const maxPossible = 100000
  const percent = Math.min(100, maxPossible ? Math.round((total / maxPossible) * 100) : 0)

  const bar = document.getElementById("cartTotalBar")
  const text = document.getElementById("cartTotalText")
  if(bar){
    bar.style.width = `${percent}%`
    bar.innerText = `${percent}%`
  }
  if(text){
    text.innerText = `Total in cart: ₹${total}`
  }

  const counts = cart.reduce((obj,item)=>{
    obj[item.name] = (obj[item.name] || 0) + 1
    return obj
  }, {})

  const productBars = document.getElementById("productBars")
  if(productBars){
    if(Object.keys(counts).length === 0){
      productBars.innerHTML = "(no items yet)"
    } else {
      productBars.innerHTML = Object.entries(counts).map(([name,count])=>{
        const percentEach = Math.round((count / cart.length) * 100)
        const safeName = encodeURIComponent(name)

        return `<div style="margin-bottom: 10px; padding:12px; background: rgba(255,255,255,0.08); border-radius: 10px; border: 1px solid rgba(255,255,255,0.2);">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <strong>${name}</strong>
            <span>${count} items (${percentEach}%)</span>
          </div>
          <div style="margin-top:8px; display:flex; gap:8px;">
            <button class="remove-one-product" data-name="${safeName}" style="flex:1; background:#ff5f5f; color:white; border-radius:5px; border:none; padding:6px; cursor:pointer;">Remove 1</button>
            <button class="remove-all-product" data-name="${safeName}" style="flex:1; background:#d32f2f; color:white; border-radius:5px; border:none; padding:6px; cursor:pointer;">Remove all</button>
          </div>
          <div class="bar-container" style="margin-top:10px;"><div class="bar" style="width:${percentEach}%">${percentEach}%</div></div>
        </div>`
      }).join("")
    }
  }

  const ratio = document.getElementById("purchaseRatio")
  if(ratio){
    const bought = cart.length
    const free = Math.max(0, 10 - bought)
    const boughtPct = Math.round((bought / (bought + free)) * 100)
    const freePct = 100 - boughtPct

    ratio.innerHTML = `
      <div style="flex:1; background:rgba(0,255,127,0.2); padding:8px; border-radius:8px; text-align:center;">Bought<br>${bought} (${boughtPct}%)</div>
      <div style="flex:1; background:rgba(255,45,85,0.2); padding:8px; border-radius:8px; text-align:center;">Remaining<br>${free} (${freePct}%)</div>
    `
  }
}
