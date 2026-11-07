
const navItems = document.querySelectorAll('.nav-link[data-section]');
const appSections = document.querySelectorAll('.app-section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault(); 

        const targetSectionId = item.getAttribute('data-section');

        appSections.forEach(section => {
            section.classList.toggle('hidden', section.id !== targetSectionId);
        });

        // تحديث شكل اللينك النشط
        navItems.forEach(link => {
            link.classList.remove('bg-blue-500/10', 'text-blue-400');
            link.classList.add('text-slate-300');
        });
        item.classList.add('bg-blue-500/10', 'text-blue-400');
        item.classList.remove('text-slate-300');
    });
});



// NASA APOD API
const NASA_API_URL = 'https://science.nasa.gov/wp-json/wp/v2/apod-basic/';
async function loadNASAImage(selectedDate = '') {
    try {
        const API_URL = selectedDate
            ? `${NASA_API_URL}?date=${selectedDate}`
            : NASA_API_URL;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const result = await response.json();
        // Get API Data
        const apodData = Array.isArray(result) ? result[0] : result;
        if (!apodData) {
            throw new Error('No NASA data found');
        }

        // Get HTML Elements
        const imgElement = document.getElementById('apod-image');
        const titleElement = document.getElementById('apod-title');
        const explanationElement = document.getElementById('apod-explanation');
        const dateDetailElement = document.getElementById('apod-date-detail');
        const dateInfoElement = document.getElementById('apod-date-info');
        const copyrightElement = document.getElementById('apod-copyright');

        // Display Image
        if (imgElement) {
            if (apodData.media_type === 'image' && apodData.hdurl) {
                imgElement.src = apodData.hdurl;
                imgElement.alt = apodData.alt || apodData.title;

                imgElement.onerror = function () {
                    console.error('Failed to load NASA image');
                    this.alt = 'Image could not be loaded';
                };
            } else {
                imgElement.src = '';
                imgElement.alt = 'No image available';
            }
        }
        // Display Title
        if (titleElement) {
            titleElement.textContent = apodData.title || 'No Title';
        }
        // Display Explanation
        if (explanationElement) {
            explanationElement.innerHTML = DOMPurify.sanitize(
                apodData.explanation || 'No explanation available.'
            );
        }
        // Display Date
        if (dateDetailElement) {
            dateDetailElement.innerHTML =
                `<i class="far fa-calendar mr-2"></i>${apodData.date || ''}`;
        }
        if (dateInfoElement) {
            dateInfoElement.textContent = apodData.date || '';
        }
        // Display Copyright
        if (copyrightElement) {
            const credit = apodData.copyright || apodData.credit || 'NASA';
            const tempElement = document.createElement('div');
            tempElement.innerHTML = credit;
            copyrightElement.textContent = `© ${tempElement.textContent.trim()}`;
        }

        console.log('NASA APOD Data:', apodData);

    } catch (error) {
        console.error('NASA API Error:', error);

        const titleElement = document.getElementById('apod-title');
        const explanationElement = document.getElementById('apod-explanation');

        if (titleElement) {
            titleElement.textContent = 'Loading Error';
        }

        if (explanationElement) {
            explanationElement.textContent =
                'Unable to fetch NASA data. Please try again later.';
        }
    }
}
// Load Today's Image
loadNASAImage();



// Launches API URL

const LAUNCHES_API_URL = 'https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=10';

async function loadLaunchesData() {
    try {
        const response = await fetch(LAUNCHES_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        const launches = data.results || [];

        if (launches.length === 0) {
            console.log('No upcoming launches available.');
            return;
        }

        // Featured Launch
        renderFeaturedLaunch(launches[0]);

        // Launches Grid
        renderLaunchesGrid(launches.slice(1, 4));

    } catch (error) {
        console.error('Launches API Error:', error);
    }
}


// Format Date
function formatLaunchDate(date) {
    if (!date) return 'Date TBD';

    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
    });
}
// Format Time
function formatLaunchTime(date) {
    if (!date) return 'Time TBD';

    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short'
    });
}
// Get Launch Image
function getLaunchImage(launch) {
    return launch.image?.image_url ||
        launch.image?.thumbnail_url ||
        launch.rocket?.configuration?.image?.image_url ||
        '';
}
// Get Launch Location
function getLaunchLocation(launch) {
    return launch.pad?.location?.name || 'Unknown Location';
}
// Get Launch Country
function getLaunchCountry(launch) {
    return launch.pad?.location?.country?.name || 'Unknown Country';
}
// Render Featured Launch
function renderFeaturedLaunch(launch) {
    const container = document.getElementById('featured-launch');

    if (!container) return;

    const name = launch.name || 'Unknown Mission';

    const agency =
        launch.launch_service_provider?.name || 'Unknown Agency';

    const rocket =
        launch.rocket?.configuration?.name || 'Unknown Rocket';

    const dateStr = formatLaunchDate(launch.net);
    const timeStr = formatLaunchTime(launch.net);

    const location = getLaunchLocation(launch);
    const country = getLaunchCountry(launch);

    const description =
        launch.mission?.description ||
        'No details available for this mission.';

    const statusName = launch.status?.name || 'TBD';

    const image = getLaunchImage(launch);

    container.innerHTML = `
        <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">

            <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">

                <div class="flex flex-col justify-between">

                    <div>

                        <div class="flex items-center gap-3 mb-4">

                            <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                                <i class="fas fa-star"></i>
                                Featured Launch
                            </span>

                            <span class="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                                ${statusName}
                            </span>

                        </div>

                        <h3 class="text-3xl font-bold mb-3 leading-tight">
                            ${name}
                        </h3>

                        <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">

                            <div class="flex items-center gap-2">
                                <i class="fas fa-building"></i>
                                <span>${agency}</span>
                            </div>

                            <div class="flex items-center gap-2">
                                <i class="fas fa-rocket"></i>
                                <span>${rocket}</span>
                            </div>

                        </div>

                        <div class="grid xl:grid-cols-2 gap-4 mb-6">

                            <div class="bg-slate-900/50 rounded-xl p-4">

                                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                                    <i class="fas fa-calendar"></i>
                                    Launch Date
                                </p>

                                <p class="font-semibold">${dateStr}</p>

                            </div>

                            <div class="bg-slate-900/50 rounded-xl p-4">

                                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                                    <i class="fas fa-clock"></i>
                                    Launch Time
                                </p>

                                <p class="font-semibold">${timeStr}</p>

                            </div>

                            <div class="bg-slate-900/50 rounded-xl p-4">

                                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                                    <i class="fas fa-map-marker-alt"></i>
                                    Location
                                </p>

                                <p class="font-semibold text-sm">${location}</p>

                            </div>

                            <div class="bg-slate-900/50 rounded-xl p-4">

                                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                                    <i class="fas fa-globe"></i>
                                    Country
                                </p>

                                <p class="font-semibold">${country}</p>

                            </div>

                        </div>

                        <p class="text-slate-300 leading-relaxed mb-6">
                            ${description}
                        </p>

                    </div>

                </div>

                <div class="relative">

                    <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">

                        ${image
            ? `
                                    <img
                                        src="${image}"
                                        alt="${name}"
                                        class="w-full h-full object-cover"
                                        onerror="this.style.display='none'"
                                    >
                                `
            : `
                                    <div class="flex items-center justify-center h-full min-h-[400px] bg-slate-800">
                                        <i class="fas fa-rocket text-9xl text-slate-700/50"></i>
                                    </div>
                                `
        }

                    </div>

                </div>

            </div>

        </div>
    `;
}


function renderLaunchesGrid(launches) {
    const gridContainer = document.getElementById('launches-grid');

    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    launches.forEach(launch => {

        const name = launch.name || 'Unknown Mission';

        const agency =
            launch.launch_service_provider?.name || 'Unknown Agency';

        const rocket =
            launch.rocket?.configuration?.name || 'Unknown Rocket';

        const dateStr = formatLaunchDate(launch.net);
        const timeStr = formatLaunchTime(launch.net);

        const location = getLaunchLocation(launch);

        const statusName = launch.status?.name || 'TBD';

        const image = getLaunchImage(launch);

        const card = document.createElement('div');

        card.className =
            'bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer';

        card.innerHTML = `

            <div class="relative h-48 bg-slate-900/50 overflow-hidden flex items-center justify-center">

                ${image
                ? `
                            <img
                                src="${image}"
                                alt="${name}"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onerror="this.style.display='none'"
                            >
                        `
                : `
                            <i class="fas fa-space-shuttle text-5xl text-slate-700"></i>
                        `
            }

                <div class="absolute top-3 right-3">

                    <span class="px-3 py-1 bg-blue-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold">
                        ${statusName}
                    </span>

                </div>

            </div>

            <div class="p-5">

                <div class="mb-3">

                    <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                        ${name}
                    </h4>

                    <p class="text-sm text-slate-400 flex items-center gap-2">

                        <i class="fas fa-building text-xs"></i>

                        ${agency}

                    </p>

                </div>

                <div class="space-y-2 mb-4">

                    <div class="flex items-center gap-2 text-sm">

                        <i class="fas fa-calendar text-slate-500 w-4"></i>

                        <span class="text-slate-300">${dateStr}</span>

                    </div>

                    <div class="flex items-center gap-2 text-sm">

                        <i class="fas fa-clock text-slate-500 w-4"></i>

                        <span class="text-slate-300">${timeStr}</span>

                    </div>

                    <div class="flex items-center gap-2 text-sm">

                        <i class="fas fa-rocket text-slate-500 w-4"></i>

                        <span class="text-slate-300">${rocket}</span>

                    </div>

                    <div class="flex items-center gap-2 text-sm">

                        <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>

                        <span class="text-slate-300 line-clamp-1">${location}</span>
                    </div>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}


// Load Launches
loadLaunchesData();
// Planets API 
const PLANETS_API_URL = 'https://solar-system-opendata-proxy.vercel.app/api/planets';

const AU_KM = 149597870.7;
const EARTH_MASS_KG = 5.972e24;

const PLANET_ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

const PLANET_META = {
    mercury: { name: 'Mercury', color: '#eab308', type: 'Terrestrial', badge: 'bg-orange-500/50 text-orange-200',
        description: 'Mercury is the smallest planet in the Solar System and the closest to the Sun. It has almost no atmosphere, so temperatures swing from scorching days to freezing nights.' },
    venus:   { name: 'Venus', color: '#f97316', type: 'Terrestrial', badge: 'bg-orange-500/50 text-orange-200',
        description: 'Venus is similar to Earth in size, but its thick carbon-dioxide atmosphere traps heat, making it the hottest planet. It also rotates backwards compared to most planets.' },
    earth:   { name: 'Earth', color: '#3b82f6', type: 'Terrestrial', badge: 'bg-blue-500/50 text-blue-200',
        description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 71% of its surface is covered with water.' },
    mars:    { name: 'Mars', color: '#ef4444', type: 'Terrestrial', badge: 'bg-red-500/50 text-red-200',
        description: 'Mars is a cold desert world with the tallest volcano and the deepest canyon in the Solar System. Evidence shows it once had liquid water on its surface.' },
    jupiter: { name: 'Jupiter', color: '#fb923c', type: 'Gas Giant', badge: 'bg-purple-500/50 text-purple-200',
        description: 'Jupiter is the largest planet, more than twice as massive as all the other planets combined. Its Great Red Spot is a storm that has raged for centuries.' },
    saturn:  { name: 'Saturn', color: '#facc15', type: 'Gas Giant', badge: 'bg-yellow-500/50 text-yellow-200',
        description: 'Saturn is famous for its spectacular ring system made of ice and rock. It is so light for its size that it would float in a big enough bathtub.' },
    uranus:  { name: 'Uranus', color: '#06b6d4', type: 'Ice Giant', badge: 'bg-cyan-500/50 text-cyan-200',
        description: 'Uranus is an ice giant that rotates on its side, with an axial tilt of about 98 degrees. Methane in its atmosphere gives it a pale blue-green color.' },
    neptune: { name: 'Neptune', color: '#2563eb', type: 'Ice Giant', badge: 'bg-blue-500/50 text-blue-200',
        description: 'Neptune is the farthest planet from the Sun, a cold and windy ice giant with the fastest winds in the Solar System.' }
};

let planetsById = {};
// ---------- Load ----------
let planetsLoaded = false;

async function loadPlanetsData(initialId = 'earth') {
    try {
        const response = await fetch(PLANETS_API_URL);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        const planets = data.bodies || [];
        if (planets.length === 0) throw new Error('No planets returned');

        planetsById = {};
        planets.forEach((p) => {
            planetsById[p.englishName.toLowerCase()] = p;
        });
        planetsLoaded = true;

        renderPlanetsComparison();
        selectPlanet(initialId);

        console.log('Planets Data:', planetsById);
        return true;
    } catch (error) {
        // لو الـ API فشل، المحتوى الثابت الموجود في الـ HTML يفضل ظاهر
        console.error('Planets API Error:', error);
        return false;
    }
}

// ---------- Cards click ----------
// الربط هنا مستقل عن الـ API (event delegation على الـ grid)
function setupPlanetCards() {
    const grid = document.getElementById('planets-grid');
    if (!grid) {
        console.warn('#planets-grid not found');
        return;
    }

    grid.addEventListener('click', async (e) => {
        const card = e.target.closest('.planet-card[data-planet-id]');
        if (!card) return;

        const id = card.dataset.planetId;
        console.log('Planet clicked:', id);

        highlightPlanetCard(id);

        // لو الداتا لسه ماجتش (الـ API فشل قبل كده) نحاول تاني
        if (!planetsLoaded) {
            await loadPlanetsData(id);
            return;
        }
        selectPlanet(id);
    });
}

function highlightPlanetCard(id) {
    document.querySelectorAll('.planet-card').forEach((card) => {
        const active = card.dataset.planetId === id;
        card.classList.toggle('ring-2', active);
        card.classList.toggle('ring-blue-500/60', active);
    });
}

function selectPlanet(id) {
    highlightPlanetCard(id);

    const planet = planetsById[id];
    if (!planet) {
        console.warn('No API data for planet:', id, Object.keys(planetsById));
        return;
    }
    renderPlanetDetails(planet);
}

// ---------- Details ----------
function renderPlanetDetails(planet) {
    const id = planet.englishName.toLowerCase();
    const meta = PLANET_META[id] || {};
    const name = meta.name || planet.englishName;

    const img = document.getElementById('planet-detail-image');
    if (img) {
        img.src = `./assets/images/${id}.png`;
        img.alt = `${name} planet`;
    }

    setText('planet-detail-name', name);
    setText('planet-detail-description', planet.description || meta.description || '');

    // Quick stats
    setText('planet-distance', fmtKm(planet.semimajorAxis));
    setText('planet-radius', hasNum(planet.meanRadius) ? `${fmtNumber(planet.meanRadius, 0)} km` : 'N/A');
    setHTML('planet-mass', fmtPower(planet.mass, 'massValue', 'massExponent', 'kg'));
    setText('planet-density', hasNum(planet.density) ? `${fmtNumber(planet.density, 2)} g/cm³` : 'N/A');
    setText('planet-orbital-period', fmtOrbit(planet.sideralOrbit));
    setText('planet-rotation', fmtRotation(planet.sideralRotation));
    setText('planet-moons', String(moonsCount(planet)));
    setText('planet-gravity', hasNum(planet.gravity) ? `${fmtNumber(planet.gravity, 1)} m/s²` : 'N/A');

    // Discovery info
    setText('planet-discoverer', planet.discoveredBy || 'Known since antiquity');
    setText('planet-discovery-date', planet.discoveryDate || 'Ancient');
    setText('planet-body-type', planet.bodyType || 'Planet');
    setHTML('planet-volume', fmtPower(planet.vol, 'volValue', 'volExponent', 'km³'));

    // Orbital characteristics
    setText('planet-perihelion', fmtKm(planet.perihelion));
    setText('planet-aphelion', fmtKm(planet.aphelion));
    setText('planet-eccentricity', hasNum(planet.eccentricity) ? fmtNumber(planet.eccentricity, 4) : 'N/A');
    setText('planet-inclination', hasNum(planet.inclination) ? `${fmtNumber(planet.inclination, 2)}°` : 'N/A');
    setText('planet-axial-tilt', hasNum(planet.axialTilt) ? `${fmtNumber(planet.axialTilt, 2)}°` : 'N/A');
    setText('planet-temp', fmtTempC(planet.avgTemp));
    setText('planet-escape', hasNum(planet.escape) ? `${fmtNumber(planet.escape / 1000, 1)} km/s` : 'N/A');

    renderPlanetFacts(planet, name);
}

function renderPlanetFacts(planet, name) {
    const list = document.getElementById('planet-facts');
    if (!list) return;

    const facts = [];
    if (hasNum(planet.gravity)) {
        facts.push(`Surface gravity is ${fmtNumber(planet.gravity / 9.81, 2)}× Earth's`);
    }
    if (hasNum(planet.sideralOrbit) && planet.sideralOrbit > 0) {
        facts.push(`One year on ${name} lasts ${fmtOrbit(planet.sideralOrbit)}`);
    }
    if (hasNum(planet.sideralRotation) && planet.sideralRotation !== 0) {
        facts.push(`One rotation takes ${fmtRotation(planet.sideralRotation)}`);
    }
    const moons = moonsCount(planet);
    facts.push(moons === 0 ? `${name} has no known moons` : `${name} has ${moons} known moon${moons > 1 ? 's' : ''}`);

    list.innerHTML = '';
    facts.forEach((text) => {
        const li = document.createElement('li');
        li.className = 'flex items-start';
        li.innerHTML = '<i class="fas fa-check text-green-400 mt-1 mr-2"></i>';
        const span = document.createElement('span');
        span.className = 'text-slate-300';
        span.textContent = text;
        li.appendChild(span);
        list.appendChild(li);
    });
}

// ---------- Comparison table ----------
function renderPlanetsComparison() {
    const tbody = document.getElementById('planet-comparison-tbody');
    if (!tbody) return;

    const cell = 'px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap';
    let rows = '';

    PLANET_ORDER.forEach((id) => {
        const p = planetsById[id];
        const meta = PLANET_META[id];
        if (!p || !meta) return;

        const au = hasNum(p.semimajorAxis) ? (p.semimajorAxis / AU_KM).toFixed(2) : 'N/A';
        const diameter = hasNum(p.meanRadius) ? fmtNumber(p.meanRadius * 2, 0) : 'N/A';
        const earthMass = p.mass && hasNum(p.mass.massValue)
            ? Number(((p.mass.massValue * Math.pow(10, p.mass.massExponent)) / EARTH_MASS_KG).toPrecision(3)).toLocaleString('en-US')
            : 'N/A';

        rows += `
            <tr class="hover:bg-slate-800/30 transition-colors">
                <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
                    <div class="flex items-center space-x-2 md:space-x-3">
                        <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color: ${meta.color}"></div>
                        <span class="font-semibold text-sm md:text-base whitespace-nowrap">${meta.name}</span>
                    </div>
                </td>
                <td class="${cell}">${au}</td>
                <td class="${cell}">${diameter}</td>
                <td class="${cell}">${earthMass}</td>
                <td class="${cell}">${fmtOrbit(p.sideralOrbit)}</td>
                <td class="${cell}">${moonsCount(p)}</td>
                <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span class="px-2 py-1 rounded text-xs ${meta.badge}">${meta.type}</span>
                </td>
            </tr>`;
    });
    if (rows) tbody.innerHTML = rows;
}
// تشغيل
setupPlanetCards();
loadPlanetsData();
