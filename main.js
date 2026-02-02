// Kunci untuk LocalStorage
const STORAGE_KEY = "BOOKSHELF_APP_DATA";
let books = [];
let editingBookId = null; // Penanda jika sedang dalam mode edit

// Memuat data dari LocalStorage saat halaman pertama kali dimuat
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromStorage();

  const bookForm = document.getElementById("bookForm");
  bookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (editingBookId) {
      updateBook(editingBookId);
    } else {
      addBook();
    }
  });

  const searchBookForm = document.getElementById("searchBook");
  searchBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchTitle = document.getElementById("searchBookTitle").value;
    renderBooks(searchTitle);
  });
});

// Kriteria Wajib 1: Gunakan localStorage sebagai Penyimpanan
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    books = data;
  }
  renderBooks();
}

function saveData() {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
  renderBooks();
}

// Kriteria Wajib 2: Mampu Menambahkan Buku
function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  // Tahun harus bertipe number
  const year = Number(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  // ID unik menggunakan timestamp
  const id = new Date().getTime();

  const newBook = { id, title, author, year, isComplete };
  books.push(newBook);

  document.getElementById("bookForm").reset();
  saveData();
}

// Kriteria Wajib 3: Memiliki Dua Rak Buku & Kriteria Wajib 4: Dapat Memindahkan Buku
function renderBooks(filterTitle = "") {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  // Bersihkan rak sebelum render ulang
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  // Kriteria Opsional 1: Filter pencarian buku
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(filterTitle.toLowerCase()),
  );

  for (const book of filteredBooks) {
    const bookElement = createBookElement(book);

    // Pisahkan buku berdasarkan isComplete
    if (book.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }
}

// Membuat Elemen HTML Buku sesuai dengan template dan atribut wajib// Memastikan elemen penulis menggunakan data-testid="bookItemAuthor"
function createBookElement(book) {
  const container = document.createElement("div");
  container.setAttribute("data-bookid", book.id);
  container.setAttribute("data-testid", "bookItem");

  const titleElement = document.createElement("h3");
  titleElement.setAttribute("data-testid", "bookItemTitle");
  titleElement.innerText = book.title;

  // PERBAIKAN DI SINI:
  const authorElement = document.createElement("p");
  authorElement.setAttribute("data-testid", "bookItemAuthor"); // Memastikan data-testid sesuai ketentuan
  authorElement.innerText = `Penulis: ${book.author}`;

  const yearElement = document.createElement("p");
  yearElement.setAttribute("data-testid", "bookItemYear"); // Memastikan tahun juga memiliki testid yang benar
  yearElement.innerText = `Tahun: ${book.year}`;

  const buttonContainer = document.createElement("div");

  const isCompleteButton = document.createElement("button");
  isCompleteButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  isCompleteButton.innerText = book.isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";
  isCompleteButton.addEventListener("click", () => {
    toggleBookStatus(book.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.innerText = "Hapus Buku";
  deleteButton.addEventListener("click", () => {
    deleteBook(book.id);
  });

  const editButton = document.createElement("button");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.innerText = "Edit Buku";
  editButton.addEventListener("click", () => {
    startEditBook(book.id);
  });

  buttonContainer.append(isCompleteButton, deleteButton, editButton);
  container.append(titleElement, authorElement, yearElement, buttonContainer);

  return container;
}

// Kriteria Wajib 4: Memindahkan buku antar rak
function toggleBookStatus(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);
  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !books[bookIndex].isComplete;
    saveData();
  }
}

// Kriteria Wajib 5: Menghapus data buku
function deleteBook(bookId) {
  const confirmation = confirm("Apakah Anda yakin ingin menghapus buku ini?");
  if (confirmation) {
    books = books.filter((book) => book.id !== bookId);
    saveData();
  }
}

// Kriteria Opsional 2: Menambahkan Fitur Edit Buku
function startEditBook(bookId) {
  const book = books.find((b) => b.id === bookId);
  if (!book) return;

  // Masukkan data buku ke dalam form
  document.getElementById("bookFormTitle").value = book.title;
  document.getElementById("bookFormAuthor").value = book.author;
  document.getElementById("bookFormYear").value = book.year;
  document.getElementById("bookFormIsComplete").checked = book.isComplete;

  // Ubah teks tombol submit saat edit
  const submitButton = document.getElementById("bookFormSubmit");
  submitButton.innerText = "Simpan Perubahan Buku";

  editingBookId = book.id; // Tandai bahwa sedang dalam mode edit
}

function updateBook(bookId) {
  const bookIndex = books.findIndex((book) => book.id === bookId);
  if (bookIndex !== -1) {
    books[bookIndex].title = document.getElementById("bookFormTitle").value;
    books[bookIndex].author = document.getElementById("bookFormAuthor").value;
    books[bookIndex].year = Number(
      document.getElementById("bookFormYear").value,
    );
    books[bookIndex].isComplete =
      document.getElementById("bookFormIsComplete").checked;

    saveData();
  }

  // Kembalikan form ke mode tambah buku
  document.getElementById("bookForm").reset();
  const submitButton = document.getElementById("bookFormSubmit");
  submitButton.innerHTML =
    "Masukkan Buku ke rak <span>Belum selesai dibaca</span>";
  editingBookId = null;
}
