// Global State
let currentPage = 1;
const itemsPerPage = 5;
let currentFilteredIpos = [];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Theme Management
    initTheme();
    
    // Mobile Navigation
    initMobileMenu();
    
    // Watchlist Management
    initWatchlist();

    // Comparison Tool
    initComparison();
    
    // Mobile menu toggle (if needed)
    // Sticky navbar is handled by CSS (position: sticky)

    // Global Search Logic
    initAutocompleteSearch();

    // Dynamic Content Loading (Home, GMP, Subscription, etc.)
    loadDynamicContent();
});

function initAutocompleteSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('search-suggestions');
    const suggestionsList = document.getElementById('suggestions-list');
    const loadingIndicator = document.getElementById('search-loading');

    if (!searchInput || !suggestionsBox) return;

    let debounceTimer;
    let selectedIndex = -1;
    let currentSuggestions = [];

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        clearTimeout(debounceTimer);
        if (!query) {
            hideSuggestions();
            return;
        }

        // Show loading state
        showLoading();
        
        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
    });

    searchInput.addEventListener('keydown', (e) => {
        const items = suggestionsList.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items);
        } else if (e.key === 'Enter') {
            if (selectedIndex > -1 && items[selectedIndex]) {
                e.preventDefault();
                items[selectedIndex].click();
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchForm.contains(e.target) && !suggestionsBox.contains(e.target)) {
            hideSuggestions();
        }
    });

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            if (query) {
                const match = ipoData.find(ipo => ipo.name.toLowerCase().includes(query));
                if (match) {
                    window.location.href = `details.html?id=${match.id}`;
                } else {
                    alert('No IPO found matching your search.');
                }
            }
        });
    }

    function fetchSuggestions(query) {
        // Simulate API call with dummy data
        setTimeout(() => {
            currentSuggestions = ipoData.filter(ipo => 
                ipo.name.toLowerCase().includes(query)
            ).slice(0, 5); // Limit to 5 suggestions

            renderSuggestions(currentSuggestions, query);
            hideLoading();
        }, 200);
    }

    function renderSuggestions(suggestions, query) {
        if (suggestions.length === 0) {
            hideSuggestions();
            return;
        }

        suggestionsList.innerHTML = suggestions.map((ipo, index) => {
            const regex = new RegExp(`(${query})`, 'gi');
            const highlightedName = ipo.name.replace(regex, '<mark>$1</mark>');
            
            return `
                <div class="suggestion-item" data-id="${ipo.id}" data-index="${index}">
                    <div class="ipo-info">
                        <span class="ipo-name">${highlightedName}</span>
                        <span class="ipo-status">${ipo.status}</span>
                    </div>
                    <i data-lucide="chevron-right" style="width: 14px; color: var(--text-dim);"></i>
                </div>
            `;
        }).join('');

        suggestionsBox.classList.add('visible');
        searchForm.classList.add('has-suggestions');
        selectedIndex = -1;
        lucide.createIcons();

        // Add click events
        suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.getAttribute('data-id');
                hideSuggestions();
                window.location.href = `details.html?id=${id}`;
            });
        });
    }

    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    function showLoading() {
        loadingIndicator.classList.add('visible');
        suggestionsBox.classList.add('visible');
    }

    function hideLoading() {
        loadingIndicator.classList.remove('visible');
    }

    function hideSuggestions() {
        suggestionsBox.classList.remove('visible');
        searchForm.classList.remove('has-suggestions');
        selectedIndex = -1;
    }
}

function loadDynamicContent() {
    const path = window.location.pathname;
    currentPage = 1; // Reset pagination on page change
    
    if (path.endsWith('index.html') || path === '/' || path.endsWith('IPOinsider/')) {
        renderHomePage();
    } else if (path.endsWith('gmp.html')) {
        renderGMPPage();
    } else if (path.endsWith('subscription.html')) {
        renderSubscriptionPage();
    } else if (path.endsWith('allotment.html')) {
        renderAllotmentPage();
    } else if (path.endsWith('details.html')) {
        renderDetailsPage();
    } else if (path.endsWith('retail-tracker.html')) {
        renderRetailTracker();
    }
}

// Shared Utility Functions
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.onclick = (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        };

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.onclick = () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            };
        });
    }
}

function initTheme() {
    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle';
    themeBtn.style.position = 'fixed';
    themeBtn.style.right = '20px';
    themeBtn.style.top = '80px';
    themeBtn.style.zIndex = '1002';
    themeBtn.innerHTML = '<i data-lucide="sun"></i>';
    document.body.appendChild(themeBtn);

    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeBtn.innerHTML = '<i data-lucide="moon"></i>';
    }

    themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeBtn.innerHTML = isLight ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
        lucide.createIcons();
    };
}

function initWatchlist() {
    // Shared Watchlist logic
}

function isWatchlisted(id) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    return watchlist.includes(id);
}

function toggleWatchlist(id, btn) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    if (watchlist.includes(id)) {
        watchlist = watchlist.filter(wid => wid !== id);
        btn.classList.remove('active');
        btn.innerHTML = '<i data-lucide="star" style="width: 16px;"></i> Add to Watchlist';
    } else {
        watchlist.push(id);
        btn.classList.add('active');
        btn.innerHTML = '<i data-lucide="star" style="width: 16px;"></i> In Watchlist';
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    lucide.createIcons();
}

let compareList = [];
function initComparison() {
    const bar = document.createElement('div');
    bar.className = 'compare-bar';
    bar.id = 'compare-bar';
    bar.innerHTML = `
        <span id="compare-text">Select IPOs to compare</span>
        <button class="search-container button" style="padding: 8px 16px; border-radius: 20px;" onclick="showComparison()">Compare Now</button>
        <button class="watchlist-btn" onclick="clearComparison()">Clear</button>
    `;
    document.body.appendChild(bar);
}

function addToCompare(id, name) {
    if (compareList.includes(id)) return;
    if (compareList.length >= 3) {
        alert("Maximum 3 IPOs can be compared.");
        return;
    }
    compareList.push(id);
    updateCompareBar();
}

function updateCompareBar() {
    const bar = document.getElementById('compare-bar');
    const text = document.getElementById('compare-text');
    if (compareList.length > 0) {
        bar.classList.add('visible');
        text.innerText = `${compareList.length} IPOs selected`;
    } else {
        bar.classList.remove('visible');
    }
}

function clearComparison() {
    compareList = [];
    updateCompareBar();
}

function showComparison() {
    const selected = ipoData.filter(i => compareList.includes(i.id));
    const comparisonHtml = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justify-content: center;">
            <div class="container" style="background: var(--bg-card); padding: 2rem; border-radius: 20px; border: 1px solid var(--primary-neon); max-width: 900px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>IPO Comparison Tool</h2>
                    <button class="watchlist-btn" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                ${selected.map(s => `<th>${s.name}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Price Band</td>${selected.map(s => `<td>${s.priceBand}</td>`).join('')}</tr>
                            <tr><td>Issue Size</td>${selected.map(s => `<td>${s.issueSize}</td>`).join('')}</tr>
                            <tr><td>GMP</td>${selected.map(s => `<td>${s.gmp}</td>`).join('')}</tr>
                            <tr><td>Subscription</td>${selected.map(s => `<td>${s.subscription.total}</td>`).join('')}</tr>
                            <tr><td>Rating</td>${selected.map(s => `<td>${s.ratings.fundamental} ★</td>`).join('')}</tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', comparisonHtml);
}

function showIPOAlerts() {
    // Only show alerts once per session
    if (sessionStorage.getItem('alertShown')) return;
    
    const openIpos = ipoData.filter(ipo => ipo.status === 'Open');
    if (openIpos.length > 0) {
        const alertBox = document.createElement('div');
        alertBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--bg-card); border-left: 5px solid var(--primary-neon); padding: 1rem 1.5rem; border-radius: 8px; z-index: 2000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: slideIn 0.5s ease;';
        alertBox.innerHTML = `
            <div style="display: flex; gap: 1rem; align-items: center;">
                <i data-lucide="bell" style="color: var(--primary-neon);"></i>
                <div>
                    <strong style="display: block; font-size: 0.9rem;">New IPO Alert!</strong>
                    <span style="font-size: 0.8rem; color: var(--text-dim);">${openIpos[0].name} is now open for subscription.</span>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-dim); cursor: pointer;"><i data-lucide="x" style="width: 14px;"></i></button>
            </div>
        `;
        document.body.appendChild(alertBox);
        sessionStorage.setItem('alertShown', 'true');
        lucide.createIcons();
    }
}
function updateHomeTable(ipos) {
    const tableBody = document.getElementById('current-ipo-body');
    if (!tableBody) return;
    
    currentFilteredIpos = ipos;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedIpos = ipos.slice(startIndex, startIndex + itemsPerPage);
    
    tableBody.innerHTML = paginatedIpos.map(ipo => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <a href="details.html?id=${ipo.id}">${ipo.name}</a>
                    <button class="watchlist-btn" onclick="addToCompare(${ipo.id}, '${ipo.name}')" title="Add to Compare">
                        <i data-lucide="plus" style="width: 14px;"></i>
                    </button>
                    ${isWatchlisted(ipo.id) ? '<i data-lucide="star" style="width: 12px; fill: var(--warning-neon); color: var(--warning-neon);"></i>' : ''}
                </div>
            </td>
            <td>${ipo.priceBand}</td>
            <td>${ipo.openDate}</td>
            <td>${ipo.closeDate}</td>
            <td>${ipo.issueSize}</td>
            <td>${ipo.gmp}</td>
            <td><span class="status-badge ${getStatusClass(ipo.status)}">${ipo.status}</span></td>
        </tr>
    `).join('');
    
    renderPaginationControls(ipos.length, (page) => {
        currentPage = page;
        updateHomeTable(currentFilteredIpos);
    }, tableBody.parentElement.parentElement.parentElement);
    
    lucide.createIcons();
}

function renderPaginationControls(totalItems, onPageChange, container) {
    let paginationUl = container.querySelector('.pagination');
    if (!paginationUl) {
        paginationUl = document.createElement('ul');
        paginationUl.className = 'pagination';
        container.appendChild(paginationUl);
    }
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let html = '';
    
    if (totalPages <= 1) {
        paginationUl.innerHTML = '';
        return;
    }

    // Prev Button
    html += `<li><a href="#" class="${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}">Prev</a></li>`;
    
    for (let i = 1; i <= totalPages; i++) {
        html += `<li><a href="#" class="${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</a></li>`;
    }
    
    // Next Button
    html += `<li><a href="#" class="${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}">Next</a></li>`;
    
    paginationUl.innerHTML = html;
    
    paginationUl.querySelectorAll('a').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const pageStr = link.getAttribute('data-page');
            if (pageStr) {
                const page = parseInt(pageStr);
                if (page >= 1 && page <= totalPages && page !== currentPage) {
                    onPageChange(page);
                }
            }
        };
    });
}

function filterHomeTable(query, status) {
    currentPage = 1; // Reset to first page when filtering
    let filtered = ipoData.filter(ipo => ipo.status === 'Open' || ipo.status === 'Closed');
    if (query) filtered = filtered.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
    if (status !== 'all') filtered = filtered.filter(i => i.status === status);
    updateHomeTable(filtered);
}

function getStatusClass(status) {
    const s = status.toLowerCase();
    if (s.includes('open')) return 'status-open';
    if (s.includes('upcoming')) return 'status-upcoming';
    if (s.includes('closed')) return 'status-closed';
    if (s.includes('listed')) return 'status-listed';
    return '';
}

// RENDER: Home Page
function renderHomePage() {
    const tableBody = document.getElementById('current-ipo-body');
    if (!tableBody) return;

    // Add Search and Filter UI dynamically if not present
    if (!document.getElementById('table-controls')) {
        const controls = document.createElement('div');
        controls.id = 'table-controls';
        controls.style.cssText = 'display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;';
        controls.innerHTML = `
            <div class="search-container" style="max-width: 300px; margin: 0; padding: 4px;">
                <input type="text" id="table-search" placeholder="Filter by name..." style="padding: 0.5rem;">
            </div>
            <select id="status-filter" class="watchlist-btn" style="padding: 8px 16px; border-radius: 8px;">
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
            </select>
        `;
        tableBody.parentElement.parentElement.insertBefore(controls, tableBody.parentElement);
        
        document.getElementById('table-search').oninput = (e) => filterHomeTable(e.target.value, document.getElementById('status-filter').value);
        document.getElementById('status-filter').onchange = (e) => filterHomeTable(document.getElementById('table-search').value, e.target.value);
    }

    updateHomeTable(ipoData.filter(ipo => ipo.status === 'Open' || ipo.status === 'Closed'));
    
    // Add Alert System
    showIPOAlerts();
    
    // Upcoming IPOs Section
    const upcomingContainer = document.getElementById('upcoming-ipo-list');
    if (upcomingContainer) {
        const upcomingIpos = ipoData.filter(ipo => ipo.status === 'Upcoming');
        upcomingContainer.innerHTML = upcomingIpos.map(ipo => `
            <div class="card">
                <h3><a href="details.html?id=${ipo.id}">${ipo.name}</a></h3>
                <p><strong>Expected Open:</strong> ${ipo.openDate}</p>
                <p><strong>Price Band:</strong> ${ipo.priceBand}</p>
                <p><strong>Issue Size:</strong> ${ipo.issueSize}</p>
            </div>
        `).join('');
    }

    // Recently Listed
    const listedContainer = document.getElementById('recently-listed-list');
    if (listedContainer) {
        const listedIpos = ipoData.filter(ipo => ipo.status === 'Listed');
        listedContainer.innerHTML = listedIpos.map(ipo => `
            <div class="card">
                <h3><a href="details.html?id=${ipo.id}">${ipo.name}</a></h3>
                <p><strong>Listed Date:</strong> ${ipo.listingDate}</p>
                <p><strong>Price:</strong> ${ipo.priceBand}</p>
            </div>
        `).join('');
    }

    // News
    const newsList = document.getElementById('news-list');
    if (newsList) {
        newsList.innerHTML = newsData.map(news => `
            <div class="news-item">
                <span class="news-date">${news.date}</span>
                <h4>${news.title}</h4>
                <p>${news.summary}</p>
            </div>
        `).join('');
    }
}

// RENDER: GMP Page
function renderGMPPage() {
    const tableBody = document.getElementById('gmp-table-body');
    if (!tableBody) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedIpos = ipoData.slice(startIndex, startIndex + itemsPerPage);

    tableBody.innerHTML = paginatedIpos.map(ipo => `
        <tr>
            <td><a href="details.html?id=${ipo.id}">${ipo.name}</a></td>
            <td>${ipo.priceBand}</td>
            <td>${ipo.gmp}</td>
            <td>${calculateEstimatedListing(ipo)}</td>
            <td>${ipo.lastUpdated}</td>
        </tr>
    `).join('');

    renderPaginationControls(ipoData.length, (page) => {
        currentPage = page;
        renderGMPPage();
    }, tableBody.parentElement.parentElement.parentElement);
}

function calculateEstimatedListing(ipo) {
    const priceRange = ipo.priceBand.match(/\d+/g);
    const gmpValue = ipo.gmp.match(/\d+/);
    if (priceRange && gmpValue) {
        const upperPrice = parseInt(priceRange[1]);
        const gmp = parseInt(gmpValue[0]);
        return `₹${upperPrice + gmp}`;
    }
    return 'N/A';
}

// RENDER: Subscription Page
function renderSubscriptionPage() {
    const tableBody = document.getElementById('subscription-table-body');
    if (!tableBody) return;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedIpos = ipoData.slice(startIndex, startIndex + itemsPerPage);

    tableBody.innerHTML = paginatedIpos.map(ipo => `
        <tr>
            <td><a href="details.html?id=${ipo.id}">${ipo.name}</a></td>
            <td>${ipo.subscription.qib}</td>
            <td>${ipo.subscription.nii}</td>
            <td>${ipo.subscription.retail}</td>
            <td>${ipo.subscription.total}</td>
        </tr>
    `).join('');

    renderPaginationControls(ipoData.length, (page) => {
        currentPage = page;
        renderSubscriptionPage();
    }, tableBody.parentElement.parentElement.parentElement);
}

// RENDER: Allotment Page
function renderAllotmentPage() {
    const allotmentForm = document.getElementById('allotment-search-form');
    if (!allotmentForm) return;

    allotmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ipoId = document.getElementById('ipo-select').value;
        const identifier = document.getElementById('allotment-identifier').value.trim();
        const resultDiv = document.getElementById('allotment-result');

        if (!ipoId || !identifier) {
            alert('Please select an IPO and enter your PAN/Application number.');
            return;
        }

        const ipo = ipoData.find(i => i.id == ipoId);
        resultDiv.innerHTML = `
            <div class="info-box" style="margin-top: 1rem;">
                <h4>Status for ${ipo.name}</h4>
                <p><strong>Identifier:</strong> ${identifier}</p>
                <p><strong>Result:</strong> ${ipo.allotmentStatus}</p>
            </div>
        `;
    });

    // Populate IPO Select
    const ipoSelect = document.getElementById('ipo-select');
    ipoSelect.innerHTML = '<option value="">-- Select IPO --</option>' + 
        ipoData.map(ipo => `<option value="${ipo.id}">${ipo.name}</option>`).join('');
}

// RENDER: Details Page
function renderDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const ipo = ipoData.find(i => i.id == id);

    if (!ipo) {
        document.getElementById('ipo-details-container').innerHTML = '<h2>IPO Not Found</h2>';
        return;
    }

    // Add Profit Calculator to Details Page
    const mainSection = document.querySelector('.main-details');
    const calcSection = document.createElement('section');
    calcSection.innerHTML = `
        <h2><i data-lucide="calculator" style="margin-right: 8px;"></i>IPO Profit Calculator</h2>
        <div class="calculator-grid">
            <div class="calc-inputs">
                <div class="calc-input-group">
                    <label>IPO Price (Upper Band)</label>
                    <input type="number" id="calc-price" value="${parseInt(ipo.priceBand.match(/\d+/g)[1])}" readonly>
                </div>
                <div class="calc-input-group">
                    <label>Lot Size (Shares)</label>
                    <input type="number" id="calc-lot" value="${ipo.lotSize}" readonly>
                </div>
                <div class="calc-input-group">
                    <label>Number of Lots</label>
                    <input type="number" id="calc-num-lots" value="1" min="1">
                </div>
                <div class="calc-input-group">
                    <label>Estimated Listing Price</label>
                    <input type="number" id="calc-listing" value="${parseInt(ipo.priceBand.match(/\d+/g)[1]) + parseInt(ipo.gmp.match(/\d+/))}">
                </div>
            </div>
            <div class="calc-result">
                <p>Estimated Profit / Loss</p>
                <div class="profit-value" id="calc-profit-val">₹0</div>
                <p style="font-size: 0.8rem; margin-top: 10px; color: var(--text-dim);">Based on current GMP data</p>
            </div>
        </div>
    `;
    mainSection.insertBefore(calcSection, mainSection.children[1]);

    // Timeline Visualization
    const timelineSection = document.createElement('section');
    timelineSection.innerHTML = `
        <h2><i data-lucide="clock" style="margin-right: 8px;"></i>IPO Timeline</h2>
        <div class="timeline-container">
            ${ipo.timeline.map(t => `
                <div class="timeline-step ${t.status}">
                    <div class="step-dot">${t.status === 'completed' ? '✓' : ''}</div>
                    <div class="step-label">${t.event}</div>
                    <div style="font-size: 0.7rem; color: var(--text-dim);">${t.date}</div>
                </div>
            `).join('')}
        </div>
    `;
    mainSection.insertBefore(timelineSection, mainSection.children[0]);

    // Ratings
    const ratingsBox = document.createElement('div');
    ratingsBox.className = 'info-box';
    ratingsBox.innerHTML = `
        <h4><i data-lucide="star" style="width: 16px; margin-right: 4px;"></i>IPO Rating</h4>
        <div style="margin-bottom: 10px;">
            <label style="font-size: 0.8rem; color: var(--text-dim);">Fundamentals</label>
            <div class="star-rating">${'★'.repeat(Math.floor(ipo.ratings.fundamental))}${'☆'.repeat(5-Math.floor(ipo.ratings.fundamental))}</div>
        </div>
        <div style="margin-bottom: 10px;">
            <label style="font-size: 0.8rem; color: var(--text-dim);">Risk Level</label>
            <div style="color: ${ipo.ratings.risk === 'Low' ? 'var(--success-neon)' : ipo.ratings.risk === 'Medium' ? 'var(--warning-neon)' : 'var(--danger-neon)'}">${ipo.ratings.risk}</div>
        </div>
        <div>
            <label style="font-size: 0.8rem; color: var(--text-dim);">Growth Potential</label>
            <div class="star-rating">${'★'.repeat(Math.floor(ipo.ratings.growth))}${'☆'.repeat(5-Math.floor(ipo.ratings.growth))}</div>
        </div>
    `;
    document.querySelector('.side-details').appendChild(ratingsBox);

    // Watchlist Button in Header
    const headerDiv = document.querySelector('.details-header div');
    const watchlistBtn = document.createElement('button');
    watchlistBtn.className = `watchlist-btn ${isWatchlisted(ipo.id) ? 'active' : ''}`;
    watchlistBtn.innerHTML = `<i data-lucide="star" style="width: 16px;"></i> ${isWatchlisted(ipo.id) ? 'In Watchlist' : 'Add to Watchlist'}`;
    watchlistBtn.onclick = () => toggleWatchlist(ipo.id, watchlistBtn);
    headerDiv.appendChild(watchlistBtn);

    // Update Calculator Logic
    const updateCalc = () => {
        const price = parseInt(document.getElementById('calc-price').value);
        const lot = parseInt(document.getElementById('calc-lot').value);
        const numLots = parseInt(document.getElementById('calc-num-lots').value);
        const listing = parseInt(document.getElementById('calc-listing').value);
        const profit = (listing - price) * lot * numLots;
        const profitEl = document.getElementById('calc-profit-val');
        profitEl.innerText = `₹${profit.toLocaleString()}`;
        profitEl.style.color = profit >= 0 ? 'var(--success-neon)' : 'var(--danger-neon)';
    };

    document.getElementById('calc-num-lots').oninput = updateCalc;
    document.getElementById('calc-listing').oninput = updateCalc;
    updateCalc();

    // Re-init icons for dynamic elements
    lucide.createIcons();

    document.getElementById('ipo-name-title').innerText = ipo.name;
    document.getElementById('ipo-status-badge').innerText = ipo.status;
    document.getElementById('ipo-status-badge').className = `status-badge ${getStatusClass(ipo.status)}`;

    document.getElementById('ipo-overview').innerText = ipo.about;
    document.getElementById('ipo-company-info').innerHTML = `<p>${ipo.about}</p>`;
    
    document.getElementById('ipo-price-band').innerText = ipo.priceBand;
    document.getElementById('ipo-lot-size').innerText = ipo.lotSize;
    document.getElementById('ipo-issue-size').innerText = ipo.issueSize;
    document.getElementById('ipo-gmp').innerText = ipo.gmp;
    
    document.getElementById('ipo-dates').innerHTML = `
        <ul>
            <li><strong>Open Date:</strong> ${ipo.openDate}</li>
            <li><strong>Close Date:</strong> ${ipo.closeDate}</li>
            <li><strong>Listing Date:</strong> ${ipo.listingDate}</li>
        </ul>
    `;

    document.getElementById('ipo-objectives').innerHTML = ipo.objectives.map(obj => `<li>${obj}</li>`).join('');
    document.getElementById('ipo-strengths').innerHTML = ipo.strengths.map(s => `<li>${s}</li>`).join('');
    document.getElementById('ipo-risks').innerHTML = ipo.risks.map(r => `<li>${r}</li>`).join('');

    // Subscription Status
    document.getElementById('ipo-subscription-status').innerHTML = `
        <p><strong>QIB:</strong> ${ipo.subscription.qib}</p>
        <p><strong>NII:</strong> ${ipo.subscription.nii}</p>
        <p><strong>Retail:</strong> ${ipo.subscription.retail}</p>
        <p><strong>Total:</strong> ${ipo.subscription.total}</p>
    `;

    // Render Subscription Chart
    renderSubscriptionChart(ipo.subscription);
}

// RENDER: Retail Tracker
function renderRetailTracker() {
    const cardsContainer = document.getElementById('retail-cards-container');
    const tableBody = document.getElementById('retail-tracker-body');
    const searchInput = document.getElementById('tracker-search');
    const sortSelect = document.getElementById('tracker-sort');
    
    if (!cardsContainer || !tableBody) return;

    let trackerData = ipoData.filter(ipo => ipo.status === 'Open' || ipo.status === 'Closed');
    let filteredTrackerData = [...trackerData];

    const updateTrackerUI = () => {
        // Clear containers
        cardsContainer.innerHTML = '';
        tableBody.innerHTML = '';

        // Sorting
        const sortBy = sortSelect.value;
        filteredTrackerData.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'multiplier-desc') return b.retailQuota.multiplier - a.retailQuota.multiplier;
            if (sortBy === 'multiplier-asc') return a.retailQuota.multiplier - b.retailQuota.multiplier;
            if (sortBy === 'probability') {
                const probA = parseFloat(a.retailQuota.probability);
                const probB = parseFloat(b.retailQuota.probability);
                return probB - probA;
            }
            return 0;
        });

        // Top 3 Cards (Featured/High Subscription)
        const top3 = [...filteredTrackerData].sort((a, b) => b.retailQuota.multiplier - a.retailQuota.multiplier).slice(0, 3);
        cardsContainer.innerHTML = top3.map(ipo => `
            <div class="retail-card">
                <div class="card-header">
                    <div>
                        <h3>${ipo.name}</h3>
                        <span class="label">${ipo.status}</span>
                    </div>
                    <i data-lucide="trending-up" style="color: var(--primary-neon);"></i>
                </div>
                <div class="multiplier">${ipo.retailQuota.multiplier}x</div>
                <div class="label">Retail Subscription</div>
                <div class="progress-container">
                    <div class="progress-bar ${getProgressClass(ipo.retailQuota.multiplier)}" style="width: ${Math.min(ipo.retailQuota.multiplier * 10, 100)}%"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <span style="color: var(--text-dim);">Probability:</span>
                    <span style="color: var(--white); font-weight: 700;">${ipo.retailQuota.probability}</span>
                </div>
            </div>
        `).join('');

        // Table with Pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = filteredTrackerData.slice(startIndex, startIndex + itemsPerPage);

        tableBody.innerHTML = paginatedData.map(ipo => `
            <tr>
                <td><a href="details.html?id=${ipo.id}">${ipo.name}</a></td>
                <td>${ipo.retailQuota.sharesReserved.toLocaleString()}</td>
                <td>${ipo.retailQuota.sharesApplied.toLocaleString()}</td>
                <td><strong style="color: var(--primary-neon);">${ipo.retailQuota.multiplier}x</strong></td>
                <td><span class="status-badge ${getProbBadgeClass(ipo.retailQuota.multiplier)}">${ipo.retailQuota.probability}</span></td>
                <td>
                    <div class="progress-container" style="width: 100px; margin: 0;">
                        <div class="progress-bar ${getProgressClass(ipo.retailQuota.multiplier)}" style="width: ${Math.min(ipo.retailQuota.multiplier * 10, 100)}%"></div>
                    </div>
                </td>
                <td><a href="details.html?id=${ipo.id}" class="watchlist-btn" style="padding: 4px 10px;">Details</a></td>
            </tr>
        `).join('');

        renderPaginationControls(filteredTrackerData.length, (page) => {
            currentPage = page;
            updateTrackerUI();
        }, document.getElementById('retail-tracker-table'));

        lucide.createIcons();
    };

    // Event Listeners
    searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase();
        filteredTrackerData = trackerData.filter(ipo => ipo.name.toLowerCase().includes(query));
        currentPage = 1;
        updateTrackerUI();
    };

    sortSelect.onchange = () => {
        currentPage = 1;
        updateTrackerUI();
    };

    // Live Update Simulation
    let timeLeft = 30;
    const timerSpan = document.getElementById('update-timer');
    
    const startSimulation = () => {
        setInterval(() => {
            timeLeft--;
            if (timeLeft < 0) {
                timeLeft = 30;
                // Randomly update one 'Open' IPO
                const openIpos = trackerData.filter(ipo => ipo.status === 'Open');
                if (openIpos.length > 0) {
                    const randomIpo = openIpos[Math.floor(Math.random() * openIpos.length)];
                    const increase = Math.floor(Math.random() * 50000) + 10000;
                    randomIpo.retailQuota.sharesApplied += increase;
                    randomIpo.retailQuota.multiplier = parseFloat((randomIpo.retailQuota.sharesApplied / randomIpo.retailQuota.sharesReserved).toFixed(2));
                    // Update probability logic (simple inverse)
                    if (randomIpo.retailQuota.multiplier > 1) {
                        randomIpo.retailQuota.probability = (100 / randomIpo.retailQuota.multiplier).toFixed(1) + '%';
                    } else {
                        randomIpo.retailQuota.probability = '100%';
                    }
                    updateTrackerUI();
                }
            }
            if (timerSpan) timerSpan.innerText = timeLeft;
        }, 1000);
    };

    updateTrackerUI();
    startSimulation();
}

function getProgressClass(multiplier) {
    if (multiplier < 1) return 'progress-low';
    if (multiplier < 5) return 'progress-medium';
    return 'progress-high';
}

function getProbBadgeClass(multiplier) {
    if (multiplier < 1) return 'status-open';
    if (multiplier < 5) return 'status-upcoming';
    return 'status-closed';
}

function renderSubscriptionChart(subscription) {
    const ctx = document.getElementById('subscriptionChart').getContext('2d');
    if (!ctx) return;

    // Parse values like "1.2x" to 1.2
    const labels = ['QIB', 'NII', 'Retail'];
    const data = [
        parseFloat(subscription.qib),
        parseFloat(subscription.nii),
        parseFloat(subscription.retail)
    ];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                    label: 'Subscription (x)',
                    data: data,
                    backgroundColor: [
                        'rgba(0, 242, 255, 0.4)',
                        'rgba(112, 0, 255, 0.4)',
                        'rgba(0, 255, 136, 0.4)'
                    ],
                    borderColor: [
                        '#00f2ff',
                        '#7000ff',
                        '#00ff88'
                    ],
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        },
                        title: {
                            display: true,
                            text: 'Times Subscribed',
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
    });
}
