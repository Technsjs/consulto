(function () {
  var form = document.getElementById("cf-form");
  var btn = document.getElementById("cf-verify");
  var status = document.getElementById("cf-status");
  if (!form || !btn || !status) return;
  var done = false;
  form.addEventListener("submit", function (e) {
    if (done) return;
    e.preventDefault();
    done = true;
    btn.classList.add("thcf-loading", "thcf-active");
    status.textContent = "Verifying your browser...";
    setTimeout(function () {
      btn.classList.remove("thcf-loading");
      btn.classList.add("thcf-done");
      status.textContent = "Success! Redirecting...";
      setTimeout(function () {
        window.location.assign("/api/cf-verify");
      }, 500);
    }, 1400);
  });
})();
