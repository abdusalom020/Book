// GLOBAL VARS
const genres = [];
const watchlist =  [];

// PAGINATION
let TOTAL_RESULTS = 10;
let PER_PAGE_COUNT = 8;
let PAGE_LINKS_TO_SHOW = 5;
let NEIGHBOUR_PAGES_COUNT = Math.floor(PAGE_LINKS_TO_SHOW / 2);
let CURRENT_PAGE = 1;
let PAGES_COUNT = Math.ceil(TOTAL_RESULTS / PER_PAGE_COUNT);
let foundBooks = books;


// SEARCH FORM
const elBooksSearchForm = document.querySelector('.js-books-search-form');
const elBookSearchInput = elBooksSearchForm.querySelector('.js-book-search-input');
const elPagesInput = elBooksSearchForm.querySelector('.js-pages-input');
const elMinYearInput = elBooksSearchForm.querySelector('.js-start-year-input');
const elSortSelect = elBooksSearchForm.querySelector('.js-sort-select');

// RESULT
const elBooksList = document.querySelector('.books__list');
const elPagination = document.querySelector('.js-pagination');
const elPaginationStartLink = elPagination.querySelector('.js-pagination-start');
const elPaginationPrevLink = elPagination.querySelector('.js-pagination-prev');
const elPaginationNextLink = elPagination.querySelector('.js-pagination-next');
const elPaginationEndLink = elPagination.querySelector('.js-pagination-end');
const elPaginationList = elPagination.querySelector('.js-pagination-list');

// TEMPLATE
const elBookItemTeplete = document.querySelector('#book-item-template').content;
const elBookmarksTemplate = document.querySelector("#bookmarks-template").content;
const elPaginationItemTemplate = document.querySelector('#pagination-item-template').content;

// Watchlist
const elWatchlistModal = document.querySelector('.watchlist-modal');
const elWatchlistGroup = elWatchlistModal.querySelector('.watchlist-modal__list');
const watchlistFragment = document.createDocumentFragment();

function showBooks (books, titleRegex = '') {
  elBooksList.innerHTML = '';
  const elBooksNewFragment = document.createDocumentFragment();

  for (let book of books) {
    const elNewBookItem = elBookItemTeplete.cloneNode(true);
    elNewBookItem.querySelector('.book__img').src = book.imageLink;
    elNewBookItem.querySelector('.book__title').textContent = book.title;
    elNewBookItem.querySelector('.book__rating').textContent = book.author;
    elNewBookItem.querySelector('.book__year').textContent = book.year;
    elNewBookItem.querySelector('.book__duration').textContent = book.pages;
    elNewBookItem.querySelector('.books__language').textContent = book.language;
    elNewBookItem.querySelector('.js-more-info-button').href = book.link;
    elNewBookItem.querySelector('.js-bookmark-button').dataset.title = book.title;

    elBooksNewFragment.appendChild(elNewBookItem);
  }

  elBooksList.appendChild(elBooksNewFragment);
}


function findBooks (titleRegex) {
  let res =  books.filter(book => {
    const Criteria = (book.title.match(titleRegex) || (elBookSearchInput.value === '')) && (elMinYearInput.value.trim() === '' || book.year >= Number(elMinYearInput.value)) && (elPagesInput.value.trim() === '' || book.pages >= Number(elPagesInput.value));
    return Criteria;
  });
  return res;
}

function sortBooks(books, sortType) {
  if (sortType === 'az') {
    books.sort((a, b) => {
      if (a.title > b.title) return 1;
      if (a.title < b.title) return -1;
      return 0;
    });
  } else if (sortType === 'za') {
    books.sort((a, b) => {
      if (a.title < b.title) return 1;
      if (a.title > b.title) return -1;
      return 0;
    });
  } else if (sortType === 'rating_asc') {
    books.sort((a, b) => a.pages - b.pages);
  } else if (sortType === 'rating_desc') {
    books.sort((a, b) => b.pages - a.pages);
  } else if (sortType === 'year_asc') {
    books.sort((a, b) => a.year - b.year);
  } else if (sortType === 'year_desc') {
    books.sort((a, b) => b.year - a.year);
  }
}

function showPagination() {
  let startIndex = (CURRENT_PAGE - 1) * PER_PAGE_COUNT;
  let endIndex = startIndex + PER_PAGE_COUNT;
  showBooks(foundBooks.slice(startIndex, endIndex));

  let startPage = CURRENT_PAGE - NEIGHBOUR_PAGES_COUNT;
  let endPage = CURRENT_PAGE + NEIGHBOUR_PAGES_COUNT;

  PAGES_COUNT = Math.ceil(foundBooks.length / PER_PAGE_COUNT);

  if (endPage > PAGES_COUNT) {
    startPage -= Math.abs(PAGES_COUNT - endPage);
  }

  elPaginationList.innerHTML = '';
  const elPageLinksFragment = document.createDocumentFragment();

  for (let pageIndex = startPage; pageIndex <= endPage; pageIndex++) {
    if (pageIndex < 1) {
      endPage++;
      continue;
    }

    if (pageIndex > PAGES_COUNT) {
      break;
    }

    const elPaginationItem = elPaginationItemTemplate.cloneNode(true);
    elPaginationItem.querySelector('.page-link').textContent = pageIndex;

    if (pageIndex === CURRENT_PAGE) {
      elPaginationItem.querySelector('li').classList.add('active');
    }

    elPageLinksFragment.appendChild(elPaginationItem);
  }

  elPaginationList.appendChild(elPageLinksFragment);
  updatePaginationControlsState();
}

function updatePaginationControlsState () {
  if (CURRENT_PAGE === 1) {
    elPaginationPrevLink.parentElement.classList.add('disabled');
    elPaginationStartLink.parentElement.classList.add('disabled');
  } else {
    elPaginationPrevLink.parentElement.classList.remove('disabled');
    elPaginationStartLink.parentElement.classList.remove('disabled');
  }

  if (CURRENT_PAGE === PAGES_COUNT) {
    elPaginationNextLink.parentElement.classList.add('disabled');
    elPaginationEndLink.parentElement.classList.add('disabled');
  } else {
    elPaginationNextLink.parentElement.classList.remove('disabled');
    elPaginationEndLink.parentElement.classList.remove('disabled');
  }
}

function goToPage (pageIndex) {
  if (pageIndex > PAGES_COUNT) {
    pageIndex = PAGES_COUNT;
  }

  if (pageIndex < 1) {
    pageIndex = 1;
  }

  CURRENT_PAGE = pageIndex;

  showPagination();
}

function goToPrevPage () {
  goToPage(CURRENT_PAGE - 1);
}

function goToNextPage () {
  goToPage(CURRENT_PAGE + 1);
}

function goToFirstPage () {
  goToPage(1);
}

function goToLastPage () {
  goToPage(PAGES_COUNT);
}

function onMovieSearchFormSubmit (evt) {
  evt.preventDefault();

  const titleRegex = new RegExp(elBookSearchInput.value.trim(), 'gi');
  foundBooks = findBooks(titleRegex);
  if (foundBooks.length > 0) {
    sortBooks(foundBooks, elSortSelect.value);

    TOTAL_RESULTS = foundBooks.length;
    CURRENT_PAGE = 1;
    PAGES_COUNT = Math.ceil(TOTAL_RESULTS / PER_PAGE_COUNT);

    let bookToShow = foundBooks.slice(0, PER_PAGE_COUNT);

    showBooks(bookToShow, titleRegex);
    showPagination();
  } else {
    elBooksList.innerHTML = '<div class="col-12">No film found</div>';
  }
}

function onBooksListInfoButtonClick(evt) {
  if (evt.target.matches('.js-bookmark-button')) {
    const elBookmarkButton = evt.target;
    if (elBookmarkButton.matches('.btn-primary')) {
      elBookmarkButton.textContent = 'Bookmark';
      elBookmarkButton.classList.remove('btn-primary');
      elBookmarkButton.classList.add('btn-outline-primary');
      
      let bookmarkIndex = watchlist.findIndex(book => book.title === elBookmarkButton.dataset.title);
      watchlist.splice(bookmarkIndex, 1);
      console.log(watchlist);
    }
    else {
      elBookmarkButton.textContent = 'Bookmarked ✅';
      elBookmarkButton.classList.remove('btn-outline-primary');
      elBookmarkButton.classList.add('btn-primary');

      let newBookmark = books.find(book => book.title === elBookmarkButton.dataset.title);
      watchlist.push(newBookmark);
      console.log(watchlist);
    }

    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }
}

function showWatchlist() {
  elWatchlistGroup.innerHTML = '';
  let elBookmarksFragment = document.createDocumentFragment();
  for (const bookmark of watchlist) {
    const elNewBookmarksItem = elBookmarksTemplate.cloneNode(true);

    elNewBookmarksItem.querySelector(".js-watchlist-link").textContent = bookmark.title;
    elNewBookmarksItem.querySelector(".js-watchlist-link").href = bookmark.link;
    elNewBookmarksItem.querySelector(".js-watchlist-year").textContent = bookmark.year;
    elNewBookmarksItem.querySelector(".js-watchlist-close").dataset.imdbId = bookmark.title;

    elBookmarksFragment.appendChild(elNewBookmarksItem);
  }
  elWatchlistGroup.appendChild(elBookmarksFragment);
}

elWatchlistModal.addEventListener('show.bs.modal', showWatchlist);

elWatchlistModal.addEventListener('click', (e) => {
  if (e.target.matches('.js-watchlist-close')) {
    const bookmarkIndex = watchlist.findIndex(bookmark => bookmark.title === e.target.dataset.title);
    const removedBookmark = watchlist.splice(bookmarkIndex, 1);

    // const elBookmark = elMoviesList.querySelector(`.js-watchlist-close[data-page="${removedBookmark.title}"]`);
    // elBookmark.textContent = 'Bookmark';
    // elBookmark.classList.remove('btn-primary');
    // elBookmark.classList.add('btn-outline-primary');
    // watchlist.splice(elBookmark, 1);
    
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    showWatchlist();
  }
});

if (elBooksList) {
  elBooksList.addEventListener('click', onBooksListInfoButtonClick);
}

if (elBooksSearchForm) {
  elBooksSearchForm.addEventListener('submit', onMovieSearchFormSubmit);
}

if (elPaginationStartLink) {
  elPaginationStartLink.addEventListener('click', goToFirstPage);
}

if (elPaginationPrevLink) {
  elPaginationPrevLink.addEventListener('click', goToPrevPage);
}

if (elPaginationNextLink) {
  elPaginationNextLink.addEventListener('click', goToNextPage);
}

if (elPaginationEndLink) {
  elPaginationEndLink.addEventListener('click', goToLastPage);
}

if (elPaginationList) {
  elPaginationList.addEventListener('click', evt => {
    if (evt.target.matches('.page-link')) {
      goToPage(Number(evt.target.textContent));
    }
  });
}

showBooks(foundBooks, '');
showPagination();