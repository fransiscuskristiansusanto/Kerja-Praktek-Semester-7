/* logout */
// kode untuk logout
function logout() {
  $.removeCookie("psychology", { path: "/" });
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
    showClass: {
      popup: `
                animate__animated
                animate__zoomIn
            `,
    },
  });
  Toast.fire({
    icon: "success",
    title: "Berhasil keluar",
  });
  setTimeout(function () {
    window.location.href = "/";
  }, 3000);
}
