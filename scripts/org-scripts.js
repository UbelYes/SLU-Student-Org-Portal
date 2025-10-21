function activeBtn(btn) {
    btn.style.backgroundColor = "#FFD700";
    btn.style.color = "#003366";
}
function inactiveBtn(btn) {
    btn.style.backgroundColor = "#003366";
    btn.style.color = "white";
}
const dashBtn = document.getElementById("dash-btn");
const submHistryBtn = document.getElementById("sub-hist-btn");

activeBtn(dashBtn);

//onclicks
function showDashboard() {
    activeBtn(dashBtn);
    inactiveBtn(submHistryBtn);
}
function showHistory() {
    activeBtn(submHistryBtn);
    inactiveBtn(dashBtn);
}


