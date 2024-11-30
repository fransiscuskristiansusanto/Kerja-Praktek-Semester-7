(function () {
  "use strict";

  // Selector helper function
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  // Event listener function
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach((e) => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  // On scroll event listener
  const onscroll = (el, listener) => {
    el.addEventListener("scroll", listener);
  };

  // Navbar links active state on scroll
  let navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };
  window.addEventListener("load", navbarlinksActive);
  onscroll(document, navbarlinksActive);

  // Scrolls to an element with header offset
  const scrollto = (el) => {
    let header = select("#header");
    let offset = header.offsetHeight;

    if (!header.classList.contains("header-scrolled")) {
      offset -= 16;
    }

    let elementPos = select(el).offsetTop;
    window.scrollTo({
      top: elementPos - offset,
      behavior: "smooth",
    });
  };

  // Toggle .header-scrolled class to #header when page is scrolled
  let selectHeader = select("#header");
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add("header-scrolled");
      } else {
        selectHeader.classList.remove("header-scrolled");
      }
    };
    window.addEventListener("load", headerScrolled);
    onscroll(document, headerScrolled);
  }

  // Back to top button
  let backtotop = select(".back-to-top");
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add("active");
      } else {
        backtotop.classList.remove("active");
      }
    };
    window.addEventListener("load", toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  // Mobile nav toggle
  on("click", ".mobile-nav-toggle", function (e) {
    select("#navbar").classList.toggle("navbar-mobile");
    this.classList.toggle("bi-list");
    this.classList.toggle("bi-x");
  });

  // Mobile nav dropdowns activate
  on(
    "click",
    ".navbar .dropdown > a",
    function (e) {
      if (select("#navbar").classList.contains("navbar-mobile")) {
        e.preventDefault();
        this.nextElementSibling.classList.toggle("dropdown-active");
      }
    },
    true
  );

  // Scroll with ofset on links with a class name .scrollto
  on(
    "click",
    ".scrollto",
    function (e) {
      if (select(this.hash)) {
        e.preventDefault();

        let navbar = select("#navbar");
        if (navbar.classList.contains("navbar-mobile")) {
          navbar.classList.remove("navbar-mobile");
          let navbarToggle = select(".mobile-nav-toggle");
          navbarToggle.classList.toggle("bi-list");
          navbarToggle.classList.toggle("bi-x");
        }
        scrollto(this.hash);
      }
    },
    true
  );

  // Scroll with ofset on page load with hash links in the url
  window.addEventListener("load", () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
  });

  // Preloader
  let preloader = select("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  // Hero carousel indicators
  let heroCarouselIndicators = select("#hero-carousel-indicators");
  let heroCarouselItems = select("#heroCarousel .carousel-item", true);

  heroCarouselItems.forEach((item, index) => {
    index === 0
      ? (heroCarouselIndicators.innerHTML +=
          "<li data-bs-target='#heroCarousel' data-bs-slide-to='" +
          index +
          "' class='active'></li>")
      : (heroCarouselIndicators.innerHTML +=
          "<li data-bs-target='#heroCarousel' data-bs-slide-to='" +
          index +
          "'></li>");
  });

  // Testimonials slider
  new Swiper(".testimonials-slider", {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    slidesPerView: "auto",
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20,
      },

      1200: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
    },
  });

  // Porfolio isotope and filter
  window.addEventListener("load", () => {
    let portfolioContainer = select(".portfolio-container");
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: ".portfolio-item",
        layoutMode: "fitRows",
      });

      let portfolioFilters = select("#portfolio-flters li", true);

      on(
        "click",
        "#portfolio-flters li",
        function (e) {
          e.preventDefault();
          portfolioFilters.forEach(function (el) {
            el.classList.remove("filter-active");
          });
          this.classList.add("filter-active");

          portfolioIsotope.arrange({
            filter: this.getAttribute("data-filter"),
          });
          portfolioIsotope.on("arrangeComplete", function () {
            AOS.refresh();
          });
        },
        true
      );
    }
  });

  // Initiate Pure Counter
  new PureCounter();

  // Initiate portfolio lightbox
  const portfolioLightbox = GLightbox({
    selector: ".portfolio-lightbox",
  });

  // Portfolio details slider
  new Swiper(".portfolio-details-slider", {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
  });

  // Animation on scroll
  window.addEventListener("load", () => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  });
})();

/* home.html */
// kode untuk mengirimkan pesan
function sendMessage() {
  let name = $("#name").val();
  let email = $("#email").val();
  let subject = $("#subject").val();
  let message = $("#message").val();

  // Nama
  $("#nameFeedback").removeClass("text-warning");
  if (name.length === 0 || name === " ") {
    $("#nameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Nama Anda masih kosong, silahkan isi kembali");
    $("#name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#nameFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Nama Anda sudah terisi di formulir ini");
    $("#name").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Email
  $("#emailFeedback").removeClass("text-warning");
  if (email.length === 0 || email === " ") {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Email Anda masih kosong, silahkan isi kembali");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_email(email)) {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Format email Anda tidak valid");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#emailFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Email Anda sudah terisi di formulir ini");
    $("#email").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Judul
  $("#subjectFeedback").removeClass("text-warning");
  if (subject.length === 0 || subject === " ") {
    $("#subjectFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Judul pesan Anda masih kosong, silahkan isi kembali");
    $("#subject").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#subjectFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Judul pesan Anda sudah terisi di formulir ini");
    $("#subject").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Pesan
  if (message.length === 0 || message === " ") {
    $("#messageFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Pesan Anda kosong");
    $("#message").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#messageFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Pesan Anda sudah terisi di formulir ini");
    $("#message").removeClass("is-invalid").addClass("is-valid").focus();
  }

  $.ajax({
    type: "POST",
    url: "/hubungi-kami",
    data: {
      name_give: name,
      email_give: email,
      subject_give: subject,
      message_give: message,
    },
    success: function (response) {
      if (response["result"] === "success") {
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
        });
        Toast.fire({
          icon: "success",
          title: "Pesan berhasil dikirim",
        });
        setTimeout(function () {
          window.location.href = "/";
        }, 3000);
      }
    },
  });
}

// cek email regex (dapat digunakan secara global) -> hubungi kami, register, login
function is_email(asValue) {
  var regExp = /\S+@\S+\.\S+/;
  return regExp.test(asValue);
}

// kosongkan form (dapat digunakan secara global) -> hubungi kami, register, login
function clearInputs() {
  // hubungi kami
  $("#name").val("");
  $("#email").val("");
  $("#subject").val("");
  $("#message").val("");

  // register atau login
  $("#first-name").val("");
  $("#last-name").val("");
  $("#account-name").val("");
  $("#email").val("");
  $("#password").val("");
  $("#repeat-password").val("");
}

/* register.html */
// kode untuk register
function register() {
  let first_name = $("#first-name").val();
  let last_name = $("#last-name").val();
  let account_name = $("#account-name").val();
  let useremail = $("#email").val();
  let password = $("#password").val();
  let repeat_password = $("#repeat-password").val();

  // Nama depan
  $("#firstNameFeedback").removeClass("text-warning");
  if (first_name.length === 0 || first_name === " ") {
    $("#firstNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Nama depan Anda masih kosong, silahkan isi kembali");
    $("#first-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#firstNameFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Nama depan Anda sudah terisi di formulir ini");
    $("#first-name").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Nama belakang
  $("#lastNameFeedback").removeClass("text-warning");
  if (last_name.length === 0 || last_name === " ") {
    $("#lastNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Nama belakang Anda masih kosong, silahkan isi kembali");
    $("#last-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#lastNameFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Nama belakang Anda sudah terisi di formulir ini");
    $("#last-name").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Nama akun
  $("#accountNameFeedback").removeClass("text-warning");
  if (account_name.length === 0 || account_name === " ") {
    $("#accountNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Nama akun Anda masih kosong, silahkan isi kembali");
    $("#account-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_account_name(account_name)) {
    $("#accountNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text(
        "Nama akun Anda tidak memenuhi syarat diantaranya 2-10 alfabet, nomor, dan karakter spesial -_."
      );
    $("#account-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#accountNameFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Nama akun Anda sudah terisi di formulir ini");
    $("#account-name").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Email
  $("#emailFeedback").removeClass("text-warning");
  if (useremail.length === 0 || useremail === " ") {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Email Anda masih kosong, silahkan isi kembali");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_email(useremail)) {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Format email Anda tidak valid");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#emailFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Email Anda sudah terisi di formulir ini");
    $("#email").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Kata sandi
  $("#passwordFeedback").removeClass("text-warning");
  if (password.length === 0 || password === " ") {
    $("#passwordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Kata sandi Anda kosong");
    $("#password").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_password(password)) {
    $("#passwordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text(
        "Kata sandi Anda tidak memenuhi syarat diantara 8-20 alfabet, nomor, dan karakter spesial !@#$%^&*"
      );
    $("#password").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#passwordFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Kata sandi Anda sudah terisi di formulir ini");
    $("#password").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Konfirmasi kata sandi
  if (repeat_password.length === 0 || password === " ") {
    $("#repeatPasswordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Konfirmasi kata sandi Anda kosong");
    $("#repeat-password")
      .removeClass("is-valid")
      .addClass("is-invalid")
      .focus();
    return;
  } else if (repeat_password !== password) {
    $("#repeatPasswordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Antara kata sandi atau konfirmasi kata sandi Anda tidak sama");
    $("#repeat-password")
      .removeClass("is-valid")
      .addClass("is-invalid")
      .focus();
    return;
  } else {
    $("#repeatPasswordFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Konfirmasi kata sandi Anda sudah terisi di formulir ini");
    $("#repeat-password")
      .removeClass("is-invalid")
      .addClass("is-valid")
      .focus();
  }

  $.ajax({
    type: "POST",
    url: "/cek-nama-akun-dan-email",
    data: {
      account_name_give: account_name,
      useremail_give: useremail,
    },
    success: function (response) {
      if (response["exists_account_name"] && response["exists_useremail"]) {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, nama akun dan email sudah terpakai",
        });
      } else if (response["exists_account_name"]) {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, nama akun sudah terpakai",
        });
      } else if (response["exists_useremail"]) {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, email sudah terpakai",
        });
      } else {
        $.ajax({
          type: "POST",
          url: "/mendaftarkan-akun",
          data: {
            first_name_give: first_name,
            last_name_give: last_name,
            account_name_give: account_name,
            useremail_give: useremail,
            password_give: password,
          },
          success: function (response) {
            if (response["result"] === "success") {
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
              });
              Toast.fire({
                icon: "success",
                title: "Berhasil mendaftar",
              });
              setTimeout(function () {
                window.location.href = "/masuk";
              }, 3000);
            }
          },
        });
      }
    },
  });
}

// cek nama (depan, belakang, akun) regex
function is_account_name(asValue) {
  var regExp = /^(?=.*[a-zA-Z])[-a-zA-Z0-9_.]{2,20}$/;
  return regExp.test(asValue);
}

// cek kata sandi regex
function is_password(asValue) {
  var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{8,20}$/;
  return regExp.test(asValue);
}

/* login.html */
// kode untuk login
function login() {
  let useremail = $("#email").val();
  let password = $("#password").val();

  // Email
  $("#emailFeedback").removeClass("text-warning");
  if (useremail.length === 0 || useremail === " ") {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Email Anda masih kosong, silahkan isi kembali");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_email(useremail)) {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Format email Anda tidak valid");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#emailFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Email Anda sudah terisi di formulir ini");
    $("#email").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Kata sandi
  if (password.length === 0 || password === " ") {
    $("#passwordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Kata sandi Anda Kosong");
    $("#password").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#passwordFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Kata sandi Anda sudah terisi di formulir ini");
    $("#password").removeClass("is-invalid").addClass("is-valid").focus();
  }

  $.ajax({
    type: "POST",
    url: "/memasukkan-akun",
    data: {
      useremail_give: useremail,
      password_give: password,
    },
    success: function (response) {
      if (response["result"] == "success") {
        $.cookie("psychology", response["token"], {
          path: "/",
        });
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
        });
        Toast.fire({
          icon: "success",
          title: "Berhasil masuk",
        });
        setTimeout(function () {
          window.location.href = "/";
        }, 3000);
      } else {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, email atau kata sandi Anda salah",
        });
      }
    },
  });
}

/* perbarui profil */
// kode untuk perbarui profil
function update_profile() {
  let first_name = $("#first_name").val();
  let last_name = $("#last_name").val();
  let profile_picture = $("#profile_picture")[0].files[0];
  let address = $("#address").val();
  let phone = $("#phone").val();
  let bio = $("#bio").val();
  let form_data = new FormData();
  form_data.append("profile_picture_give", profile_picture);
  form_data.append("first_name_give", first_name);
  form_data.append("last_name_give", last_name);
  form_data.append("address_give", address);
  form_data.append("phone_give", phone);
  form_data.append("bio_give", bio);
  $.ajax({
    type: "POST",
    url: "/perbarui-profil",
    cache: false,
    data: form_data,
    processData: false,
    contentType: false,
    success: function (response) {
      if (response["result"] === "success") {
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
        });
        Toast.fire({
          icon: "success",
          title: "Profil Anda telah diperbarui",
        });
        setTimeout(function () {
          window.location.reload();
        }, 3000);
      }
    },
  });
}

/* updateTotalPrice */
// kode untuk update total harga
function updateTotalPrice() {
  var price = parseFloat("{{ collection.price }}");
  var quantity = parseInt(document.getElementById("quantityInput").value, 10);
  var totalPrice = price * quantity;
  document.getElementById("total").textContent = "Rp " + totalPrice.toFixed(0);
  document.getElementById("quantity").value = quantity; // Simpan nilai quantity
  document.getElementById("total_price").value = totalPrice.toFixed(0); // Simpan nilai total harga
}

/* payment */
// kode untuk pembayaran
function pay() {
  let quantity = $("#content_quantity").val();
  let service_id = $("#order-button").data("id");
  let date = $("#date").val();
  let time = $("#time").val();
  let note_of_buyer = $("#note_of_buyer").val();
  let name_of_buyer = $("#name_of_buyer").val();
  let phone_of_buyer = $("#phone_of_buyer").val();
  let proof_of_payment = $("#proof_of_payment")[0].files[0];

  // Memeriksa apakah semua input telah diisi
  if (
    quantity &&
    service_id &&
    date &&
    time &&
    name_of_buyer &&
    phone_of_buyer &&
    proof_of_payment
  ) {
    let form_data = new FormData();
    form_data.append("quantity", quantity);
    form_data.append("service_id", service_id);
    form_data.append("date", date);
    form_data.append("time", time);
    form_data.append("note_of_buyer", note_of_buyer);
    form_data.append("name_of_buyer", name_of_buyer);
    form_data.append("phone_of_buyer", phone_of_buyer);
    form_data.append("proof_of_payment", proof_of_payment);
    $.ajax({
      type: "POST",
      url: "/pembayaran",
      data: form_data,
      cache: false,
      contentType: false,
      processData: false,
      success: function (response) {
        if (response["result"] === "success") {
          const Toast = Swal.mixin({
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            },
          });
          Toast.fire({
            icon: "success",
            title:
              "Pesanan Anda akan diproses. Silahkan tunggu validasi pesanan oleh Seimbang.or",
          });
          setTimeout(function () {
            window.location.replace("/riwayat-pemesanan");
          }, 5000);
        }
      },
    });
  } else {
    // Jika ada input yang belum diisi, berikan pesan kesalahan kepada pengguna
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: "warning",
      title:
        "Salah satu atau beberapa kotak pengisian masih kosong, mohon untuk melengkapi semua kotak pengisian.",
    });
  }
}

/* send_testimonial */
// kode untuk mengirim testimoni
function send_testimonials(id) {
  let service_review = $("#service_review_" + id).val();

  // Memeriksa apakah semua input telah diisi
  if (
    service_review
  ) {
    $.ajax({
      type: "POST",
      url: "/kirim-testimoni",
      data: {
        id: id,
        service_review: service_review,
      },
      success: function (response) {
        if (response["result"] === "success") {
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
          });
          Toast.fire({
            icon: "success",
            title: "Testimoni berhasil dikirim",
          });
          setTimeout(function () {
            window.location.reload();
          }, 3000);
        }
      },
    });
  } else {
    // Jika ada input yang belum diisi, berikan pesan kesalahan kepada pengguna
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: "warning",
      title:
        "Kotak testimoni masih kosong, mohon untuk melengkapi testimoni.",
    });
  }
}

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

/* register-admin.html */
// kode untuk register admin
function registerAdmin() {
  let first_name = $("#first-name").val();
  let last_name = $("#last-name").val();
  let account_name = $("#account-name").val();
  let useremail = $("#email").val();
  let password = $("#password").val();
  let repeat_password = $("#repeat-password").val();

  // Nama depan
  $("#firstNameFeedback").removeClass("text-warning");
  if (first_name.length === 0 || first_name === " ") {
    $("#firstNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Nama depan Anda masih kosong, silahkan isi kembali");
    $("#first-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#firstNameFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Nama depan Anda sudah terisi di formulir ini");
    $("#first-name").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Nama belakang
  $("#lastNameFeedback").removeClass("text-warning");
  if (last_name.length === 0 || last_name === " ") {
    $("#lastNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Nama belakang Anda masih kosong, silahkan isi kembali");
    $("#last-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#lastNameFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Nama belakang Anda sudah terisi di formulir ini");
    $("#last-name").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Nama akun
  $("#accountNameFeedback").removeClass("text-warning");
  if (account_name.length === 0 || account_name === " ") {
    $("#accountNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Nama akun Anda masih kosong, silahkan isi kembali");
    $("#account-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_account_name(account_name)) {
    $("#accountNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text(
        "Nama akun Anda tidak memenuhi syarat diantaranya 2-10 alfabet, nomor, dan karakter spesial -_."
      );
    $("#account-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#accountNameFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Nama akun Anda sudah terisi di formulir ini");
    $("#account-name").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Email
  $("#emailFeedback").removeClass("text-warning");
  if (useremail.length === 0 || useremail === " ") {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Email Anda masih kosong, silahkan isi kembali");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_email(useremail)) {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Format email Anda tidak valid");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#emailFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Email Anda sudah terisi di formulir ini");
    $("#email").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Kata sandi
  $("#passwordFeedback").removeClass("text-warning");
  if (password.length === 0 || password === " ") {
    $("#passwordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Kata sandi Anda kosong");
    $("#password").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_password(password)) {
    $("#passwordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text(
        "Kata sandi Anda tidak memenuhi syarat diantara 8-20 alfabet, nomor, dan karakter spesial !@#$%^&*"
      );
    $("#password").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#passwordFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Kata sandi Anda sudah terisi di formulir ini");
    $("#password").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Konfirmasi kata sandi
  if (repeat_password.length === 0 || password === " ") {
    $("#repeatPasswordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Konfirmasi kata sandi Anda kosong");
    $("#repeat-password")
      .removeClass("is-valid")
      .addClass("is-invalid")
      .focus();
    return;
  } else if (repeat_password !== password) {
    $("#repeatPasswordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Antara kata sandi atau konfirmasi kata sandi Anda tidak sama");
    $("#repeat-password")
      .removeClass("is-valid")
      .addClass("is-invalid")
      .focus();
    return;
  } else {
    $("#repeatPasswordFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Konfirmasi kata sandi Anda sudah terisi di formulir ini");
    $("#repeat-password")
      .removeClass("is-invalid")
      .addClass("is-valid")
      .focus();
  }

  $.ajax({
    type: "POST",
    url: "/cek-nama-akun-dan-email-admin",
    data: {
      account_name_give: account_name,
      useremail_give: useremail,
    },
    success: function (response) {
      if (response["exists_account_name"] && response["exists_useremail"]) {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, nama akun dan email sudah terpakai",
        });
      } else if (response["exists_account_name"]) {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, nama akun sudah terpakai",
        });
      } else if (response["exists_useremail"]) {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, email sudah terpakai",
        });
      } else {
        $.ajax({
          type: "POST",
          url: "/mendaftarkan-akun-admin",
          data: {
            first_name_give: first_name,
            last_name_give: last_name,
            account_name_give: account_name,
            useremail_give: useremail,
            password_give: password,
          },
          success: function (response) {
            if (response["result"] === "success") {
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
              });
              Toast.fire({
                icon: "success",
                title: "Berhasil mendaftar",
              });
              setTimeout(function () {
                window.location.href = "/masuk/admin";
              }, 3000);
            }
          },
        });
      }
    },
  });
}

/* login-admin.html */
// kode untuk login admin
function loginAdmin() {
  let useremail = $("#email").val();
  let password = $("#password").val();

  // Email
  $("#emailFeedback").removeClass("text-warning");
  if (useremail.length === 0 || useremail === " ") {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Email Anda masih kosong, silahkan isi kembali");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_email(useremail)) {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Format email Anda tidak valid");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#emailFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Email Anda sudah terisi di formulir ini");
    $("#email").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Kata sandi
  if (password.length === 0 || password === " ") {
    $("#passwordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Kata sandi Anda Kosong");
    $("#password").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#passwordFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Kata sandi Anda sudah terisi di formulir ini");
    $("#password").removeClass("is-invalid").addClass("is-valid").focus();
  }

  $.ajax({
    type: "POST",
    url: "/memasukkan-akun-admin",
    data: {
      useremail_give: useremail,
      password_give: password,
    },
    success: function (response) {
      if (response["result"] == "success") {
        $.cookie("psychology", response["token"], {
          path: "/",
        });
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
        });
        Toast.fire({
          icon: "success",
          title: "Berhasil masuk",
        });
        setTimeout(function () {
          window.location.href = "/";
        }, 3000);
      } else {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, email atau kata sandi Anda salah",
        });
      }
    },
  });
}

/* register-superadmin.html */
// kode untuk register superadmin
function registerSuperAdmin() {
  let first_name = $("#first-name").val();
  let last_name = $("#last-name").val();
  let account_name = $("#account-name").val();
  let useremail = $("#email").val();
  let password = $("#password").val();
  let repeat_password = $("#repeat-password").val();

  // Nama depan
  $("#firstNameFeedback").removeClass("text-warning");
  if (first_name.length === 0 || first_name === " ") {
    $("#firstNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Nama depan Anda masih kosong, silahkan isi kembali");
    $("#first-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#firstNameFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Nama depan Anda sudah terisi di formulir ini");
    $("#first-name").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Nama belakang
  $("#lastNameFeedback").removeClass("text-warning");
  if (last_name.length === 0 || last_name === " ") {
    $("#lastNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Nama belakang Anda masih kosong, silahkan isi kembali");
    $("#last-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#lastNameFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Nama belakang Anda sudah terisi di formulir ini");
    $("#last-name").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Nama akun
  $("#accountNameFeedback").removeClass("text-warning");
  if (account_name.length === 0 || account_name === " ") {
    $("#accountNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Nama akun Anda masih kosong, silahkan isi kembali");
    $("#account-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_account_name(account_name)) {
    $("#accountNameFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text(
        "Nama akun Anda tidak memenuhi syarat diantaranya 2-10 alfabet, nomor, dan karakter spesial -_."
      );
    $("#account-name").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#accountNameFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Nama akun Anda sudah terisi di formulir ini");
    $("#account-name").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Email
  $("#emailFeedback").removeClass("text-warning");
  if (useremail.length === 0 || useremail === " ") {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Email Anda masih kosong, silahkan isi kembali");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_email(useremail)) {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Format email Anda tidak valid");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#emailFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Email Anda sudah terisi di formulir ini");
    $("#email").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Kata sandi
  $("#passwordFeedback").removeClass("text-warning");
  if (password.length === 0 || password === " ") {
    $("#passwordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Kata sandi Anda kosong");
    $("#password").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_password(password)) {
    $("#passwordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text(
        "Kata sandi Anda tidak memenuhi syarat diantara 8-20 alfabet, nomor, dan karakter spesial !@#$%^&*"
      );
    $("#password").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#passwordFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Kata sandi Anda sudah terisi di formulir ini");
    $("#password").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Konfirmasi kata sandi
  if (repeat_password.length === 0 || password === " ") {
    $("#repeatPasswordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Konfirmasi kata sandi Anda kosong");
    $("#repeat-password")
      .removeClass("is-valid")
      .addClass("is-invalid")
      .focus();
    return;
  } else if (repeat_password !== password) {
    $("#repeatPasswordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Antara kata sandi atau konfirmasi kata sandi Anda tidak sama");
    $("#repeat-password")
      .removeClass("is-valid")
      .addClass("is-invalid")
      .focus();
    return;
  } else {
    $("#repeatPasswordFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Konfirmasi kata sandi Anda sudah terisi di formulir ini");
    $("#repeat-password")
      .removeClass("is-invalid")
      .addClass("is-valid")
      .focus();
  }

  $.ajax({
    type: "POST",
    url: "/cek-nama-akun-dan-email-superadmin",
    data: {
      account_name_give: account_name,
      useremail_give: useremail,
    },
    success: function (response) {
      if (response["exists_account_name"] && response["exists_useremail"]) {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, nama akun dan email sudah terpakai",
        });
      } else if (response["exists_account_name"]) {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, nama akun sudah terpakai",
        });
      } else if (response["exists_useremail"]) {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, email sudah terpakai",
        });
      } else {
        $.ajax({
          type: "POST",
          url: "/mendaftarkan-akun-superadmin",
          data: {
            first_name_give: first_name,
            last_name_give: last_name,
            account_name_give: account_name,
            useremail_give: useremail,
            password_give: password,
          },
          success: function (response) {
            if (response["result"] === "success") {
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
              });
              Toast.fire({
                icon: "success",
                title: "Berhasil mendaftar",
              });
              setTimeout(function () {
                window.location.href = "/masuk/superadmin";
              }, 3000);
            }
          },
        });
      }
    },
  });
}

/* login-superadmin.html */
// kode untuk login superadmin
function loginSuperAdmin() {
  let useremail = $("#email").val();
  let password = $("#password").val();

  // Email
  $("#emailFeedback").removeClass("text-warning");
  if (useremail.length === 0 || useremail === " ") {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Email Anda masih kosong, silahkan isi kembali");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else if (!is_email(useremail)) {
    $("#emailFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Format email Anda tidak valid");
    $("#email").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#emailFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Email Anda sudah terisi di formulir ini");
    $("#email").removeClass("is-invalid").addClass("is-valid").focus();
  }

  // Kata sandi
  if (password.length === 0 || password === " ") {
    $("#passwordFeedback")
      .removeClass("valid-feedback")
      .addClass("invalid-feedback")
      .text("Kata sandi Anda Kosong");
    $("#password").removeClass("is-valid").addClass("is-invalid").focus();
    return;
  } else {
    $("#passwordFeedback")
      .removeClass("invalid-feedback")
      .addClass("valid-feedback")
      .text("Kata sandi Anda sudah terisi di formulir ini");
    $("#password").removeClass("is-invalid").addClass("is-valid").focus();
  }

  $.ajax({
    type: "POST",
    url: "/memasukkan-akun-superadmin",
    data: {
      useremail_give: useremail,
      password_give: password,
    },
    success: function (response) {
      if (response["result"] == "success") {
        $.cookie("psychology", response["token"], {
          path: "/",
        });
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
        });
        Toast.fire({
          icon: "success",
          title: "Berhasil masuk",
        });
        setTimeout(function () {
          window.location.href = "/";
        }, 3000);
      } else {
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
        });
        Toast.fire({
          icon: "warning",
          title: "Maaf, email atau kata sandi Anda salah",
        });
      }
    },
  });
}
