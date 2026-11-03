
/* =========================================================
   KABARO - MAIN APPLICATION JAVASCRIPT
   Version 1.0 - Fresh Repository
========================================================= */

"use strict";

/* =========================================================
   1. APPLICATION DATA
========================================================= */

const KABARO = {
    profile: JSON.parse(localStorage.getItem("kabaroProfile") || "null") || {},
    jobs: JSON.parse(localStorage.getItem("kabaroJobs") || "null") || [],
    records: JSON.parse(localStorage.getItem("kabaroRecords") || "[]"),
    currentScreen: "homeScreen",
    navigationHistory: [],
    currentRoutinePeriod: "Weekly"
};

const SCREEN_NAMES = {
    Home: "homeScreen",
    Dashboard: "homeScreen",
    Modules: "modulesScreen",
    Routine: "routineScreen",
    Operations: "operationsScreen",
    Safety: "safetyScreen",
    "Safety & Emergency": "safetyScreen",
    "Personal & Records": "personalScreen",
    Personal: "personalScreen",
    "Daily Jobs": "dailyJobsScreen",
    "Port Arrival": "portArrivalScreen",
    "Port Departure": "portDepartureScreen",
    "Special Job Order": "specialJobsScreen",
    "Matters for Turn Over": "turnoverScreen",
    "Contract and Sea Service": "contractScreen",
    Reminders: "remindersScreen",
    "Pre-Boarding": "preboardingScreen",
    "Emergency Drill Duties": "emergencyScreen",
    Reports: "reportsScreen",
    "Reports & History": "reportsScreen",
    Search: "searchScreen",
    Settings: "settingsScreen",
    "Completed History": "completedHistoryScreen",
    "Monthly Summary": "monthlySummaryScreen",
    "Custom Date Range Report": "dateReportScreen",
    "My Profile": "profileSettingsScreen",
    "Vessel Information": "vesselSettingsScreen",
    "Job List Management": "jobSettingsScreen",
    "Reminders & Notifications": "reminderSettingsScreen",
    "Date and Time Format": "dateSettingsScreen",
    "Backup and Restore": "backupSettingsScreen",
    "Theme Appearance": "themeSettingsScreen",
    "About KABARO": "aboutScreen"
};

const JOB_CATEGORIES = {
    daily: "dailyJobsContainer",
    arrival: "arrivalContainer",
    departure: "departureContainer",
    special: "specialJobsContainer",
    turnover: "turnoverContainer",
    reminder: "remindersContainer",
    preboarding: "preboardingContainer",
    emergency: "emergencyContainer",
    routine: "routineJobsContainer"
};

const DEFAULT_JOBS = [];


/* =========================================================
   2. GENERAL HELPERS
========================================================= */

function today() {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000)
        .toISOString().split("T")[0];
}

function saveData() {
    localStorage.setItem("kabaroProfile", JSON.stringify(KABARO.profile));
    localStorage.setItem("kabaroJobs", JSON.stringify(KABARO.jobs));
    localStorage.setItem("kabaroRecords", JSON.stringify(KABARO.records));
}

function getElement(id) {
    return document.getElementById(id);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function showMessage(message) {
    alert(message);
}

function makeId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}


/* =========================================================
   3. SCREEN NAVIGATION
========================================================= */


function showScreen(screenId, skipHistory = false) {
    const target = getElement(screenId);

    if (!target) {
        console.warn("KABARO: Screen not found:", screenId);
        return;
    }

    const currentScreen = KABARO.currentScreen;

    if (
        !skipHistory &&
        currentScreen !== screenId &&
        getElement(currentScreen)
    ) {
        KABARO.navigationHistory.push(currentScreen);
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    target.classList.add("active");
    KABARO.currentScreen = screenId;

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.remove("active");

        const destination =
            button.dataset.screen ||
            button.dataset.target ||
            button.dataset.go ||
            "";

        if (destination === screenId) {
            button.classList.add("active");
        }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (screenId === "homeScreen") renderDashboard();
    if (screenId === "dailyJobsScreen") renderJobs("daily");
    if (screenId === "portArrivalScreen") renderJobs("arrival");
    if (screenId === "portDepartureScreen") renderJobs("departure");
    if (screenId === "specialJobsScreen") renderJobs("special");
    if (screenId === "turnoverScreen") renderJobs("turnover");
    if (screenId === "remindersScreen") renderJobs("reminder");
    if (screenId === "preboardingScreen") renderJobs("preboarding");
    if (screenId === "emergencyScreen") renderJobs("emergency");
    if (screenId === "routineJobsScreen") renderJobs("routine");
    if (screenId === "completedHistoryScreen") renderCompletedHistory();
    if (screenId === "monthlySummaryScreen") renderMonthlySummary();
    if (screenId === "contractScreen") renderContracts();
    if (screenId === "searchScreen") renderGlobalSearch("");
}

function goBack() {
    let previousScreen = null;

    while (KABARO.navigationHistory.length > 0) {
        const candidate = KABARO.navigationHistory.pop();

        if (candidate !== KABARO.currentScreen && getElement(candidate)) {
            previousScreen = candidate;
            break;
        }
    }

    if (previousScreen) {
        showScreen(previousScreen, true);
    } else if (KABARO.currentScreen !== "homeScreen") {
        showScreen("homeScreen", true);
    }
}

function navigateFromText(text) {
    const cleanText = text.replace(/[^\w\s&-]/g, "").trim();

    if (SCREEN_NAMES[cleanText]) {
        showScreen(SCREEN_NAMES[cleanText]);
        return true;
    }

    const normalized = cleanText.toLowerCase();

    for (const [name, screen] of Object.entries(SCREEN_NAMES)) {
        if (normalized.includes(name.toLowerCase())) {
            showScreen(screen);
            return true;
        }
    }

    return false;
}

function goHome() {
    showScreen("homeScreen");
}



/* =========================================================
   4. PROFILE SETUP
========================================================= */

function initializeSetup() {
    const form = getElement("setupForm");

    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        KABARO.profile = {
            name: getElement("setupName")?.value.trim() || "",
            rank: getElement("setupRank")?.value || "",
            department: getElement("setupDepartment")?.value || "",
            vessel: getElement("setupVessel")?.value.trim() || "",
            vesselType: getElement("setupVesselType")?.value || "",
            company: getElement("setupCompany")?.value.trim() || "",
            joiningDate: getElement("setupJoiningDate")?.value || ""
        };

        if (!KABARO.profile.name) {
            showMessage("Please enter your full name.");
            return;
        }

        saveData();
        showMainApplication();
    });
}

function showMainApplication() {
    getElement("splashScreen")?.classList.add("hidden");
    getElement("setupScreen")?.classList.add("hidden");
    getElement("mainApp")?.classList.remove("hidden");

    updateProfileDisplay();
    updateDate();
    renderDashboard();
    showScreen("homeScreen");
}

function updateProfileDisplay() {
    const greeting = getElement("homeGreeting");

    if (greeting) {
        greeting.textContent = "Good day, KABARO!";
    }
}

function updateDate() {
    const dateElement = getElement("homeDate");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString(
            "en-PH",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
    }
}


/* =========================================================
   5. DASHBOARD
========================================================= */

/* =========================================================
   5. DASHBOARD
========================================================= */

function renderDashboard() {

    const currentDate = today();

    const todayJobs = KABARO.jobs.filter(job =>
        job.date === currentDate
    );

    const pendingJobs = KABARO.jobs.filter(job =>
        !job.completed
    );

    const upcomingJobs = KABARO.jobs.filter(job =>
        !job.completed &&
        job.date &&
        job.date > currentDate
    );

    setText("todayCount", todayJobs.length);
    setText("pendingCount", pendingJobs.length);
    setText("upcomingCount", upcomingJobs.length);

    setText(
        "homeDate",
        new Date().toLocaleDateString("en-PH", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    );

    updateServiceCounters();
}

function calculateDays(startDate) {
    if (!startDate) return "—";

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(today() + "T00:00:00");

    const difference = Math.floor(
        (end - start) / 86400000
    );

    return difference + 1;
}

function updateServiceCounters() {

    const profile = KABARO.profile;
    const status = profile.employmentStatus ||
        (profile.joiningDate ? "onboard" : "");

    if (status === "onboard" && profile.joiningDate) {

        setText(
            "daysOnboardCount",
            calculateDays(profile.joiningDate)
        );

        setText("onboardStatus", "CURRENT CONTRACT");
        setText("daysVacationCount", "—");
        setText("vacationStatus", "ONBOARD");

    } else if (status === "vacation" && profile.disembarkationDate) {

        setText("daysOnboardCount", "—");
        setText("onboardStatus", "ON VACATION");

        setText(
            "daysVacationCount",
            calculateDays(profile.disembarkationDate)
        );

        setText("vacationStatus", "CURRENT VACATION");

    } else {

        setText("daysOnboardCount", "—");
        setText("onboardStatus", "SET JOINING DATE");
        setText("daysVacationCount", "—");
        setText("vacationStatus", "SET DISEMBARKATION DATE");
    }
}

function openServiceDateForm() {

    const currentStatus = KABARO.profile.employmentStatus ||
        (KABARO.profile.joiningDate ? "onboard" : "onboard");

    const currentDate = currentStatus === "vacation"
        ? KABARO.profile.disembarkationDate || ""
        : KABARO.profile.joiningDate || "";

    showModal("Update Sea Service Dates", `
        <form id="serviceDateForm">

            <div class="form-group">
                <label>Current Employment Status</label>
                <select id="serviceStatus" required>
                    <option value="onboard"
                        ${currentStatus === "onboard" ? "selected" : ""}>
                        ONBOARD
                    </option>
                    <option value="vacation"
                        ${currentStatus === "vacation" ? "selected" : ""}>
                        ON VACATION
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label id="serviceDateLabel">Joining / Disembarkation Date</label>
                <input
                    type="date"
                    id="serviceDate"
                    value="${escapeHTML(currentDate)}"
                    max="${today()}"
                    required
                >
            </div>

            <button type="submit" class="primary-button">
                Save Sea Service Dates
            </button>

        </form>
    `);

    getElement("serviceStatus").addEventListener("change", function() {
        const label = getElement("serviceDateLabel");

        label.textContent = this.value === "onboard"
            ? "Current Joining Date"
            : "Last Disembarkation Date";

        getElement("serviceDate").value =
            this.value === "onboard"
                ? KABARO.profile.joiningDate || ""
                : KABARO.profile.disembarkationDate || "";
    });

    getElement("serviceDateForm").addEventListener("submit", function(event) {

        event.preventDefault();

        const status = getElement("serviceStatus").value;
        const date = getElement("serviceDate").value;

        if (!date || date > today()) {
            showMessage("Please enter a valid date that is not in the future.");
            return;
        }

        KABARO.profile.employmentStatus = status;

        if (status === "onboard") {
            KABARO.profile.joiningDate = date;
        } else {
            KABARO.profile.disembarkationDate = date;
        }

        saveData();
        closeModal();
        renderDashboard();

        showMessage("Sea service dates updated successfully.");
    });
}

function setText(id, value) {
    const element = getElement(id);
    if (element) element.textContent = value;
}


/* =========================================================
   6. JOB MANAGEMENT
========================================================= */
let preboardingFilter = "all";

function setPreboardingFilter(filter, button) {
    preboardingFilter = filter;

    document.querySelectorAll(".preboarding-filter").forEach(item => {
        item.classList.remove("active");
    });

    button.classList.add("active");

    renderJobs("preboarding");
}
function renderJobs(category) {
    const containerId = JOB_CATEGORIES[category];
    const container = getElement(containerId);

    if (!container) return;

    let jobs = KABARO.jobs.filter(job => job.category === category);
    if (category === "preboarding") {
    if (preboardingFilter === "pending") {
        jobs = jobs.filter(job => !job.completed);
    } else if (preboardingFilter === "completed") {
        jobs = jobs.filter(job => job.completed);
    }
}

    if (category === "routine") {
        jobs = jobs.filter(job =>
            (job.period || "Weekly") === KABARO.currentRoutinePeriod
        );
    }

    if (category === "daily") {
        const search = getElement("jobSearch")?.value.toLowerCase() || "";
        jobs = jobs.filter(job => job.title.toLowerCase().includes(search));
    }

    if (category === "arrival") {
        const search = getElement("arrivalSearch")?.value.toLowerCase() || "";
        jobs = jobs.filter(job => job.title.toLowerCase().includes(search));
    }

    if (category === "turnover") {
        const search = getElement("turnoverSearch")?.value.toLowerCase() || "";
        jobs = jobs.filter(job => job.title.toLowerCase().includes(search));
    }

    if (jobs.length === 0) {
        container.innerHTML = '<div class="empty-state">No jobs yet. Use ADD JOB to create one.</div>';
        return;
    }

    jobs.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return (a.time || "").localeCompare(b.time || "");
    });

    container.innerHTML = jobs.map(job => jobHTML(job)).join("");
}

function jobHTML(job) {

    const priority = (job.priority || "Normal").toLowerCase();

    // EMERGENCY DRILL DUTIES DISPLAY
    if (job.category === "emergency") {

        return `
            <div class="job-card ${job.completed ? "completed" : ""}">

                <input
                    type="checkbox"
                    ${job.completed ? "checked" : ""}
                    onchange="toggleJob(${job.id})"
                    aria-label="Mark drill completed"
                >

                <div class="job-info">

                    <h4>🚨 ${escapeHTML(job.title)}</h4>

                    <p><strong>Team:</strong>
                        ${escapeHTML(job.team || "Not specified")}
                    </p>

                    <p><strong>Team Leader:</strong>
                        ${escapeHTML(job.teamLeader || "Not specified")}
                    </p>

                    <p><strong>Co-Member:</strong>
                        ${escapeHTML(job.coMember || "Not specified")}
                    </p>

                    <p><strong>Duties and Responsibilities:</strong><br>
                        ${escapeHTML(job.duties || "Not specified")}
                    </p>

                    <p><strong>Carrying Goods:</strong><br>
                        ${escapeHTML(job.carryingGoods || "Not specified")}
                    </p>

                    <p><strong>Special Notes:</strong><br>
                        ${escapeHTML(job.notes || "None")}
                    </p>

                </div>

                <div class="job-actions">
                    <button onclick="editJob(${job.id})" aria-label="Edit drill duties">✎</button>
                    <button onclick="deleteJob(${job.id})" aria-label="Delete drill duties">🗑</button>
                </div>

            </div>
        `;
    }

    // EXISTING DISPLAY FOR ALL OTHER JOB CATEGORIES
    return `
        <div class="job-card ${job.completed ? "completed" : ""}">

            <input
                type="checkbox"
                ${job.completed ? "checked" : ""}
                onchange="toggleJob(${job.id})"
                aria-label="Mark ${escapeHTML(job.title)} completed"
            >

            <div class="job-info">
                <h4>${escapeHTML(job.title)}</h4>

                ${job.notes ? `<p>${escapeHTML(job.notes)}</p>` : ""}

                <div class="job-meta">
                    <span class="priority ${priority}">
                        ${escapeHTML(job.priority || "Normal")}
                    </span>

                    ${job.date ? `<span class="status-badge">${escapeHTML(job.date)}</span>` : ""}
                </div>
            </div>

            <span class="job-time">${escapeHTML(job.time || "")}</span>

            <div class="job-actions">
                <button onclick="editJob(${job.id})" aria-label="Edit job">✎</button>
                <button onclick="deleteJob(${job.id})" aria-label="Delete job">🗑</button>
            </div>

        </div>
    `;
}

function addJob(category) {
    openJobForm(category);
}

function openJobForm(category, jobId = null) {
    const existing = jobId
        ? KABARO.jobs.find(job => job.id === jobId)
        : null;

    const title = existing
    ? (category === "emergency" ? "Edit Drill Duties" : "Edit Job")
    : (category === "emergency" ? "Add New Drill Duties" : "Add New Job");
// ==========================================
// SPECIAL FORM FOR PRE-BOARDING CHECKLIST
// ==========================================

if (category === "preboarding") {

    showModal(
        existing ? "Edit Checklist Task" : "Add Checklist Task",
        `
        <form id="jobForm">

            <div class="form-group">
                <label>Task / To-Do</label>
                <input
                    type="text"
                    id="preboardingTask"
                    placeholder="Enter your pre-boarding task"
                    value="${escapeHTML(existing?.title || "")}"
                    required>
            </div>

            <div class="form-group">
                <label>Remarks (Optional)</label>
                <textarea
                    id="preboardingRemarks"
                    placeholder="Enter additional notes or reminders...">${escapeHTML(existing?.notes || "")}</textarea>
            </div>

            <button type="submit" class="primary-button">
                ${existing ? "SAVE CHANGES" : "ADD TASK"}
            </button>

        </form>
        `
    );

    getElement("jobForm").addEventListener("submit", function(event) {

        event.preventDefault();

        const task = getElement("preboardingTask").value.trim();
        const remarks = getElement("preboardingRemarks").value.trim();

        if (!task) {
            showMessage("Please enter a task.");
            return;
        }

        if (existing) {

            existing.title = task;
            existing.notes = remarks;

        } else {

            KABARO.jobs.push({
                id: makeId(),
                category: "preboarding",
                title: task,
                notes: remarks,
                completed: false
            });

        }

        saveData();
        closeModal();
        refreshCurrentScreen();

    });

    return;
}
// ==========================================
// SPECIAL FORM FOR MATTERS FOR TURN OVER ONLY
// ==========================================

if (category === "turnover") {

    showModal(
        existing ? "Edit Turn Over Item" : "Add Turn Over Item",
        `
        <form id="jobForm">

            <div class="form-group">
                <label>1. Item / Equipment</label>

                <input
                    type="text"
                    id="turnoverItem"
                    placeholder="Enter item or equipment"
                    value="${escapeHTML(existing?.title || "")}"
                    required>
            </div>

            <div class="form-group">
                <label>2. Details</label>

                <textarea
                    id="turnoverDetails"
                    placeholder="Enter details or information..."
                    required>${escapeHTML(existing?.notes || "")}</textarea>
            </div>

            <button type="submit" class="primary-button">
                ${existing ? "SAVE CHANGES" : "SAVE TURN OVER"}
            </button>

        </form>
        `
    );

    getElement("jobForm").addEventListener("submit", function(event) {

        event.preventDefault();

        const item = getElement("turnoverItem").value.trim();
        const details = getElement("turnoverDetails").value.trim();

        if (!item || !details) {
            showMessage("Please complete both fields.");
            return;
        }

        if (existing) {

            existing.title = item;
            existing.notes = details;

        } else {

            KABARO.jobs.push({
                id: makeId(),
                category: "turnover",
                title: item,
                notes: details,
                completed: false
            });

        }

        saveData();
        closeModal();
        refreshCurrentScreen();

    });

    return;
}
// SPECIAL FORM FOR ASSORTED REMINDERS ONLY
if (category === "reminder") {

    showModal(
        existing ? "Edit Reminder" : "Add New Reminder",
        `
        <form id="jobForm">

            <div class="form-group">
                <label>Reminder</label>
                <textarea
                    id="reminderText"
                    placeholder="Enter your reminder..."
                    required>${escapeHTML(existing?.title || "")}</textarea>
            </div>

            <button type="submit" class="primary-button">
                ${existing ? "SAVE CHANGES" : "SAVE REMINDER"}
            </button>

        </form>
        `
    );

    getElement("jobForm").addEventListener("submit", function(event) {

        event.preventDefault();

        const reminder = getElement("reminderText").value.trim();

        if (!reminder) {
            showMessage("Please enter your reminder.");
            return;
        }

        if (existing) {

            existing.title = reminder;

        } else {

            KABARO.jobs.push({
                id: makeId(),
                category: "reminder",
                title: reminder,
                completed: false
            });

        }

        saveData();
        closeModal();
        refreshCurrentScreen();

    });

    return;
}    
    // SPECIAL FORM FOR EMERGENCY DRILL DUTIES ONLY
if (category === "emergency") {

    showModal(
        existing ? "Edit Drill Duties" : "Add New Drill Duties",
        `
        <form id="jobForm">

            <div class="form-group">
                <label>1. Type of Emergency Drill</label>
                <input type="text" id="emergencyDrillType"
                    placeholder="e.g. Fire Drill, Abandon Ship"
                    value="${escapeHTML(existing?.title || "")}"
                    required>
            </div>

            <div class="form-group">
                <label>2. Team</label>
                <input type="text" id="emergencyTeam"
                    placeholder="Enter assigned team"
                    value="${escapeHTML(existing?.team || "")}">
            </div>

            <div class="form-group">
                <label>3. Team Leader</label>
                <input type="text" id="emergencyTeamLeader"
                    placeholder="Enter team leader"
                    value="${escapeHTML(existing?.teamLeader || "")}">
            </div>

            <div class="form-group">
                <label>Co-Member</label>
                <input type="text" id="emergencyCoMember"
                    placeholder="Enter co-member"
                    value="${escapeHTML(existing?.coMember || "")}">
            </div>

            <div class="form-group">
                <label>4. Duties and Responsibilities</label>
                <textarea id="emergencyDuties"
                    placeholder="Enter duties and responsibilities">${escapeHTML(existing?.duties || "")}</textarea>
            </div>

            <div class="form-group">
                <label>5. Carrying Goods</label>
                <textarea id="emergencyCarryingGoods"
                    placeholder="List equipment and items to be carried">${escapeHTML(existing?.carryingGoods || "")}</textarea>
            </div>

            <div class="form-group">
                <label>6. Special Notes</label>
                <textarea id="emergencySpecialNotes"
                    placeholder="Enter additional instructions or notes">${escapeHTML(existing?.notes || "")}</textarea>
            </div>

            <button type="submit" class="primary-button">
                ${existing ? "Save Changes" : "Add Drill Duties"}
            </button>

        </form>
        `
    );

    getElement("jobForm").addEventListener("submit", function(event) {

        event.preventDefault();

        const data = {
            title: getElement("emergencyDrillType").value.trim(),
            team: getElement("emergencyTeam").value.trim(),
            teamLeader: getElement("emergencyTeamLeader").value.trim(),
            coMember: getElement("emergencyCoMember").value.trim(),
            duties: getElement("emergencyDuties").value.trim(),
            carryingGoods: getElement("emergencyCarryingGoods").value.trim(),
            notes: getElement("emergencySpecialNotes").value.trim()
        };

        if (!data.title) {
            showMessage("Please enter the type of emergency drill.");
            return;
        }

        if (existing) {
            Object.assign(existing, data);
        } else {
            KABARO.jobs.push({
                id: makeId(),
                category: "emergency",
                ...data,
                completed: false
            });
        }

        saveData();
        closeModal();
        refreshCurrentScreen();

    });

    return;
}
    showModal(title, `
        <form id="jobForm">
            <div class="form-group">
                <label>Job / Task Description</label>
                <input id="jobTitle" required maxlength="150"
                    value="${escapeHTML(existing?.title || "")}"
                    placeholder="Enter job description">
            </div>

            <div class="form-group">
                <label>Priority</label>
                <select id="jobPriority">
                    <option ${existing?.priority === "High" ? "selected" : ""}>High</option>
                    <option ${!existing || existing.priority === "Normal" ? "selected" : ""}>Normal</option>
                    <option ${existing?.priority === "Low" ? "selected" : ""}>Low</option>
                </select>
            </div>

            <div class="form-group">
                <label>Date</label>
                <input type="date" id="jobDate"
                    value="${escapeHTML(existing?.date || today())}">
            </div>

            <div class="form-group">
                <label>Time</label>
                <input type="time" id="jobTime"
                    value="${escapeHTML(existing?.time || "")}">
            </div>

            <div class="form-group">
                <label>Notes / Instructions</label>
                <textarea id="jobNotes">${escapeHTML(existing?.notes || "")}</textarea>
            </div>
            ${category === "routine" ? `
    <div class="form-group">
        <label>Job Frequency</label>
        <select id="jobPeriod" required>
            <option value="Weekly" ${(existing?.period || KABARO.currentRoutinePeriod) === "Weekly" ? "selected" : ""}>Weekly</option>
            <option value="Monthly" ${(existing?.period || KABARO.currentRoutinePeriod) === "Monthly" ? "selected" : ""}>Monthly</option>
            <option value="Quarterly" ${(existing?.period || KABARO.currentRoutinePeriod) === "Quarterly" ? "selected" : ""}>Quarterly</option>
            <option value="Yearly" ${(existing?.period || KABARO.currentRoutinePeriod) === "Yearly" ? "selected" : ""}>Yearly</option>
        </select>
    </div>
` : ""}

<button type="submit" class="primary-button">
    ${existing
        ? "Save Changes"
        : (category === "emergency" ? "Add Drill Duties" : "Add Job")}
</button>
        </form>
    `);

    getElement("jobForm").addEventListener("submit", function(event) {
        event.preventDefault();

 const data = {
    title: getElement("jobTitle").value.trim(),
    priority: getElement("jobPriority").value,
    date: getElement("jobDate").value,
    time: getElement("jobTime").value,
    notes: getElement("jobNotes").value.trim(),
    period: category === "routine"
        ? getElement("jobPeriod").value
        : existing?.period
};

        if (!data.title) return;

        if (existing) {
            Object.assign(existing, data);
        } else {
            KABARO.jobs.push({
                id: makeId(),
                category,
                ...data,
                completed: false
            });
        }

        saveData();
        closeModal();
        refreshCurrentScreen();
    });
}

function editJob(id) {
    const job = KABARO.jobs.find(item => item.id === id);
    if (job) openJobForm(job.category, id);
}

function deleteJob(id) {
    if (!confirm("Delete this item?")) return;

    KABARO.jobs = KABARO.jobs.filter(job => job.id !== id);
    saveData();
    refreshCurrentScreen();
}

function toggleJob(id) {
    const job = KABARO.jobs.find(item => item.id === id);
    if (!job) return;

    job.completed = !job.completed;

    saveData();
    refreshCurrentScreen();
}

function refreshCurrentScreen() {
    renderDashboard();

    const category = Object.keys(JOB_CATEGORIES).find(key =>
        JOB_CATEGORIES[key] &&
        getElement(JOB_CATEGORIES[key]) &&
        getElement(JOB_CATEGORIES[key]).closest(".page.active")
    );

    if (category) renderJobs(category);
}
function resetCompletedJobs(category, period = null) {
    const targetJobs = KABARO.jobs.filter(job =>
        job.category === category &&
        (period === null || (job.period || "Weekly") === period)
    );

    if (!targetJobs.some(job => job.completed)) {
        showMessage("There are no completed jobs to reset.");
        return;
    }

    if (!confirm(
        "Reset completed jobs? This will untick completed jobs but keep all job descriptions."
    )) return;

    targetJobs.forEach(job => {
        job.completed = false;
    });

    saveData();
    refreshCurrentScreen();
}

function resetAllRoutineJobs() {
    const targetJobs = KABARO.jobs.filter(job =>
        job.category === "daily" || job.category === "routine"
    );

    if (!targetJobs.some(job => job.completed)) {
        showMessage("There are no completed jobs to reset.");
        return;
    }

    if (!confirm(
        "Reset ALL Daily, Weekly, Monthly, Quarterly and Yearly jobs? Completed jobs will be unticked, but all job descriptions will be preserved."
    )) return;

    targetJobs.forEach(job => {
        job.completed = false;
    });

    saveData();
    renderDashboard();
}

/* =========================================================
   7. COMPLETED HISTORY
========================================================= */

function renderCompletedHistory() {
    const container = getElement("completedHistoryContainer");
    if (!container) return;

    const completed = KABARO.jobs.filter(job => job.completed);

    if (!completed.length) {
        container.innerHTML = '<div class="empty-state">No completed jobs yet.</div>';
        return;
    }

    container.innerHTML = completed.map(job => jobHTML(job)).join("");
}


/* =========================================================
   8. CONTRACT RECORDS
========================================================= */

function renderContracts() {
    const container = getElement("contractContainer");
    if (!container) return;

    if (!KABARO.records.length) {
        container.innerHTML =
            '<div class="empty-state">No sea service records yet. Tap + to add your first record.</div>';
        return;
    }

    container.innerHTML = KABARO.records.map(record => `
        <div class="record-card contract-card">

            <h3>🚢 ${escapeHTML(record.vessel || "Unnamed Vessel")}</h3>

            <div class="contract-details">

                <div class="contract-detail">
                    <strong>Rank</strong>
                    <span>${escapeHTML(record.rank || "—")}</span>
                </div>

                <div class="contract-detail">
                    <strong>Type</strong>
                    <span>${escapeHTML(record.type || "—")}</span>
                </div>

                <div class="contract-detail">
                    <strong>Gross Tonnage</strong>
                    <span>${escapeHTML(record.grossTonnage || "—")} GT</span>
                </div>

                <div class="contract-detail">
                    <strong>Engine</strong>
                    <span>${escapeHTML(record.engine || "—")}</span>
                </div>

                <div class="contract-detail">
                    <strong>Trade</strong>
                    <span>${escapeHTML(record.trade || "—")}</span>
                </div>

                <div class="contract-detail">
                    <strong>Date Embark</strong>
                    <span>${escapeHTML(record.start || "—")}</span>
                </div>

                <div class="contract-detail">
                    <strong>Date Disembark</strong>
                    <span>${escapeHTML(record.end || "—")}</span>
                </div>

                <div class="contract-detail contract-remarks">
                    <strong>Remarks</strong>
                    <span>${escapeHTML(record.remarks || "—")}</span>
                </div>

            </div>

            <button class="secondary-button"
                onclick="deleteContract(${record.id})">
                DELETE RECORD
            </button>

        </div>
    `).join("");
}

function addContract() {

    showModal("Add Sea Service Record", `
        <form id="contractForm">

            <div class="form-group">
                <label>1. Rank</label>
                <input
                    type="text"
                    id="contractRank"
                    placeholder="e.g. Second Officer"
                    value="${escapeHTML(KABARO.profile.rank || "")}"
                    required>
            </div>

            <div class="form-group">
                <label>2. Vessel Name</label>
                <input
                    type="text"
                    id="contractVessel"
                    placeholder="Enter vessel name"
                    required>
            </div>

            <div class="form-group">
                <label>3. Type</label>
                <input
                    type="text"
                    id="contractType"
                    placeholder="e.g. Bulk Carrier, Container Ship, Tanker"
                    required>
            </div>

            <div class="form-group">
                <label>4. Gross Tonnage (GT)</label>
                <input
                    type="number"
                    id="contractGT"
                    placeholder="Enter gross tonnage"
                    min="0"
                    step="any"
                    required>
            </div>

            <div class="form-group">
                <label>5. Engine (kW / HP)</label>
                <input
                    type="text"
                    id="contractEngine"
                    placeholder="e.g. 8,500 kW / 11,400 HP"
                    required>
            </div>

            <div class="form-group">
                <label>6. Trade</label>
                <input
                    type="text"
                    id="contractTrade"
                    placeholder="e.g. International, Coastal"
                    required>
            </div>

            <div class="form-group">
                <label>7. Date Embark</label>
                <input
                    type="date"
                    id="contractStart"
                    required>
            </div>

            <div class="form-group">
                <label>8. Date Disembark</label>
                <input
                    type="date"
                    id="contractEnd"
                    required>
            </div>

            <div class="form-group">
                <label>9. Remarks</label>
                <textarea
                    id="contractRemarks"
                    placeholder="Enter remarks or additional information..."
                    required></textarea>
            </div>

            <button class="primary-button" type="submit">
                SAVE SEA SERVICE RECORD
            </button>

        </form>
    `);

    getElement("contractForm").addEventListener("submit", event => {

        event.preventDefault();

        const rank = getElement("contractRank").value.trim();
        const vessel = getElement("contractVessel").value.trim();
        const type = getElement("contractType").value.trim();
        const grossTonnage = getElement("contractGT").value;
        const engine = getElement("contractEngine").value.trim();
        const trade = getElement("contractTrade").value.trim();
        const start = getElement("contractStart").value;
        const end = getElement("contractEnd").value;
        const remarks = getElement("contractRemarks").value.trim();

        if (
            !rank || !vessel || !type || !grossTonnage ||
            !engine || !trade || !start || !end || !remarks
        ) {
            showMessage("Please complete all nine fields.");
            return;
        }

        if (start > end) {
            showMessage("Date Embark cannot be later than Date Disembark.");
            return;
        }

        KABARO.records.push({
            id: makeId(),
            rank: rank,
            vessel: vessel,
            type: type,
            grossTonnage: grossTonnage,
            engine: engine,
            trade: trade,
            start: start,
            end: end,
            remarks: remarks
        });

        saveData();
        closeModal();
        renderContracts();

        showMessage("Sea service record saved successfully.");

    });
}
function generateSeaServicePDF() {

    if (!KABARO.records.length) {
        showMessage("No sea service records available.");
        return;
    }

    const reportWindow = window.open("", "_blank");

    if (!reportWindow) {
        showMessage("Please allow pop-ups for KABARO.");
        return;
    }

    const profile = KABARO.profile;

    const rows = KABARO.records.map((record, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHTML(record.vessel || "—")}</td>
            <td>${escapeHTML(record.rank || "—")}</td>
            <td>${escapeHTML(record.type || "—")}</td>
            <td>${escapeHTML(record.grossTonnage || "—")}</td>
            <td>${escapeHTML(record.engine || "—")}</td>
            <td>${escapeHTML(record.trade || "—")}</td>
            <td>${escapeHTML(record.start || "—")}</td>
            <td>${escapeHTML(record.end || "—")}</td>
            <td>${escapeHTML(record.remarks || "—")}</td>
        </tr>
    `).join("");

    reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sea Service Record Report</title>

            <style>
                @page {
                    size: A4 landscape;
                    margin: 10mm;
                }

                body {
                    font-family: Arial, sans-serif;
                    color: #18334d;
                    margin: 15px;
                }

                .header {
                    text-align: center;
                    border-bottom: 3px solid #07518a;
                    padding-bottom: 12px;
                    margin-bottom: 18px;
                }

                .brand {
                    font-size: 24px;
                    font-weight: bold;
                    color: #07518a;
                }

                h1 {
                    font-size: 22px;
                    margin: 10px 0;
                }

                .personal-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    padding: 12px;
                    border: 1px solid #8ca9c0;
                    margin-bottom: 18px;
                    font-size: 12px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    font-size: 9px;
                }

                th {
                    background: #073c69;
                    color: white;
                    padding: 8px 4px;
                    border: 1px solid white;
                }

                td {
                    border: 1px solid #8ca9c0;
                    padding: 8px 4px;
                    text-align: center;
                    overflow-wrap: anywhere;
                }

                tbody tr:nth-child(even) {
                    background: #eaf3fa;
                }

                .footer {
                    margin-top: 15px;
                    text-align: right;
                    font-size: 9px;
                }
            </style>
        </head>

        <body>

            <div class="header">
                <div class="brand">⚓ KABARO</div>
                <p>Your Personal Digital Companion Onboard</p>
                <h1>SEA SERVICE RECORD REPORT</h1>
            </div>

            <div class="personal-info">
                <div><strong>Name:</strong>
                    ${escapeHTML(profile.name || "")}</div>

                <div><strong>Rank:</strong>
                    ${escapeHTML(profile.rank || "")}</div>

                <div><strong>Department:</strong>
                    ${escapeHTML(profile.department || "")}</div>

                <div><strong>Date Generated:</strong>
                    ${new Date().toLocaleDateString("en-PH")}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Vessel Name</th>
                        <th>Rank</th>
                        <th>Type</th>
                        <th>GRT</th>
                        <th>Engine</th>
                        <th>Trade</th>
                        <th>Date Embark</th>
                        <th>Date Disembark</th>
                        <th>Remarks</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>
            </table>

            <div class="footer">
                Generated by KABARO
            </div>

        </body>
        </html>
    `);

    reportWindow.document.close();

    reportWindow.onload = function() {
        reportWindow.focus();
        reportWindow.print();
    };
}
function deleteContract(id) {
    if (!confirm("Delete this sea service record?")) return;

    KABARO.records = KABARO.records.filter(record => record.id !== id);
    saveData();
    renderContracts();
}


/* =========================================================
   9. MONTHLY SUMMARY
========================================================= */

function renderMonthlySummary() {
    const container = getElement("monthlySummaryContainer");
    if (!container) return;

    const month = today().slice(0, 7);
    const monthly = KABARO.jobs.filter(job =>
        job.date && job.date.startsWith(month)
    );

    const completed = monthly.filter(job => job.completed).length;
    const pending = monthly.length - completed;

    container.innerHTML = `
        <div class="dashboard-counters">
            <div class="counter-card">
                <strong>${monthly.length}</strong>
                <span>Total Jobs</span>
            </div>
            <div class="counter-card">
                <strong>${completed}</strong>
                <span>Completed</span>
            </div>
            <div class="counter-card">
                <strong>${pending}</strong>
                <span>Pending</span>
            </div>
        </div>
    `;
}


/* =========================================================
   10. MODAL FUNCTIONS
========================================================= */

function showModal(title, content) {
    setText("modalTitle", title);

    const container = getElement("modalContent");
    const overlay = getElement("modalOverlay");

    if (!container || !overlay) {
        showMessage("Modal area is missing from index.html.");
        return;
    }

    container.innerHTML = content;
    overlay.classList.remove("hidden");
}

function closeModal() {
    getElement("modalOverlay")?.classList.add("hidden");

    const content = getElement("modalContent");
    if (content) content.innerHTML = "";
}


/* =========================================================
   11. SEARCH
========================================================= */

function renderGlobalSearch(query) {
    const container = getElement("searchResults");
    if (!container) return;

    const search = String(query || "").toLowerCase().trim();

    if (!search) {
        container.innerHTML = '<div class="empty-state">Enter a keyword to search your jobs and records.</div>';
        return;
    }

    const results = KABARO.jobs.filter(job =>
        job.title.toLowerCase().includes(search) ||
        (job.notes || "").toLowerCase().includes(search)
    );

    if (!results.length) {
        container.innerHTML = '<div class="empty-state">No matching results found.</div>';
        return;
    }

    container.innerHTML = results.map(job => jobHTML(job)).join("");
}


/* =========================================================
   12. REPORTS AND EXPORT
========================================================= */

function generateDateReport() {
    const start = getElement("reportStartDate")?.value;
    const end = getElement("reportEndDate")?.value;
    const container = getElement("customReportContainer");

    if (!start || !end || !container) {
        showMessage("Please select both report dates.");
        return;
    }

    if (start > end) {
        showMessage("The start date cannot be later than the end date.");
        return;
    }

    const results = KABARO.jobs.filter(job =>
        job.date && job.date >= start && job.date <= end
    );

    container.innerHTML = `
        <h3>Report: ${escapeHTML(start)} to ${escapeHTML(end)}</h3>
        <p>Total records: ${results.length}</p>
        <p>Completed: ${results.filter(job => job.completed).length}</p>
        <p>Pending: ${results.filter(job => !job.completed).length}</p>
        ${results.map(job => `
            <div class="job-card">
                <div class="job-info">
                    <h4>${escapeHTML(job.title)}</h4>
                    <p>${escapeHTML(job.date || "")} | ${job.completed ? "Completed" : "Pending"}</p>
                </div>
            </div>
        `).join("")}
    `;
}

function printReport() {
    window.print();
}

function exportData() {
    const data = {
        profile: KABARO.profile,
        jobs: KABARO.jobs,
        records: KABARO.records,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "KABARO-backup.json";
    link.click();

    URL.revokeObjectURL(url);
}


/* =========================================================
   13. BACKUP RESTORE
========================================================= */

function restoreBackup(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function() {
        try {
            const data = JSON.parse(reader.result);

            if (!data || !Array.isArray(data.jobs)) {
                throw new Error("Invalid backup file.");
            }

            KABARO.profile = data.profile || {};
            KABARO.jobs = data.jobs;
            KABARO.records = data.records || [];

            saveData();
            showMessage("KABARO backup restored successfully.");
            location.reload();
        } catch (error) {
            showMessage("Unable to restore backup: " + error.message);
        }
    };

    reader.readAsText(file);
}


/* =========================================================
   14. PROFILE SETTINGS
========================================================= */

function renderProfileSettings() {
    const container = getElement("profileSettingsContainer");
    if (!container) return;

    container.innerHTML = `
        <form id="profileEditForm">
            <div class="form-group">
                <label>Full Name</label>
                <input id="editName" value="${escapeHTML(KABARO.profile.name || "")}">
            </div>
            <div class="form-group">
                <label>Rank</label>
                <input id="editRank" value="${escapeHTML(KABARO.profile.rank || "")}">
            </div>
            <div class="form-group">
                <label>Department</label>
                <input id="editDepartment" value="${escapeHTML(KABARO.profile.department || "")}">
            </div>
            <button class="primary-button" type="submit">Save Profile</button>
        </form>
    `;

    getElement("profileEditForm").addEventListener("submit", event => {
        event.preventDefault();

        KABARO.profile.name = getElement("editName").value.trim();
        KABARO.profile.rank = getElement("editRank").value.trim();
        KABARO.profile.department = getElement("editDepartment").value.trim();

        saveData();
        updateProfileDisplay();
        showMessage("Profile updated.");
    });
}

function renderVesselSettings() {
    const container = getElement("vesselSettingsContainer");
    if (!container) return;

    container.innerHTML = `
        <form id="vesselEditForm">
            <div class="form-group">
                <label>Vessel Name</label>
                <input id="editVessel" value="${escapeHTML(KABARO.profile.vessel || "")}">
            </div>
            <div class="form-group">
                <label>Vessel Type</label>
                <input id="editVesselType" value="${escapeHTML(KABARO.profile.vesselType || "")}">
            </div>
            <div class="form-group">
                <label>Company</label>
                <input id="editCompany" value="${escapeHTML(KABARO.profile.company || "")}">
            </div>
            <button class="primary-button" type="submit">Save Vessel Information</button>
        </form>
    `;

    getElement("vesselEditForm").addEventListener("submit", event => {
        event.preventDefault();

        KABARO.profile.vessel = getElement("editVessel").value.trim();
        KABARO.profile.vesselType = getElement("editVesselType").value.trim();
        KABARO.profile.company = getElement("editCompany").value.trim();

        saveData();
        showMessage("Vessel information updated.");
    });
}
/* =========================================================
   KABARO THEME APPEARANCE
========================================================= */

function renderThemeSettings() {

    const container = getElement("themeSettingsContainer");
    if (!container) return;

    const saved = JSON.parse(
        localStorage.getItem("kabaroAppearance") ||
        '{"theme":"ocean","fontSize":"medium"}'
    );

    const selectedTheme = saved.theme || "ocean";
    const selectedFont = saved.fontSize || "medium";

    container.innerHTML = `

        <div class="theme-intro">
            <h3>🎨 Choose Your Theme</h3>
            <p>Select the appearance that you prefer.</p>
        </div>

        <div class="theme-options">

            <label class="theme-option ocean-option">
                <input type="radio" name="kabaroTheme"
                       value="ocean"
                       ${selectedTheme === "ocean" ? "checked" : ""}>

                <span class="theme-preview ocean-preview">
                    <strong>⚓</strong>
                    <small>OCEAN BLUE</small>
                </span>

                <span class="theme-option-description">
                    <strong>Ocean Blue</strong>
                    <small>Classic KABARO appearance</small>
                </span>
            </label>

            <label class="theme-option light-option">
                <input type="radio" name="kabaroTheme"
                       value="light"
                       ${selectedTheme === "light" ? "checked" : ""}>

                <span class="theme-preview light-preview">
                    <strong>☀</strong>
                    <small>LIGHT MODE</small>
                </span>

                <span class="theme-option-description">
                    <strong>Light Mode</strong>
                    <small>Bright and clean appearance</small>
                </span>
            </label>

            <label class="theme-option dark-option">
                <input type="radio" name="kabaroTheme"
                       value="dark"
                       ${selectedTheme === "dark" ? "checked" : ""}>

                <span class="theme-preview dark-preview">
                    <strong>🌙</strong>
                    <small>DARK MODE</small>
                </span>

                <span class="theme-option-description">
                    <strong>Dark Mode</strong>
                    <small>Comfortable for nighttime use</small>
                </span>
            </label>

        </div>

        <div class="font-size-panel">

            <h3>🔠 Font Size</h3>
            <p>Adjust the text size for easier reading.</p>

            <select id="kabaroFontSize">
                <option value="small"
                    ${selectedFont === "small" ? "selected" : ""}>
                    Small
                </option>

                <option value="medium"
                    ${selectedFont === "medium" ? "selected" : ""}>
                    Medium - Default
                </option>

                <option value="large"
                    ${selectedFont === "large" ? "selected" : ""}>
                    Large
                </option>
            </select>

        </div>

        <button type="button"
                class="primary-button"
                id="applyThemeButton">
            ✓ APPLY APPEARANCE
        </button>

        <p class="theme-save-note">
            Your appearance preferences will be saved automatically
            when you click APPLY.
        </p>

    `;

    getElement("applyThemeButton").addEventListener("click", function() {

        const theme = document.querySelector(
            'input[name="kabaroTheme"]:checked'
        )?.value || "ocean";

        const fontSize = getElement("kabaroFontSize").value;

        const appearance = {
            theme: theme,
            fontSize: fontSize
        };

        localStorage.setItem(
            "kabaroAppearance",
            JSON.stringify(appearance)
        );

        applyKabaroAppearance(appearance);

        showMessage("KABARO appearance updated successfully!");

    });
}


function applyKabaroAppearance(appearance) {

    const theme = ["ocean", "light", "dark"].includes(appearance.theme)
        ? appearance.theme
        : "ocean";

    const fontSize = ["small", "medium", "large"].includes(appearance.fontSize)
        ? appearance.fontSize
        : "medium";

    document.body.dataset.theme = theme;
    document.body.dataset.fontSize = fontSize;

}


function loadKabaroAppearance() {

    const saved = JSON.parse(
        localStorage.getItem("kabaroAppearance") ||
        '{"theme":"ocean","fontSize":"medium"}'
    );

    applyKabaroAppearance(saved);

}

/* =========================================================
   15. ROUTINE JOBS
========================================================= */

function openRoutinePeriod(period) {
    const title = period + " Jobs";

    setText("routinePeriodTitle", title);

    KABARO.currentRoutinePeriod = period;

    showScreen("routineJobsScreen");
    renderJobs("routine");
}

function addRoutineJob() {
    openJobForm("routine");
}


/* =========================================================
   16. ADD BUTTONS
========================================================= */

function connectAddButtons() {


    const buttons = {
        addJobButton: "daily",
        addArrivalButton: "arrival",
        addDepartureButton: "departure",
        addSpecialJobButton: "special",
        addTurnoverButton: "turnover",
        addReminderButton: "reminder",
        addPreboardingButton: "preboarding",
        addEmergencyButton: "emergency",
        addRoutineButton: "routine"
    };

    Object.entries(buttons).forEach(([id, category]) => {
        getElement(id)?.addEventListener("click", () => addJob(category));
    });

    getElement("addContractButton")?.addEventListener("click", addContract);
    getElement("generateSeaServicePDFButton")?.addEventListener(
    "click",
    generateSeaServicePDF
);

    getElement("resetDailyJobsButton")?.addEventListener("click", () => {
    resetCompletedJobs("daily");
});

getElement("resetRoutineJobsButton")?.addEventListener("click", () => {
    resetCompletedJobs("routine", KABARO.currentRoutinePeriod);
});

getElement("resetAllJobsButton")?.addEventListener("click", () => {
    resetAllRoutineJobs();
});

    getElement("globalAddButton")?.addEventListener("click", () => {
        const category = {
            dailyJobsScreen: "daily",
            portArrivalScreen: "arrival",
            portDepartureScreen: "departure",
            specialJobsScreen: "special",
            turnoverScreen: "turnover",
            remindersScreen: "reminder",
            preboardingScreen: "preboarding",
            emergencyScreen: "emergency",
            routineJobsScreen: "routine"
        }[KABARO.currentScreen];

        if (category) {
            addJob(category);
        } else {
            showScreen("dailyJobsScreen");
            addJob("daily");
        }
    });
}


/* =========================================================
   17. SEARCH INPUTS
========================================================= */

function connectSearch() {
    getElement("jobSearch")?.addEventListener("input", () => renderJobs("daily"));
    getElement("arrivalSearch")?.addEventListener("input", () => renderJobs("arrival"));
    getElement("turnoverSearch")?.addEventListener("input", () => renderJobs("turnover"));

    getElement("globalSearch")?.addEventListener("input", event => {
        renderGlobalSearch(event.target.value);
    });
}


/* =========================================================
   18. NAVIGATION BUTTONS
========================================================= */

function connectNavigation() {
    document.querySelectorAll(".nav-button").forEach(button => {
        button.addEventListener("click", () => {
            const destination =
                button.dataset.screen ||
                button.dataset.target;

            if (destination) {
                showScreen(destination);
                return;
            }

            navigateFromText(button.innerText);
        });
    });

     document.addEventListener("click", event => {
        const button = event.target.closest("[data-go]");
        if (!button) return;

        const destination = button.dataset.go;
        const period = button.dataset.period;

        event.preventDefault();
        event.stopPropagation();

        if (destination === "routineJobsScreen" && period) {
            openRoutinePeriod(period);
            return;
        }

        showScreen(destination);
    });

    getElement("menuButton")?.addEventListener("click", () => {
        showScreen("modulesScreen");
    });

    getElement("notificationButton")?.addEventListener("click", () => {
        showScreen("remindersScreen");
    });

    document.addEventListener("click", event => {
        const button = event.target.closest("button");

        if (!button) return;

               if (
            button.closest(".nav-button") ||
            button.dataset.screen ||
            button.dataset.target ||
            button.dataset.go ||
            button.id
        ) return;

        const text = button.innerText.trim();

        if (navigateFromText(text)) {
            event.preventDefault();
        }
    });
}


/* =========================================================
   19. MODULE AND CATEGORY BUTTONS
========================================================= */

function connectModuleCards() {
    document.addEventListener("click", event => {
        const card = event.target.closest(
            ".module-card, .category-list button, .settings-list button"
        );

        if (!card) return;

        // Buttons with data-go are handled by connectNavigation()
        if (card.hasAttribute("data-go")) return;

        const text = card.innerText.trim();

        if (navigateFromText(text)) return;

        const lower = text.toLowerCase();

        if (lower.includes("daily")) {
            showScreen("dailyJobsScreen");
        } else if (lower.includes("weekly")) {
            openRoutinePeriod("Weekly");
        } else if (lower.includes("monthly")) {
            openRoutinePeriod("Monthly");
        } else if (lower.includes("quarterly")) {
            openRoutinePeriod("Quarterly");
        } else if (lower.includes("yearly")) {
            openRoutinePeriod("Yearly");
        } else if (lower.includes("port arrival")) {
            showScreen("portArrivalScreen");
        } else if (lower.includes("port departure")) {
            showScreen("portDepartureScreen");
        } else if (lower.includes("special job")) {
            showScreen("specialJobsScreen");
        } else if (lower.includes("turn over") || lower.includes("turnover")) {
            showScreen("turnoverScreen");
        } else if (lower.includes("contract")) {
            showScreen("contractScreen");
        } else if (lower.includes("emergency")) {
            showScreen("emergencyScreen");
        } else if (lower.includes("pre-boarding")) {
            showScreen("preboardingScreen");
        } else if (lower.includes("reminder")) {
            showScreen("remindersScreen");
        }
    });
}


/* =========================================================
   20. REPORT BUTTONS
========================================================= */

function connectReportButtons() {
    getElement("printReportButton")?.addEventListener("click", printReport);

    getElement("exportPDFButton")?.addEventListener("click", () => {
        showMessage("Use Print Report, then select Save as PDF in your browser's print options.");
        printReport();
    });

    getElement("generateReportButton")?.addEventListener("click", generateDateReport);
}


/* =========================================================
   21. MODAL BUTTONS
========================================================= */

function connectModal() {
    getElement("closeModalButton")?.addEventListener("click", closeModal);

    getElement("modalOverlay")?.addEventListener("click", event => {
        if (event.target.id === "modalOverlay") {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeModal();
    });
}


/* =========================================================
   22. BACKUP BUTTONS
========================================================= */

function connectBackup() {
    getElement("backupSettingsContainer")?.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        if (button.innerText.toLowerCase().includes("backup")) {
            exportData();
        }
    });
}


/* =========================================================
   23. START APPLICATION
========================================================= */

function startApplication() {
    console.log("KABARO: Starting...");

// Remove the five original preloaded Daily Jobs
const defaultDailyJobTitles = [
    "Bridge equipment check",
    "Engine room round",
    "GMDSS check",
    "Fire doors inspection",
    "Weather observation"
];

const originalJobCount = KABARO.jobs.length;

KABARO.jobs = KABARO.jobs.filter(job =>
    !(job.category === "daily" &&
      defaultDailyJobTitles.includes(job.title))
);

if (KABARO.jobs.length !== originalJobCount) {
    saveData();
}

// Do not automatically populate default jobs

    initializeSetup();
    getElement("editServiceDates")?.addEventListener("click", openServiceDateForm);
    connectAddButtons();
    connectSearch();
    connectNavigation();
    connectModuleCards();
    connectReportButtons();
    connectModal();
    connectBackup();

// Open KABARO directly without requiring profile setup
showMainApplication();

    renderProfileSettings();
    renderVesselSettings();
    renderThemeSettings();
    loadKabaroAppearance();

    console.log("KABARO: Ready.");
}


/* =========================================================
   24. INITIALIZE
========================================================= */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApplication);
} else {
    startApplication();
}
